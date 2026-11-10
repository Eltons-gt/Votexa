import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { adminService } from './admin.service.js';
import { auditService } from '../audit/audit.service.js';
import { reportsService } from '../reports/reports.service.js';
import { SystemRole, PlatformRole } from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

export class AdminController {
  // 1. Platform Overview
  async getOverview(req: Request, res: Response): Promise<void> {
    const overview = await adminService.getPlatformOverview();
    sendSuccess(res, overview, undefined, 200, req.requestId);
  }

  // 2. Organization Management
  async listOrganizations(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const orgs = await adminService.listOrganizations({ status, search });
    sendSuccess(res, orgs, undefined, 200, req.requestId);
  }

  async updateOrganizationStatus(req: Request, res: Response): Promise<void> {
    const orgId = req.params.id as string;
    const adminUserId = req.user?.id || 'usr-super-admin';
    const { status, reason } = req.body;

    const updated = await adminService.updateOrganizationStatus(
      orgId,
      status,
      reason || 'Administrative action',
      adminUserId
    );
    sendSuccess(res, updated, undefined, 200, req.requestId);
  }

  // 3. User Management
  async listUsers(req: Request, res: Response): Promise<void> {
    const search = req.query.search as string | undefined;
    const systemRole = req.query.systemRole as string | undefined;
    const platformRole = req.query.platformRole as string | undefined;

    const users = await adminService.listUsers({ search, systemRole, platformRole });
    sendSuccess(res, users, undefined, 200, req.requestId);
  }

  async updateUserRole(req: Request, res: Response): Promise<void> {
    const userId = req.params.id as string;
    const adminUserId = req.user?.id || 'usr-super-admin';
    const { systemRole, platformRoles } = req.body;

    const updated = await adminService.updateUserRole(userId, { systemRole, platformRoles }, adminUserId);
    sendSuccess(res, updated, undefined, 200, req.requestId);
  }

  // 4. Election Moderation
  async listAllElections(req: Request, res: Response): Promise<void> {
    const status = req.query.status as any;
    const category = req.query.category as any;
    const search = req.query.search as string | undefined;

    const elections = await adminService.listAllElections({ status, category, search });
    sendSuccess(res, elections, undefined, 200, req.requestId);
  }

  async moderateElection(req: Request, res: Response): Promise<void> {
    const electionId = req.params.id as string;
    const adminUserId = req.user?.id || 'usr-super-admin';
    const { status, certifiedAt, certifiedBy, notes } = req.body;

    const moderated = await adminService.moderateElection(
      electionId,
      { status, certifiedAt, certifiedBy, notes },
      adminUserId
    );
    sendSuccess(res, moderated, undefined, 200, req.requestId);
  }

  // 5. Commission Management
  async getCommissionSettings(_req: Request, res: Response): Promise<void> {
    const settings = await adminService.getCommissionSettings();
    sendSuccess(res, settings, undefined, 200, _req.requestId);
  }

  async updateCommissionRate(req: Request, res: Response): Promise<void> {
    const adminUserId = req.user?.id || 'usr-super-admin';
    const isSuperAdmin =
      req.user?.systemRole === SystemRole.SUPER_ADMIN ||
      req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN);

    // Support staff is forbidden from altering platform commission rates!
    if (!isSuperAdmin) {
      // Record security event
      await auditService.recordSecurityEvent({
        eventType: 'UNAUTHORIZED_ADMIN_ATTEMPT',
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        details: { action: 'UPDATE_COMMISSION_RATE', reason: 'Requires Super Admin privileges' }
      });
      throw new AppError('Forbidden: Modifying global commission rates requires Super Admin privileges.', 403, 'FORBIDDEN');
    }

    const { platformRateBasisPoints, reason } = req.body;
    const updated = await adminService.updateCommissionRate(
      parseInt(platformRateBasisPoints, 10),
      reason || 'Administrative rate policy update',
      adminUserId
    );
    sendSuccess(res, updated, undefined, 200, req.requestId);
  }

  // 6. Audit Logs & Security Events
  async listAuditLogs(req: Request, res: Response): Promise<void> {
    const { action, resourceType, organizationId, actorId, limit } = req.query;
    const logs = await auditService.listAuditLogs({
      action: action as string | undefined,
      resourceType: resourceType as string | undefined,
      organizationId: organizationId as string | undefined,
      actorId: actorId as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 100
    });
    sendSuccess(res, logs, undefined, 200, req.requestId);
  }

  async listSecurityEvents(req: Request, res: Response): Promise<void> {
    const { eventType, severity, limit } = req.query;
    const events = await auditService.listSecurityEvents({
      eventType: eventType as string | undefined,
      severity: severity as any,
      limit: limit ? parseInt(limit as string, 10) : 100
    });
    sendSuccess(res, events, undefined, 200, req.requestId);
  }

  // 7. Reporting Generation Dispatcher
  async generateReport(req: Request, res: Response): Promise<void> {
    const requesterId = req.user?.id || 'usr-super-admin';
    const isPlatformAdmin =
      req.user?.systemRole === SystemRole.SUPER_ADMIN ||
      req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) ||
      req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) ||
      false;

    const report = await reportsService.generateReport(req.body, requesterId, isPlatformAdmin);

    // If client requested direct CSV stream/download
    if (req.body.format === 'csv' && req.query.download === 'true') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.reportType.toLowerCase()}_report.csv"`);
      res.status(200).send(report.csvContent);
      return;
    }

    sendSuccess(res, report, undefined, 200, req.requestId);
  }
}

export const adminController = new AdminController();
