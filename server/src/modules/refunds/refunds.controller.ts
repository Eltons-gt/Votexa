import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class RefundsController {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, []);
  }

  async requestRefund(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'ref-1',
        paymentId: req.body.paymentId,
        amount: req.body.amount,
        status: 'SUBMITTED',
        message: 'Refund request registered for processing'
      },
      undefined,
      201
    );
  }
}
