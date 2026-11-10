import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { payoutsService } from './payouts.service.js';
import { mpesaB2CService } from '../payments/mpesa-b2c.service.js';
import { PayoutStatus } from '@votexa/shared';

export class PayoutsController {
  // 1. Submit withdrawal request
  async requestPayout(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-metro-uni';
    const userId = req.user?.id || req.body.userId || 'usr-organizer-1';

    const payout = await payoutsService.requestWithdrawal(orgId, userId, {
      amountCents: parseInt(req.body.amountCents, 10),
      method: req.body.method,
      destinationDetails: req.body.destinationDetails,
      payoutAccountId: req.body.payoutAccountId,
      currency: req.body.currency
    });

    sendSuccess(res, payout, undefined, 201, req.requestId);
  }

  // 2. List payouts
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string);
    const status = req.query.status as PayoutStatus | undefined;
    const payouts = await payoutsService.listPayouts(orgId, { status });
    sendSuccess(res, payouts, undefined, 200, req.requestId);
  }

  // 3. Get single payout with audit log
  async getPayout(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-metro-uni';
    const payoutId = req.params.id as string;
    const details = await payoutsService.getPayout(orgId, payoutId);
    sendSuccess(res, details, undefined, 200, req.requestId);
  }

  // 4. Admin Review: Approve or Reject
  async reviewPayout(req: Request, res: Response): Promise<void> {
    const payoutId = req.params.id as string;
    const adminUserId = req.user?.id || req.body.adminUserId || 'usr-super-admin';
    const action = req.body.action as 'APPROVE' | 'REJECT';
    const reason = req.body.reason as string | undefined;

    const payout = await payoutsService.reviewPayout(payoutId, adminUserId, action, reason);
    sendSuccess(res, payout, undefined, 200, req.requestId);
  }

  // 5. Admin Settlement: Record settlement evidence and mark PAID
  async settlePayout(req: Request, res: Response): Promise<void> {
    const payoutId = req.params.id as string;
    const adminUserId = req.user?.id || req.body.adminUserId || 'usr-super-admin';
    const { settlementEvidence, providerReference, notes } = req.body;

    const payout = await payoutsService.recordSettlement(payoutId, adminUserId, {
      settlementEvidence,
      providerReference,
      notes
    });

    sendSuccess(res, payout, undefined, 200, req.requestId);
  }

  // 6. Save destination account
  async saveAccount(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-metro-uni';
    const acc = await payoutsService.savePayoutAccount(orgId, req.body);
    sendSuccess(res, acc, undefined, 201, req.requestId);
  }

  // 7. List destination accounts
  async listAccounts(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-metro-uni';
    const accounts = await payoutsService.listPayoutAccounts(orgId);
    sendSuccess(res, accounts, undefined, 200, req.requestId);
  }

  // 8. Admin automated M-Pesa B2C disbursement
  async disburseMpesaB2C(req: Request, res: Response): Promise<void> {
    const payoutId = req.params.id as string;
    const adminUserId = req.user?.id || req.body.adminUserId || 'usr-super-admin';
    const { commandId, remarks } = req.body;

    const result = await mpesaB2CService.dispatchDisbursement(payoutId, adminUserId, {
      commandId,
      remarks
    });

    sendSuccess(res, result, undefined, 200, req.requestId);
  }

  // 9. List B2C disbursement records for a payout
  async listDisbursements(req: Request, res: Response): Promise<void> {
    const payoutId = req.params.id as string;
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string);
    const records = await mpesaB2CService.listDisbursements(orgId, payoutId);
    sendSuccess(res, records, undefined, 200, req.requestId);
  }
}

export const payoutsController = new PayoutsController();
