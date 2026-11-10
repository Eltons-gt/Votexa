import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class OrganizationsController {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'org-demo-1',
        name: 'Demo University',
        slug: 'demo-university',
        planId: 'ENTERPRISE',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  async getById(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      id: req.params.id,
      name: 'Demo University',
      slug: 'demo-university',
      planId: 'ENTERPRISE',
      createdAt: new Date().toISOString()
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'org-new-1',
        name: req.body.name || 'New Organization',
        slug: req.body.slug || 'new-org',
        createdAt: new Date().toISOString()
      },
      undefined,
      201
    );
  }
}
