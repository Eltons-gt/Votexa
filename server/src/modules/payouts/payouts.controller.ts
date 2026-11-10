import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { walletsService } from '../wallets/wallets.service.js';

export class PayoutsController {
  private static localPayouts: any[] = [
    {
      id: 'payout-1',
      organizationId: 'org-demo-1',
      amount: 50000,
      currency: 'USD',
      status: 'COMPLETED',
      destinationAccountId: 'acct_1234',
      createdAt: '2026-11-01T12:00:00.000Z'
    }
  ];

  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || 'org-demo-1';
    const payouts = PayoutsController.localPayouts.filter((p) => p.organizationId === orgId);
    sendSuccess(res, payouts, undefined, 200, req.requestId);
  }

  async requestPayout(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || 'org-demo-1';
    const amountCents = parseInt(req.body.amount, 10);

    // Atomically debit the tenant wallet with double-entry ledger entry
    const ledgerEntry = await walletsService.debitWallet(
      orgId,
      amountCents,
      `Institutional Payout to ${req.body.destinationAccountId || 'Connected Bank Account'}`,
      `payout-${Date.now()}`
    );

    const payout = {
      id: `payout-${Date.now()}`,
      organizationId: orgId,
      amount: amountCents,
      currency: 'USD',
      status: 'COMPLETED',
      destinationAccountId: req.body.destinationAccountId || 'Bank Account ending in 4192',
      ledgerEntryId: ledgerEntry.id,
      createdAt: new Date().toISOString()
    };

    PayoutsController.localPayouts.unshift(payout);
    sendSuccess(res, payout, undefined, 201, req.requestId);
  }
}
