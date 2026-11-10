import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { paymentsService } from './payments.service.js';
import { mpesaService } from './mpesa.service.js';
import { mpesaB2CService } from './mpesa-b2c.service.js';
import { MpesaCallbackPayload, MpesaB2CCallbackPayload } from '@votexa/shared';

export class PaymentsController {
  // Existing SaaS package listing
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-demo-1';
    const electionId = req.query.electionId as string | undefined;
    const voterCode = req.query.voterCode as string | undefined;

    const mpesaTxs = await mpesaService.listTransactions(orgId, { electionId, voterCode });
    const saasPayments = await paymentsService.listPayments(orgId);

    sendSuccess(
      res,
      {
        transactions: mpesaTxs,
        saasPayments
      },
      undefined,
      200,
      req.requestId
    );
  }

  // 1. POST /api/v1/payments/initiate
  async initiateMpesaPayment(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || req.body.organizationId || 'org-metro-uni';
    const result = await mpesaService.initiatePayment(orgId, {
      electionId: req.body.electionId,
      packageId: req.body.packageId,
      voterCode: req.body.voterCode,
      phoneNumber: req.body.phoneNumber
    });

    sendSuccess(res, result, undefined, 201, req.requestId);
  }

  // 2. GET /api/v1/payments/:id
  async getPaymentById(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-metro-uni';
    const paymentId = req.params.id as string;
    const payment = await mpesaService.getPayment(orgId, paymentId);

    sendSuccess(res, payment, undefined, 200, req.requestId);
  }

  // 3. POST /api/v1/webhooks/mpesa
  async handleMpesaCallback(req: Request, res: Response): Promise<void> {
    const payload = req.body as MpesaCallbackPayload;
    const result = await mpesaService.processCallback(payload);

    // Daraja expects a JSON response with ResultCode 0 to acknowledge receipt
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
      ...result
    });
  }

  // 4. POST /api/v1/webhooks/mpesa/b2c-result
  async handleMpesaB2CResult(req: Request, res: Response): Promise<void> {
    const payload = req.body as MpesaB2CCallbackPayload;
    const result = await mpesaB2CService.processB2CResult(payload);

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'B2C Callback processed successfully',
      ...result
    });
  }

  // 5. POST /api/v1/webhooks/mpesa/b2c-timeout
  async handleMpesaB2CTimeout(req: Request, res: Response): Promise<void> {
    await mpesaB2CService.processB2CTimeout(req.body);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'B2C Timeout acknowledged'
    });
  }

  // Existing SaaS checkout session
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

  // Existing SaaS confirm payment
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

export const paymentsController = new PaymentsController();
