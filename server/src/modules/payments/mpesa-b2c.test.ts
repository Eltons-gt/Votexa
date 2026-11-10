import { describe, it, expect, beforeEach } from 'vitest';
import {
  PayoutStatus,
  PayoutMethod,
  MpesaB2CDisbursementStatus,
  MpesaB2CCallbackPayload
} from '@votexa/shared';
import { mpesaB2CService, MpesaB2CService } from './mpesa-b2c.service.js';
import { payoutsService, PayoutsService } from '../payouts/payouts.service.js';
import { financialLedgerService, FinancialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { mpesaClient } from './mpesa.client.js';

describe('Safaricom Daraja M-Pesa B2C Automated Disbursement Engine', () => {
  const orgId = 'org-b2c-test';
  const organizerUserId = 'usr-organizer-alice';
  const superAdminUserId = 'usr-superadmin-bob';

  beforeEach(async () => {
    FinancialLedgerService.resetState();
    PayoutsService.resetState();
    MpesaB2CService.resetState();
    mpesaClient.setSimulatedMode(true);

    // Seed Treasury with $500.00 (50,000 cents) available balance
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: orgId,
      referenceType: 'PAYOUT_RESERVE',
      referenceId: 'seed-b2c-treasury',
      description: 'Initial seed treasury balance for B2C testing',
      entries: [
        {
          accountId: (await financialLedgerService.getOrCreateAccount(orgId, 'ORGANIZER_TREASURY' as any, 'USD')).id,
          direction: 'CREDIT' as any,
          amountCents: 50000,
          description: 'Seed available treasury balance'
        },
        {
          accountId: (await financialLedgerService.getOrCreateAccount(null, 'PLATFORM_TREASURY' as any, 'USD')).id,
          direction: 'DEBIT' as any,
          amountCents: 50000,
          description: 'Platform clearing offset'
        }
      ]
    });
  });

  // --- Helper: Create approved M-Pesa withdrawal request ---
  async function createApprovedMpesaPayout(amountCents: number = 10000, phone: string = '254712345678') {
    // 1. Submit request (funds reserved)
    const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
      amountCents,
      method: PayoutMethod.MPESA_B2C,
      destinationDetails: {
        phoneNumber: phone,
        accountName: 'Alice Organizer'
      }
    });

    // 2. Admin approves request
    const approved = await payoutsService.reviewPayout(payout.id, superAdminUserId, 'APPROVE');
    return approved;
  }

  describe('1. Pre-Disbursement Validation & Invariants', () => {
    it('strictly enforces separation of duties: admin cannot disburse their own payout', async () => {
      // Create payout requested by superAdminUserId
      const payout = await payoutsService.requestWithdrawal(orgId, superAdminUserId, {
        amountCents: 5000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '254722000000', accountName: 'Self Payout' }
      });

      // Another admin reviews & approves it
      await payoutsService.reviewPayout(payout.id, 'usr-different-admin', 'APPROVE');

      // But superAdminUserId attempts to execute the disbursement
      await expect(
        mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId)
      ).rejects.toThrow(/Separation of Duties Violation/);
    });

    it('rejects B2C disbursement for non-M-Pesa payout methods (e.g. Bank Wire)', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 15000,
        method: PayoutMethod.BANK_TRANSFER,
        destinationDetails: {
          bankName: 'Standard Chartered',
          accountNumber: '0102938475600',
          accountName: 'Alice Council'
        }
      });

      await payoutsService.reviewPayout(payout.id, superAdminUserId, 'APPROVE');

      await expect(
        mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId)
      ).rejects.toThrow(/only permitted for MPESA_B2C payouts/);
    });

    it('rejects B2C disbursement if payout has not been approved', async () => {
      // Payout is in REQUESTED state, not approved
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 5000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '254712345678' }
      });

      await expect(
        mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId)
      ).rejects.toThrow(/Payout must be APPROVED prior to B2C disbursement/);
    });

    it('rejects B2C disbursement if payout is already paid and settled', async () => {
      const payout = await createApprovedMpesaPayout(5000);

      // Settle manually first
      await payoutsService.recordSettlement(payout.id, superAdminUserId, {
        settlementEvidence: 'WIRE-PRIOR-991'
      });

      await expect(
        mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId)
      ).rejects.toThrow(/already been paid and settled/);
    });
  });

  describe('2. B2C Dispatch Execution & State Transitions', () => {
    it('initiates Daraja B2C disbursement, transitions payout to PROCESSING, and records in-flight entry', async () => {
      const payout = await createApprovedMpesaPayout(10000, '0712345678'); // $100.00 gross -> Net $99.50 (9950 cents)

      const res = await mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId);

      expect(res.payoutId).toBe(payout.id);
      expect(res.conversationId).toMatch(/^AG_/);
      expect(res.originatorConversationId).toMatch(/^ORIG_/);
      expect(res.recipientPhone).toBe('254712345678'); // Normalized from 07...
      expect(res.amountKes).toBe(Math.round((9950 / 100) * 130)); // Net amount converted to KES

      // Verify payout status transitioned to PROCESSING
      const updatedPayout = await payoutsService.getPayoutRecord(payout.id);
      expect(updatedPayout?.status).toBe(PayoutStatus.PROCESSING);

      // Verify audit trail logged
      const { auditLogs } = await payoutsService.getPayout(orgId, payout.id);
      const b2cLog = auditLogs.find((l) => l.action === 'PAYOUT_B2C_DISPATCHED');
      expect(b2cLog).toBeDefined();
      expect(b2cLog?.toStatus).toBe(PayoutStatus.PROCESSING);
      expect(b2cLog?.notes).toContain(res.conversationId);

      // Verify disbursement table record
      const disbursements = await mpesaB2CService.listDisbursements(orgId, payout.id);
      expect(disbursements).toHaveLength(1);
      expect(disbursements[0].status).toBe(MpesaB2CDisbursementStatus.INITIATED);
      expect(disbursements[0].conversationId).toBe(res.conversationId);
    });

    it('prevents double-dispatch while an initial disbursement is already in flight', async () => {
      const payout = await createApprovedMpesaPayout(5000);

      // Dispatch once
      await mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId);

      // Attempt to dispatch a second time
      await expect(
        mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId)
      ).rejects.toThrow(/already in flight/);
    });
  });

  describe('3. Asynchronous Daraja Callback Processing (Settlement & Reversal)', () => {
    it('processes successful B2C Result callback (ResultCode === 0): marks payout PAID and clears reservation', async () => {
      const payout = await createApprovedMpesaPayout(10000, '254712345678');
      const dispatch = await mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId);

      // Construct realistic Safaricom B2C Result Callback payload
      const callbackPayload: MpesaB2CCallbackPayload = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          OriginatorConversationID: dispatch.originatorConversationId,
          ConversationID: dispatch.conversationId,
          TransactionID: 'NLX88921KL',
          ResultParameters: {
            ResultParameter: [
              { Key: 'TransactionAmount', Value: dispatch.amountKes },
              { Key: 'TransactionReceipt', Value: 'NLX88921KL' },
              { Key: 'ReceiverPartyPublicName', Value: '254712345678 - Alice Organizer' },
              { Key: 'TransactionCompletedDateTime', Value: '10.11.2026 14:30:00' },
              { Key: 'B2CUtilityAccountAvailableFunds', Value: 500000.0 }
            ]
          }
        }
      };

      const result = await mpesaB2CService.processB2CResult(callbackPayload);

      expect(result.processed).toBe(true);
      expect(result.status).toBe('SETTLED');
      expect(result.receipt).toBe('NLX88921KL');

      // Verify payout is now PAID with settlement evidence
      const settledPayout = await payoutsService.getPayoutRecord(payout.id);
      expect(settledPayout?.status).toBe(PayoutStatus.PAID);
      expect(settledPayout?.settlementEvidence).toBe('NLX88921KL');
      expect(settledPayout?.settledAt).toBeDefined();

      // Verify reservation is settled and cleared
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.reservation?.status).toBe('SETTLED');

      // Verify disbursement record updated to SUCCESS
      const disbursements = await mpesaB2CService.listDisbursements(orgId, payout.id);
      expect(disbursements[0].status).toBe(MpesaB2CDisbursementStatus.SUCCESS);
      expect(disbursements[0].transactionId).toBe('NLX88921KL');
      expect(disbursements[0].resultCode).toBe(0);
    });

    it('enforces callback idempotency: ignores duplicate B2C callbacks', async () => {
      const payout = await createApprovedMpesaPayout(5000);
      const dispatch = await mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId);

      const callbackPayload: MpesaB2CCallbackPayload = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'Success',
          OriginatorConversationID: dispatch.originatorConversationId,
          ConversationID: dispatch.conversationId,
          TransactionID: 'NLX111222'
        }
      };

      // First callback
      const res1 = await mpesaB2CService.processB2CResult(callbackPayload);
      expect(res1.processed).toBe(true);

      // Second duplicate callback
      const res2 = await mpesaB2CService.processB2CResult(callbackPayload);
      expect(res2.processed).toBe(false);
      expect(res2.status).toBe('IGNORED');
    });

    it('handles failed B2C callback (ResultCode !== 0): marks payout FAILED and immediately restores reserved funds', async () => {
      const initialTreasury = await financialLedgerService.getOrCreateAccount(orgId, 'ORGANIZER_TREASURY' as any, 'USD');
      const startAvailable = initialTreasury.availableBalance;

      // Request $80.00 withdrawal (8000 cents)
      const payout = await createApprovedMpesaPayout(8000);

      // After reservation, available should be startAvailable - 8000
      const afterReserveTreasury = await financialLedgerService.getOrCreateAccount(orgId, 'ORGANIZER_TREASURY' as any, 'USD');
      expect(afterReserveTreasury.availableBalance).toBe(startAvailable - 8000);
      expect(afterReserveTreasury.reservedBalance).toBe(8000);

      // Dispatch B2C
      const dispatch = await mpesaB2CService.dispatchDisbursement(payout.id, superAdminUserId);

      // Simulate failure callback from Safaricom (e.g. Code 2001: Insufficient utility float or invalid subscriber)
      const failurePayload: MpesaB2CCallbackPayload = {
        Result: {
          ResultType: 0,
          ResultCode: 2001,
          ResultDesc: 'The initiator has insufficient funds in utility account.',
          OriginatorConversationID: dispatch.originatorConversationId,
          ConversationID: dispatch.conversationId
        }
      };

      const result = await mpesaB2CService.processB2CResult(failurePayload);

      expect(result.processed).toBe(true);
      expect(result.status).toBe('FAILED');
      expect(result.reason).toContain('insufficient funds');

      // Verify payout marked FAILED
      const failedPayout = await payoutsService.getPayoutRecord(payout.id);
      expect(failedPayout?.status).toBe(PayoutStatus.FAILED);
      expect(failedPayout?.rejectionReason).toContain('insufficient funds');

      // CRITICAL VERIFICATION: Reserved funds must be restored to available balance!
      const finalTreasury = await financialLedgerService.getOrCreateAccount(orgId, 'ORGANIZER_TREASURY' as any, 'USD');
      expect(finalTreasury.availableBalance).toBe(startAvailable); // Restored!
      expect(finalTreasury.reservedBalance).toBe(0); // Cleared!

      // Verify reservation marked RELEASED
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.reservation?.status).toBe('RELEASED');
    });

    it('gracefully handles unsolicited or unknown callback references', async () => {
      const unknownPayload: MpesaB2CCallbackPayload = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'Success',
          OriginatorConversationID: 'ORIG_UNKNOWN_99999',
          ConversationID: 'AG_UNKNOWN_99999'
        }
      };

      const res = await mpesaB2CService.processB2CResult(unknownPayload);
      expect(res.processed).toBe(false);
      expect(res.status).toBe('IGNORED');
      expect(res.reason).toBe('Unknown conversation reference');
    });
  });
});
