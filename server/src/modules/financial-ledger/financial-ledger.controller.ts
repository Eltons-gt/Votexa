import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { walletsService } from '../wallets/wallets.service.js';

export class FinancialLedgerController {
  async listEntries(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || 'org-demo-1';
    const ledger = await walletsService.getLedger(orgId);
    sendSuccess(res, ledger, undefined, 200, req.requestId);
  }
}
