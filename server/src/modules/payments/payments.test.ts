import { describe, it, expect } from 'vitest';
import { paymentsService } from './payments.service.js';
import { walletsService } from '../wallets/wallets.service.js';
import { LedgerEntryType } from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('Phase 2 Payment & Double-Entry Financial Ledger Engine', () => {
  const orgId = 'org-test-fin-1';

  it('should create a checkout session for a SaaS package tier', async () => {
    const session = await paymentsService.createCheckoutSession({
      organizationId: orgId,
      packageId: 'pkg-standard'
    });

    expect(session.sessionId).toMatch(/^cs_test_/);
    expect(session.amountCents).toBe(4900);
    expect(session.packageId).toBe('pkg-standard');
    expect(session.checkoutUrl).toContain(session.sessionId);
  });

  it('should confirm payment, credit wallet, and post an immutable double-entry ledger entry', async () => {
    const initialWallet = await walletsService.getWallet(orgId);
    const balanceBefore = initialWallet.availableBalance;

    const payment = await paymentsService.confirmPayment(orgId, 'pkg-standard');

    expect(payment).toBeDefined();
    expect(payment.amountCents).toBe(4900);
    expect(payment.status).toBe('COMPLETED');

    const updatedWallet = await walletsService.getWallet(orgId);
    expect(updatedWallet.availableBalance).toBe(balanceBefore + 4900);

    const ledger = await walletsService.getLedger(orgId);
    expect(ledger.length).toBeGreaterThan(0);
    expect(ledger[0].type).toBe(LedgerEntryType.CREDIT);
    expect(ledger[0].amount).toBe(4900);
    expect(ledger[0].balanceAfter).toBe(updatedWallet.availableBalance);
  });

  it('should debit wallet and post a ledger entry on payout', async () => {
    const wallet = await walletsService.getWallet(orgId);
    const balanceBefore = wallet.availableBalance;
    const payoutAmount = 2000; // $20.00

    const debitEntry = await walletsService.debitWallet(
      orgId,
      payoutAmount,
      'Institutional Withdrawal',
      'ref-payout-1'
    );

    expect(debitEntry.type).toBe(LedgerEntryType.DEBIT);
    expect(debitEntry.amount).toBe(payoutAmount);
    expect(debitEntry.balanceAfter).toBe(balanceBefore - payoutAmount);

    const updatedWallet = await walletsService.getWallet(orgId);
    expect(updatedWallet.availableBalance).toBe(balanceBefore - payoutAmount);
  });

  it('should reject overdraft with INSUFFICIENT_FUNDS (400)', async () => {
    const wallet = await walletsService.getWallet(orgId);
    const excessiveAmount = wallet.availableBalance + 100000;

    await expect(
      walletsService.debitWallet(orgId, excessiveAmount, 'Unauthorized overdraft')
    ).rejects.toThrowError(AppError);

    try {
      await walletsService.debitWallet(orgId, excessiveAmount, 'Unauthorized overdraft');
    } catch (err: any) {
      expect(err.code).toBe('INSUFFICIENT_FUNDS');
      expect(err.statusCode).toBe(400);
    }
  });
});

