import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { reportsService } from './reports.service.js';
import { SystemRole, PlatformRole } from '@votexa/shared';

export class ReportsController {
  async generateReport(req: Request, res: Response): Promise<void> {
    const isPlatformAdmin =
      req.user?.systemRole === SystemRole.SUPER_ADMIN ||
      req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) ||
      req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) ||
      false;

    // Cross-tenant guard: Tenant users are strictly pinned to their active tenant
    const orgId = isPlatformAdmin ? (req.body.organizationId || req.tenant?.organizationId) : req.tenant?.organizationId;

    const report = await reportsService.generateReport(
      { ...req.body, organizationId: orgId },
      req.user?.id || 'usr-anonymous',
      isPlatformAdmin
    );

    if (req.body.format === 'csv' && req.query.download === 'true') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportType.toLowerCase()}_report.csv"`);
      res.status(200).send(report.csvContent);
      return;
    }

    sendSuccess(res, report, undefined, 200, req.requestId);
  }

  async getTurnoutReport(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const electionId = typeof req.params.electionId === 'string' ? req.params.electionId : undefined;
    const data = await reportsService.generateVoterTurnoutReport(orgId, electionId);
    sendSuccess(res, data[0] || null, undefined, 200, req.requestId);
  }
}

export const reportsController = new ReportsController();
