import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { paymentsService } from './payments.service.js';

export class PaymentsController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || 'org-demo-1';
    const payments = await paymentsService.listPayments(orgId);
    sendSuccess(res, payments, undefined, 200, req.requestId);
  }

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-demo-1';
    const session = await paymentsService.createCheckoutSession({
      packageId: req.body.packageId,
      organizationId: orgId,
      successUrl: req.body.successUrl,
      cancelUrl: req.body.cancelUrl
    });

    sendSuccess(res, session, undefined, 200, req.requestId);
  }

  async confirmPayment(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-demo-1';
    const transaction = await paymentsService.confirmPayment(
      orgId,
      req.body.packageId,
      req.body.sessionId
    );

    sendSuccess(res, transaction, undefined, 201, req.requestId);
  }
}
