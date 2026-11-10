import { describe, it, expect, beforeEach } from 'vitest';
import { mpesaClient } from './mpesa.client.js';
import { mpesaService, MpesaService } from './mpesa.service.js';
import { votingPackagesService } from '../voting/voting-packages.service.js';
import { voterWalletService } from '../voting/voter-wallet.service.js';
import { electionsService } from '../elections/elections.service.js';
import { walletsService } from '../wallets/wallets.service.js';
import {
  ElectionCategory,
  ElectionStatus,
  PaymentTransactionStatus,
  MpesaCallbackPayload
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('M-Pesa Payment Integration (Safaricom Daraja APIs)', () => {
  const orgId = 'org-metro-uni';
  const paidElectionId = 'elec-paid-1';
  const instElectionId = 'elec-inst-1';
  const testVoter = 'VTR-MPESA-TEST-99';

  beforeEach(async () => {
    MpesaService.resetState();
    mpesaClient.setSimulatedMode(true);
  });

  describe('Phone Number Validation & Normalization', () => {
    it('should normalize Kenyan phone numbers starting with 07 to 2547', () => {
      const normalized = mpesaClient.normalizePhoneNumber('0712345678');
      expect(normalized).toBe('254712345678');
    });

    it('should normalize Kenyan phone numbers starting with 01 to 2541', () => {
      const normalized = mpesaClient.normalizePhoneNumber('0112345678');
      expect(normalized).toBe('254112345678');
    });

    it('should normalize Kenyan phone numbers with +254 country code', () => {
      const normalized = mpesaClient.normalizePhoneNumber('+254 712 345 678');
      expect(normalized).toBe('254712345678');
    });

    it('should reject invalid or non-Kenyan phone numbers', () => {
      expect(() => mpesaClient.normalizePhoneNumber('12345')).toThrow(AppError);
      expect(() => mpesaClient.normalizePhoneNumber('0812345678')).toThrow(AppError);
      expect(() => mpesaClient.normalizePhoneNumber('+14155552671')).toThrow(AppError);
    });
  });

  describe('Election Rules & Payment Initiation Security', () => {
    it('should reject payment initiation for institutional elections', async () => {
      // Institutional elections do NOT support paid voting or credits
      await expect(
        mpesaService.initiatePayment(orgId, {
          electionId: instElectionId,
          packageId: 'pkg-1',
          voterCode: testVoter,
          phoneNumber: '0712345678'
        })
      ).rejects.toThrow(/Institutional elections do not support paid voting/);
    });

    it('should reject payment initiation if election is not ACTIVE', async () => {
      // Create a DRAFT election
      const draft = await electionsService.createElection(orgId, 'usr-test-admin', {
        category: ElectionCategory.PAID_COMPETITION,
        title: 'Draft Unopened Competition',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        isPaidVoting: true
      });

      const draftPkg = await votingPackagesService.createPackage(orgId, 'usr-test-admin', {
        electionId: draft.id,
        name: 'Pre-order Package',
        credits: 10,
        priceCents: 1000
      });

      await expect(
        mpesaService.initiatePayment(orgId, {
          electionId: draft.id,
          packageId: draftPkg.id,
          voterCode: testVoter,
          phoneNumber: '0712345678'
        })
      ).rejects.toThrow(/Election must be ACTIVE/);
    });

    it('should successfully initiate M-Pesa STK push and store PENDING transaction', async () => {
      const pkg = await votingPackagesService.getPackageById(orgId, paidElectionId, 'pkg-1');
      expect(pkg).toBeDefined();

      const res = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0712345678'
      });

      expect(res.paymentId).toMatch(/^pay-mpesa-/);
      expect(res.checkoutRequestId).toMatch(/^ws_CO_/);
      expect(res.merchantRequestId).toMatch(/^MR-/);
      expect(res.status).toBe(PaymentTransactionStatus.PENDING);

      // Verify transaction in pending state
      const queried = await mpesaService.getPayment(orgId, res.paymentId);
      expect(queried.status).toBe(PaymentTransactionStatus.PENDING);
      expect(queried.creditsIssued).toBe(false);
      expect(queried.phoneNumber).toBe('254712345678');
      expect(queried.amountCents).toBe(pkg.priceCents);
    });

    it('should generate distinct references for repeated payment initiations', async () => {
      const p1 = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0712345678'
      });

      const p2 = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0712345678'
      });

      expect(p1.paymentId).not.toBe(p2.paymentId);
      expect(p1.checkoutRequestId).not.toBe(p2.checkoutRequestId);
    });
  });

  describe('Callback Processing, Credit Issuance & Idempotency', () => {
    it('should verify successful payment callback and issue credits exactly once', async () => {
      // 1. Get initial wallet balance
      const walletBefore = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      const creditsBefore = walletBefore.creditsBalance;

      // 2. Initiate payment for pkg-2 (5 credits @ $4.50 = 585 KES)
      const pkg = await votingPackagesService.getPackageById(orgId, paidElectionId, 'pkg-2');
      const expectedKes = Math.round((pkg.priceCents / 100) * 130);

      const init = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-2',
        voterCode: testVoter,
        phoneNumber: '0722000000'
      });

      // 3. Construct Daraja success callback
      const receiptNumber = 'QWE9876543';
      const callbackPayload: MpesaCallbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: init.merchantRequestId,
            CheckoutRequestID: init.checkoutRequestId,
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: expectedKes },
                { Name: 'MpesaReceiptNumber', Value: receiptNumber },
                { Name: 'TransactionDate', Value: 20261110120000 },
                { Name: 'PhoneNumber', Value: 254722000000 }
              ]
            }
          }
        }
      };

      // 4. Process callback
      const processResult = await mpesaService.processCallback(callbackPayload);
      expect(processResult.success).toBe(true);
      expect(processResult.creditsIssued).toBe(true);

      // 5. Check transaction status
      const updatedTx = await mpesaService.getPayment(orgId, init.paymentId);
      expect(updatedTx.status).toBe(PaymentTransactionStatus.SUCCESS);
      expect(updatedTx.creditsIssued).toBe(true);
      expect(updatedTx.mpesaReceiptNumber).toBe(receiptNumber);

      // 6. Check voter wallet balance: increased by exactly pkg.credits (5)
      const walletAfter = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      expect(walletAfter.creditsBalance).toBe(creditsBefore + pkg.credits);

      // 7. Check treasury wallet received the revenue allocation
      const treasury = await walletsService.getWallet(orgId);
      expect(treasury.availableBalance).toBeGreaterThan(0);
    });

    it('should handle failed/cancelled payment without issuing credits', async () => {
      const walletBefore = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      const creditsBefore = walletBefore.creditsBalance;

      const init = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0722000000'
      });

      // Code 1032 = Request cancelled by user
      const failedPayload: MpesaCallbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: init.merchantRequestId,
            CheckoutRequestID: init.checkoutRequestId,
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user'
          }
        }
      };

      const processResult = await mpesaService.processCallback(failedPayload);
      expect(processResult.success).toBe(false);
      expect(processResult.creditsIssued).toBe(false);

      // Transaction marked FAILED
      const tx = await mpesaService.getPayment(orgId, init.paymentId);
      expect(tx.status).toBe(PaymentTransactionStatus.FAILED);
      expect(tx.creditsIssued).toBe(false);
      expect(tx.resultCode).toBe(1032);

      // Wallet balance must NOT have changed
      const walletAfter = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      expect(walletAfter.creditsBalance).toBe(creditsBefore);
    });

    it('should be strictly idempotent: duplicate callback replay must NOT issue credits twice', async () => {
      const init = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0722000000'
      });

      const receiptNumber = 'RPLY-100200300';
      const successPayload: MpesaCallbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: init.merchantRequestId,
            CheckoutRequestID: init.checkoutRequestId,
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 130 },
                { Name: 'MpesaReceiptNumber', Value: receiptNumber },
                { Name: 'PhoneNumber', Value: 254722000000 }
              ]
            }
          }
        }
      };

      // First callback processing
      const firstRun = await mpesaService.processCallback(successPayload);
      expect(firstRun.success).toBe(true);
      expect(firstRun.creditsIssued).toBe(true);

      const walletAfterFirst = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      const balanceAfterFirst = walletAfterFirst.creditsBalance;

      // Replay identical callback
      const secondRun = await mpesaService.processCallback(successPayload);
      expect(secondRun.success).toBe(true);
      expect(secondRun.duplicate).toBe(true);
      expect(secondRun.creditsIssued).toBe(false);

      // Verify wallet balance remained identical (no double credits!)
      const walletAfterSecond = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      expect(walletAfterSecond.creditsBalance).toBe(balanceAfterFirst);
    });

    it('should reject callback with incorrect/tampered amount and flag discrepancy', async () => {
      const walletBefore = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      const creditsBefore = walletBefore.creditsBalance;

      // Package pkg-3 is $16.00 = 2080 KES
      const init = await mpesaService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: 'pkg-3',
        voterCode: testVoter,
        phoneNumber: '0722000000'
      });

      // Callback claims success but paid only 10 KES instead of 2080 KES!
      const tamperedPayload: MpesaCallbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: init.merchantRequestId,
            CheckoutRequestID: init.checkoutRequestId,
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 10 }, // TAMPERED!
                { Name: 'MpesaReceiptNumber', Value: 'CHEAT-999' },
                { Name: 'PhoneNumber', Value: 254722000000 }
              ]
            }
          }
        }
      };

      const result = await mpesaService.processCallback(tamperedPayload);
      expect(result.success).toBe(false);
      expect(result.creditsIssued).toBe(false);

      // Transaction marked FAILED
      const tx = await mpesaService.getPayment(orgId, init.paymentId);
      expect(tx.status).toBe(PaymentTransactionStatus.FAILED);
      expect(tx.creditsIssued).toBe(false);

      // Zero credits issued
      const walletAfter = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, testVoter);
      expect(walletAfter.creditsBalance).toBe(creditsBefore);
    });

    it('should reject callback for unknown transaction reference', async () => {
      const unknownPayload: MpesaCallbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'UNKNOWN-MR-99',
            CheckoutRequestID: 'ws_CO_UNKNOWN_9999999',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 100 },
                { Name: 'MpesaReceiptNumber', Value: 'UNK-12345' }
              ]
            }
          }
        }
      };

      const result = await mpesaService.processCallback(unknownPayload);
      expect(result.success).toBe(false);
      expect(result.creditsIssued).toBe(false);
    });
  });

  describe('Tenant Isolation on Payment Transactions', () => {
    it('should not allow Organization B to view Organization A payment records', async () => {
      const init = await mpesaService.initiatePayment('org-metro-uni', {
        electionId: paidElectionId,
        packageId: 'pkg-1',
        voterCode: testVoter,
        phoneNumber: '0712345678'
      });

      // Org A can access
      const txA = await mpesaService.getPayment('org-metro-uni', init.paymentId);
      expect(txA.paymentId).toBe(init.paymentId);

      // Org B cannot access
      await expect(
        mpesaService.getPayment('org-competitor-99', init.paymentId)
      ).rejects.toThrow(AppError);
    });
  });
});
