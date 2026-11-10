import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { auditService } from './audit.service.js';
import { SystemRole, PlatformRole } from '@votexa/shared';

export class AuditController {
  async listLogs(req: Request, res: Response): Promise<void> {
    const isPlatformAdmin =
      req.user?.systemRole === SystemRole.SUPER_ADMIN ||
      req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) ||
      req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) ||
      false;

    // Organization users can ONLY see their own organization's audit logs!
    const orgId = isPlatformAdmin ? (req.query.organizationId as string) : req.tenant?.organizationId;

    const logs = await auditService.listAuditLogs({
      organizationId: orgId,
      action: req.query.action as string,
      resourceType: req.query.resourceType as string,
      actorId: req.query.actorId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100
    });

    sendSuccess(res, logs, undefined, 200, req.requestId);
  }
}

export const auditController = new AuditController();
