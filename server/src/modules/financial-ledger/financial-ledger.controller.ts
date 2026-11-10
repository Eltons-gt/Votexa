import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { financialLedgerService } from './financial-ledger.service.js';

export class FinancialLedgerController {
  async listEntries(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string);
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const entries = await financialLedgerService.listEntries(orgId, limit);
    sendSuccess(res, entries, undefined, 200, req.requestId);
  }

  async listAccounts(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string);
    const accounts = await financialLedgerService.listAccounts(orgId);
    sendSuccess(res, accounts, undefined, 200, req.requestId);
  }

  async verifyIntegrity(req: Request, res: Response): Promise<void> {
    const audit = await financialLedgerService.verifyLedgerIntegrity();
    sendSuccess(res, audit, undefined, 200, req.requestId);
  }
}

export const financialLedgerController = new FinancialLedgerController();
