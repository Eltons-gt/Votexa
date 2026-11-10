import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { OrganizationRole } from '@votexa/shared';

export class OrganizationMembersController {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'mem-1',
        organizationId: req.tenant?.organizationId || 'org-demo-1',
        userId: 'usr-admin-1',
        role: OrganizationRole.OWNER,
        joinedAt: new Date().toISOString()
      }
    ]);
  }

  async invite(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'mem-new',
        organizationId: req.tenant?.organizationId,
        email: req.body.email,
        role: req.body.role || OrganizationRole.MEMBER,
        status: 'INVITED'
      },
      undefined,
      201
    );
  }
}

