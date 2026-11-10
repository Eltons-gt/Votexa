import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { refundsService } from './refunds.service.js';

export class RefundsController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-metro-uni';
    const refunds = await refundsService.listRefunds(orgId);
    sendSuccess(res, refunds, undefined, 200, req.requestId);
  }

  async requestRefund(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-metro-uni';
    const userId = req.user?.id;
    const refund = await refundsService.processRefund(
      orgId,
      {
        paymentTransactionId: req.body.paymentTransactionId,
        amountCents: req.body.amountCents ? parseInt(req.body.amountCents, 10) : undefined,
        reason: req.body.reason,
        voterCode: req.body.voterCode
      },
      userId
    );

    sendSuccess(res, refund, undefined, 201, req.requestId);
  }

  async processChargeback(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-metro-uni';
    const chargeback = await refundsService.processChargeback(orgId, {
      paymentTransactionId: req.body.paymentTransactionId,
      amountCents: parseInt(req.body.amountCents, 10),
      reason: req.body.reason
    });

    sendSuccess(res, chargeback, undefined, 201, req.requestId);
  }
}

export const refundsController = new RefundsController();
