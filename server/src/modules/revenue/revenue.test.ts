import { describe, it, expect, beforeEach } from 'vitest';
import { revenueService, RevenueService } from './revenue.service.js';
import { financialLedgerService, FinancialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { refundsService, RefundsService } from '../refunds/refunds.service.js';
import { FinancialAccountType } from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('Commercial 40/60 Revenue Sharing & Double-Entry Ledger Engine', () => {
  const orgId = 'org-metro-uni';
  const electionId = 'elec-paid-1';

  beforeEach(() => {
    RevenueService.resetState();
    FinancialLedgerService.resetState();
    RefundsService.resetState();
  });

  describe('1. Mathematical 40/60 Split & Rounding Precision', () => {
    it('should split exact 40/60 without floating point drift or single-cent loss', () => {
      // Gross: $100.00 = 10,000 cents
      // Processing fee: $1.50 = 150 cents
      // Approved deduction: $0.50 = 50 cents
      // Distributable: 10,000 - 200 = 9,800 cents
      // Platform Share (40%): 3,920 cents
      // Organiser Share (60%): 5,880 cents
      const split = revenueService.calculateSplit(10000, 150, 50);

      expect(split.distributableAmountCents).toBe(9800);
      expect(split.platformFeeCents).toBe(3920);
      expect(split.organiserFeeCents).toBe(5880);
      expect(split.platformFeeCents + split.organiserFeeCents).toBe(split.distributableAmountCents);
    });

    it('should guarantee Platform Share + Organiser Share === Distributable on uneven odd cent amounts', () => {
      // Test odd numbers where 40% has fractional cents (e.g. 99 cents, 133 cents, 1999 cents)
      const oddAmounts = [99, 133, 1001, 1999, 7777, 33333];

      for (const amount of oddAmounts) {
        const split = revenueService.calculateSplit(amount, 0, 0);
        // Organiser share must be exact remainder after platform share
        expect(split.platformFeeCents + split.organiserFeeCents).toBe(amount);
        expect(split.distributableAmountCents).toBe(amount);
        expect(split.platformFeeCents).toBe(Math.floor((amount * 40) / 100));
        expect(split.organiserFeeCents).toBe(amount - Math.floor((amount * 40) / 100));
      }
    });

    it('should reject non-integer or negative amounts', () => {
      expect(() => revenueService.calculateSplit(-100)).toThrow(AppError);
      expect(() => revenueService.calculateSplit(100.55 as unknown as number)).toThrow(AppError);
      expect(() => revenueService.calculateSplit(100, 200, 0)).toThrow(/cannot exceed gross payment/);
    });
  });

  describe('2. Revenue Allocation & Double-Entry Ledger Posting', () => {
    it('should allocate revenue, credit accounts, and produce balanced double-entry entries', async () => {
      const payment = {
        id: 'pay-tx-1001',
        organizationId: orgId,
        electionId,
        amountCents: 4500, // $45.00
        currency: 'USD'
      };

      const allocation = await revenueService.allocateRevenue(payment, {
        processingFeeCents: 100, // $1.00 gateway fee
        approvedDeductionCents: 0
      });

      // Distributable = 4500 - 100 = 4400 cents
      // Platform 40% = 1760 cents
      // Organiser 60% = 2640 cents
      expect(allocation.grossAmountCents).toBe(4500);
      expect(allocation.processingFeeCents).toBe(100);
      expect(allocation.distributableAmountCents).toBe(4400);
      expect(allocation.platformFeeCents).toBe(1760);
      expect(allocation.organiserFeeCents).toBe(2640);
      expect(allocation.status).toBe('ALLOCATED');

      // Verify Account Balances
      const orgTreasury = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(orgTreasury.availableBalance).toBe(2640);

      const platformTreasury = await financialLedgerService.getOrCreateAccount(
        null,
        FinancialAccountType.PLATFORM_TREASURY
      );
      expect(platformTreasury.availableBalance).toBe(1760);

      const processingEscrow = await financialLedgerService.getOrCreateAccount(
        null,
        FinancialAccountType.PROCESSING_FEES_ESCROW
      );
      expect(processingEscrow.availableBalance).toBe(100);

      // Verify Double-Entry Balance: sum(Debits) === sum(Credits)
      const audit = await financialLedgerService.verifyLedgerIntegrity();
      expect(audit.isBalanced).toBe(true);
      expect(audit.discrepancies.length).toBe(0);
    });

    it('should be strictly idempotent: duplicate allocation calls return existing record without double-crediting', async () => {
      const payment = {
        id: 'pay-tx-idempotent-2',
        organizationId: orgId,
        electionId,
        amountCents: 2000,
        currency: 'USD'
      };

      // 1st allocation
      const firstAlloc = await revenueService.allocateRevenue(payment, { processingFeeCents: 0 });
      const orgTreasuryBefore = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      const balanceBefore = orgTreasuryBefore.availableBalance;

      // 2nd identical allocation
      const secondAlloc = await revenueService.allocateRevenue(payment, { processingFeeCents: 0 });
      expect(secondAlloc.id).toBe(firstAlloc.id);

      const orgTreasuryAfter = await financialLedgerService.getOrCreateAccount(
        orgId,
        FinancialAccountType.ORGANIZER_TREASURY
      );
      expect(orgTreasuryAfter.availableBalance).toBe(balanceBefore);
    });
  });

  describe('3. Historical Commission Snapshots', () => {
    it('should maintain immutable historical split when future platform commission rates are altered', async () => {
      const payment1 = {
        id: 'pay-tx-hist-1',
        organizationId: orgId,
        electionId,
        amountCents: 10000, // $100.00
        currency: 'USD'
      };

      // Payment 1 under standard 40% platform rate
      const alloc1 = await revenueService.allocateRevenue(payment1, { processingFeeCents: 0 });
      expect(alloc1.platformRateBasisPoints).toBe(4000);
      expect(alloc1.platformFeeCents).toBe(4000);
      expect(alloc1.organiserFeeCents).toBe(6000);

      // Now change future platform rate to 45% (4500 basis points)
      revenueService.setGlobalPlatformCommissionRate(4500);

      const payment2 = {
        id: 'pay-tx-hist-2',
        organizationId: orgId,
        electionId,
        amountCents: 10000,
        currency: 'USD'
      };

      // Payment 2 under new 45% rate
      const alloc2 = await revenueService.allocateRevenue(payment2, { processingFeeCents: 0 });
      expect(alloc2.platformRateBasisPoints).toBe(4500);
      expect(alloc2.platformFeeCents).toBe(4500);
      expect(alloc2.organiserFeeCents).toBe(5500);

      // CRITICAL INVARIANT: Re-query Payment 1, its snapshot MUST remain 40% / 4000 cents!
      const recheckedAlloc1 = await revenueService.getAllocationByPaymentId(payment1.id);
      expect(recheckedAlloc1?.platformRateBasisPoints).toBe(4000);
      expect(recheckedAlloc1?.platformFeeCents).toBe(4000);
      expect(recheckedAlloc1?.organiserFeeCents).toBe(6000);
    });
  });

  describe('4. Full and Partial Refunds with Double-Entry Reversal', () => {
    it('should process a full refund and reverse platform and organiser shares', async () => {
      const payment = {
        id: 'pay-refund-full',
        organizationId: orgId,
        electionId,
        amountCents: 8000,
        currency: 'USD'
      };

      await revenueService.allocateRevenue(payment, { processingFeeCents: 0 });

      // Organiser had 60% = 4,800 cents
      // Platform had 40% = 3,200 cents
      const refund = await refundsService.processRefund(orgId, {
        paymentTransactionId: payment.id,
        reason: 'Event rescheduled'
      });

      expect(refund.type).toBe('FULL');
      expect(refund.refundAmountCents).toBe(8000);
      expect(refund.reversalPlatformCents).toBe(3200);
      expect(refund.reversalOrganiserCents).toBe(4800);

      // Accounts debited back to zero
      const orgTreasury = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(orgTreasury.availableBalance).toBe(0);

      const platformTreasury = await financialLedgerService.getOrCreateAccount(null, FinancialAccountType.PLATFORM_TREASURY);
      expect(platformTreasury.availableBalance).toBe(0);

      // Ledger integrity remains balanced
      const audit = await financialLedgerService.verifyLedgerIntegrity();
      expect(audit.isBalanced).toBe(true);
    });

    it('should process partial refunds proportionally without exceeding payment total', async () => {
      const payment = {
        id: 'pay-refund-part',
        organizationId: orgId,
        electionId,
        amountCents: 10000, // $100.00
        currency: 'USD'
      };

      await revenueService.allocateRevenue(payment, { processingFeeCents: 0 });

      // Partial refund 1: $40.00 (4,000 cents = 40%)
      const refund1 = await refundsService.processRefund(orgId, {
        paymentTransactionId: payment.id,
        amountCents: 4000,
        reason: 'Partial cancellation of 4 voter credits'
      });

      expect(refund1.type).toBe('PARTIAL');
      expect(refund1.refundAmountCents).toBe(4000);
      expect(refund1.reversalPlatformCents).toBe(1600); // 40% of 4000
      expect(refund1.reversalOrganiserCents).toBe(2400); // 60% of 4000

      // Partial refund 2: $60.00 (remaining 6,000 cents)
      const refund2 = await refundsService.processRefund(orgId, {
        paymentTransactionId: payment.id,
        amountCents: 6000,
        reason: 'Remaining refund'
      });

      expect(refund2.refundAmountCents).toBe(6000);
      expect(refund2.reversalPlatformCents).toBe(2400); // 40% of 6000
      expect(refund2.reversalOrganiserCents).toBe(3600); // 60% of 6000

      // Re-refunding beyond available should fail
      await expect(
        refundsService.processRefund(orgId, {
          paymentTransactionId: payment.id,
          amountCents: 500,
          reason: 'Excess refund'
        })
      ).rejects.toThrow(/already been fully refunded/);
    });
  });

  describe('5. Chargebacks & Dispute Reserve Accounting', () => {
    it('should move funds into dispute reserve escrow upon chargeback without deleting history', async () => {
      const payment = {
        id: 'pay-chargeback-1',
        organizationId: orgId,
        electionId,
        amountCents: 5000,
        currency: 'USD'
      };

      await revenueService.allocateRevenue(payment, { processingFeeCents: 0 });

      const cb = await refundsService.processChargeback(orgId, {
        paymentTransactionId: payment.id,
        amountCents: 3000, // Organiser share under dispute (60% of 5000)
        reason: 'Fraudulent card dispute reported by issuer'
      });

      expect(cb.status).toBe('UNDER_REVIEW');
      expect(cb.disputeAmountCents).toBe(3000);

      const orgTreasury = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.ORGANIZER_TREASURY);
      expect(orgTreasury.availableBalance).toBe(0); // 3000 debited from available balance

      const reserveEscrow = await financialLedgerService.getOrCreateAccount(orgId, FinancialAccountType.RESERVE_ESCROW);
      expect(reserveEscrow.reservedBalance).toBe(3000); // Held in reserve

      // Ledger must still balance
      const audit = await financialLedgerService.verifyLedgerIntegrity();
      expect(audit.isBalanced).toBe(true);
    });
  });

  describe('6. Organiser Earnings & Super Admin Metrics Reconciliation', () => {
    it('should reconcile organiser metrics with ledger entries and super admin aggregates', async () => {
      // Allocate 2 transactions
      await revenueService.allocateRevenue(
        {
          id: 'pay-rec-1',
          organizationId: orgId,
          electionId,
          amountCents: 10000,
          currency: 'USD'
        },
        { processingFeeCents: 200 }
      );

      await revenueService.allocateRevenue(
        {
          id: 'pay-rec-2',
          organizationId: orgId,
          electionId,
          amountCents: 5000,
          currency: 'USD'
        },
        { processingFeeCents: 100 }
      );

      // Organiser Metrics
      const orgMetrics = await revenueService.getOrganizerMetrics(orgId);
      expect(orgMetrics.grossSales).toBe(15000);
      expect(orgMetrics.processingFees).toBe(300);
      expect(orgMetrics.distributableAmount).toBe(14700);
      expect(orgMetrics.platformCommission).toBe(5880); // 40% of 14,700
      expect(orgMetrics.organiserEarnings).toBe(8820); // 60% of 14,700
      expect(orgMetrics.availableBalance).toBe(8820);

      // Super Admin Metrics
      const platformMetrics = await revenueService.getPlatformMetrics();
      expect(platformMetrics.totalPaymentVolume).toBe(15000);
      expect(platformMetrics.platformRevenue).toBe(5880);
      expect(platformMetrics.organiserLiabilities).toBe(8820);
      expect(platformMetrics.processingFees).toBe(300);
      expect(platformMetrics.isLedgerBalanced).toBe(true);
    });
  });
});
