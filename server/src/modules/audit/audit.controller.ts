import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class AuditController {
  async listLogs(req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'aud-1',
        organizationId: req.tenant?.organizationId,
        userId: req.user?.id,
        action: 'ELECTION_UPDATED',
        resourceType: 'ELECTION',
        resourceId: 'elec-1',
        createdAt: new Date().toISOString()
      }
    ]);
  }
}

