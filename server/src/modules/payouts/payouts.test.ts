import { describe, it, expect, beforeEach } from 'vitest';
import { payoutsService, PayoutsService } from './payouts.service.js';
import { financialLedgerService, FinancialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { revenueService, RevenueService } from '../revenue/revenue.service.js';
import {
  PayoutStatus,
  PayoutMethod,
  FinancialAccountType
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('Organiser Payouts & Withdrawal Management Engine', () => {
  const orgId = 'org-metro-uni';
  const organizerUserId = 'usr-organizer-alice';
  const adminUserId = 'usr-super-admin-bob';

  beforeEach(async () => {
    PayoutsService.resetState();
    FinancialLedgerService.resetState();
    RevenueService.resetState();

    // Seed Treasury with verified revenue earnings
    // $1,000.00 gross payment -> 40% platform ($400) / 60% organiser ($600 = 60,000 cents)
    await revenueService.allocateRevenue(
      {
        id: 'pay-seed-1',
        organizationId: orgId,
        electionId: 'elec-paid-1',
        amountCents: 100000,
        currency: 'USD'
      },
      { processingFeeCents: 0 }
    );
  });

  describe('1. Available Balance Validation & Anti-Overdraw', () => {
    it('should reject payout request when requested amount exceeds available balance', async () => {
      const orgTreasury = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(orgTreasury.availableBalance).toBe(60000); // $600.00

      // Attempt to withdraw $700.00 (70,000 cents)
      await expect(
        payoutsService.requestWithdrawal(orgId, organizerUserId, {
          amountCents: 70000,
          method: PayoutMethod.MPESA_B2C,
          destinationDetails: { phoneNumber: '0712345678' }
        })
      ).rejects.toThrow(/Insufficient available earnings/);

      // Verify available balance remains untouched
      const rechecked = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(rechecked.availableBalance).toBe(60000);
      expect(rechecked.reservedBalance).toBe(0);
    });

    it('should enforce minimum withdrawal threshold', async () => {
      // Attempt to withdraw $5.00 (500 cents) below minimum $10.00 (1000 cents)
      await expect(
        payoutsService.requestWithdrawal(orgId, organizerUserId, {
          amountCents: 500,
          method: PayoutMethod.MPESA_B2C,
          destinationDetails: { phoneNumber: '0712345678' }
        })
      ).rejects.toThrow(/Minimum withdrawal amount is \$10\.00/);
    });
  });

  describe('2. Two-Phase Balance Reservation & Anti-Double-Spend', () => {
    it('should reserve funds upon request without permanent deduction', async () => {
      const withdrawalAmount = 25000; // $250.00

      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: withdrawalAmount,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      expect(payout.id).toMatch(/^pot-/);
      expect(payout.status).toBe(PayoutStatus.RESERVED);
      expect(payout.amountCents).toBe(withdrawalAmount);
      expect(payout.netAmountCents).toBe(withdrawalAmount - 50); // Less $0.50 M-Pesa fee
      expect(payout.destinationDetails.phoneNumber).toBe('254712345678');

      // Verify Account Balances:
      // Available: 60,000 - 25,000 = 35,000 cents
      // Reserved: 25,000 cents
      // Total funds in treasury remain $600.00!
      const orgTreasury = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(orgTreasury.availableBalance).toBe(35000);
      expect(orgTreasury.reservedBalance).toBe(25000);

      // Verify reservation record
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.reservation).toBeDefined();
      expect(details.reservation?.status).toBe('ACTIVE');
      expect(details.reservation?.amountCents).toBe(withdrawalAmount);
    });

    it('should reject duplicate in-flight payout requests', async () => {
      const withdrawalAmount = 20000;

      await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: withdrawalAmount,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      // Repeat request with exact same amount while first is pending
      await expect(
        payoutsService.requestWithdrawal(orgId, organizerUserId, {
          amountCents: withdrawalAmount,
          method: PayoutMethod.MPESA_B2C,
          destinationDetails: { phoneNumber: '0712345678' }
        })
      ).rejects.toThrow(/already pending review/);
    });

    it('should handle concurrent withdrawal requests and prevent over-reservation', async () => {
      // Balance is 60,000 cents
      // Request 1: 40,000 cents (succeeds, leaves 20,000 available)
      await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 40000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      // Request 2: 30,000 cents (must fail because only 20,000 is available!)
      await expect(
        payoutsService.requestWithdrawal(orgId, organizerUserId, {
          amountCents: 30000,
          method: PayoutMethod.BANK_TRANSFER,
          destinationDetails: {
            accountNumber: '1122334455',
            accountName: 'Metropolitan Union',
            bankName: 'Equity Bank'
          }
        })
      ).rejects.toThrow(/Insufficient available earnings/);

      // Verify exact balance state
      const orgTreasury = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(orgTreasury.availableBalance).toBe(20000);
      expect(orgTreasury.reservedBalance).toBe(40000);
    });
  });

  describe('3. Separation of Duties & Administrative Review', () => {
    it('should prevent an administrator from reviewing/approving their own withdrawal request', async () => {
      // Admin requests withdrawal
      const adminPayout = await payoutsService.requestWithdrawal(orgId, adminUserId, {
        amountCents: 15000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0722000000' }
      });

      // Admin attempts to approve their own request -> MUST BE FORBIDDEN
      await expect(
        payoutsService.reviewPayout(adminPayout.id, adminUserId, 'APPROVE')
      ).rejects.toThrow(/Separation of duties violation: An administrator cannot review or approve their own withdrawal request/);

      // Payout remains in RESERVED status
      const p = await payoutsService.getPayout(orgId, adminPayout.id);
      expect(p.payout.status).toBe(PayoutStatus.RESERVED);
    });

    it('should allow another administrator to approve the request', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 15000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      const approved = await payoutsService.reviewPayout(payout.id, adminUserId, 'APPROVE', 'Bank details verified');
      expect(approved.status).toBe(PayoutStatus.APPROVED);
      expect(approved.reviewedBy).toBe(adminUserId);

      // Check audit log
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.auditLogs.some((l) => l.action === 'PAYOUT_APPROVED')).toBe(true);
    });

    it('should release reservation back to available balance when administrator rejects payout', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 20000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      // Before rejection: 40,000 available, 20,000 reserved
      const before = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(before.availableBalance).toBe(40000);
      expect(before.reservedBalance).toBe(20000);

      // Admin rejects
      const rejected = await payoutsService.reviewPayout(
        payout.id,
        adminUserId,
        'REJECT',
        'Suspicious destination phone number'
      );
      expect(rejected.status).toBe(PayoutStatus.REJECTED);
      expect(rejected.rejectionReason).toBe('Suspicious destination phone number');

      // After rejection: 60,000 available, 0 reserved! Funds fully restored!
      const after = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(after.availableBalance).toBe(60000);
      expect(after.reservedBalance).toBe(0);

      // Reservation record released
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.reservation?.status).toBe('RELEASED');
      expect(details.auditLogs.some((l) => l.action === 'PAYOUT_REJECTED')).toBe(true);
    });
  });

  describe('4. Settlement Evidence & Anti-Double-Settlement', () => {
    it('should reject settlement without valid evidence', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 10000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      await payoutsService.reviewPayout(payout.id, adminUserId, 'APPROVE');

      // Attempt to settle with empty evidence
      await expect(
        payoutsService.recordSettlement(payout.id, adminUserId, {
          settlementEvidence: ''
        })
      ).rejects.toThrow(/Settlement evidence is mandatory/);
    });

    it('should verify settlement, clear reservation, and update double-entry ledger', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 30000, // $300.00
        method: PayoutMethod.BANK_TRANSFER,
        destinationDetails: {
          accountNumber: '9988776655',
          accountName: 'Metropolitan Talent Organizers',
          bankName: 'Standard Chartered'
        }
      });

      await payoutsService.reviewPayout(payout.id, adminUserId, 'APPROVE');

      const settlementEvidence = 'WIRE-REF-992019-STANBIC-FEDWIRE';
      const settled = await payoutsService.recordSettlement(payout.id, adminUserId, {
        settlementEvidence,
        providerReference: 'FEDWIRE-TX-5544',
        notes: 'Disbursed via automated wire batch'
      });

      expect(settled.status).toBe(PayoutStatus.PAID);
      expect(settled.settlementEvidence).toBe(settlementEvidence);
      expect(settled.settledAt).toBeDefined();

      // Check Treasury Balances:
      // Reserved balance cleared to 0
      // Available balance is 30,000 (60,000 initial - 30,000 paid)
      const orgTreasury = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(orgTreasury.availableBalance).toBe(30000);
      expect(orgTreasury.reservedBalance).toBe(0);

      // Verify double-entry ledger is balanced!
      const audit = await financialLedgerService.verifyLedgerIntegrity();
      expect(audit.isBalanced).toBe(true);
    });

    it('should prevent double settlement of the same payout', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 10000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      await payoutsService.reviewPayout(payout.id, adminUserId, 'APPROVE');

      // 1st Settlement
      await payoutsService.recordSettlement(payout.id, adminUserId, {
        settlementEvidence: 'MPESA-B2C-RECEIPT-OK-1'
      });

      // 2nd Repeated Settlement -> Must be rejected!
      await expect(
        payoutsService.recordSettlement(payout.id, adminUserId, {
          settlementEvidence: 'MPESA-B2C-RECEIPT-OK-1'
        })
      ).rejects.toThrow(/already been verified and settled/);
    });
  });

  describe('5. Payout Failure & Reservation Restitution', () => {
    it('should release reservation back to available balance when payout fails during disbursement', async () => {
      const payout = await payoutsService.requestWithdrawal(orgId, organizerUserId, {
        amountCents: 18000,
        method: PayoutMethod.MPESA_B2C,
        destinationDetails: { phoneNumber: '0712345678' }
      });

      await payoutsService.reviewPayout(payout.id, adminUserId, 'APPROVE');

      // Disbursement provider error (e.g. M-Pesa B2C invalid MSISDN or recipient unreachable)
      const failed = await payoutsService.failPayout(
        payout.id,
        'M-Pesa B2C Error: Recipient subscriber account is inactive',
        adminUserId
      );

      expect(failed.status).toBe(PayoutStatus.FAILED);
      expect(failed.rejectionReason).toContain('inactive');

      // Funds must be completely restored to available balance
      const orgTreasury = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(orgTreasury.availableBalance).toBe(60000);
      expect(orgTreasury.reservedBalance).toBe(0);

      // Check audit log
      const details = await payoutsService.getPayout(orgId, payout.id);
      expect(details.auditLogs.some((l) => l.action === 'PAYOUT_FAILED')).toBe(true);
    });
  });
});
