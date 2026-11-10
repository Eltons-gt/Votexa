import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { revenueService } from './revenue.service.js';

export class RevenueController {
  async getOrganizerMetrics(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string) || 'org-metro-uni';
    const currency = (req.query.currency as string) || 'USD';
    const metrics = await revenueService.getOrganizerMetrics(orgId, currency);
    sendSuccess(res, metrics, undefined, 200, req.requestId);
  }

  async getPlatformMetrics(req: Request, res: Response): Promise<void> {
    const currency = (req.query.currency as string) || 'USD';
    const metrics = await revenueService.getPlatformMetrics(currency);
    sendSuccess(res, metrics, undefined, 200, req.requestId);
  }

  async listAllocations(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || (req.query.organizationId as string);
    const allocations = orgId
      ? await revenueService.listAllocations(orgId)
      : await revenueService.listAllAllocations();
    sendSuccess(res, allocations, undefined, 200, req.requestId);
  }
}

export const revenueController = new RevenueController();
