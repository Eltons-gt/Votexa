import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { ElectionStatus } from '@votexa/shared';

export class ElectionsController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    sendSuccess(res, [
      {
        id: 'elec-1',
        organizationId: orgId,
        title: 'Student Government Presidential Election 2026',
        description: 'Annual election for university student body representation.',
        status: ElectionStatus.ACTIVE,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        timezone: 'UTC',
        allowSelfRegistration: true,
        isPaidVoting: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  async getById(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      id: req.params.id,
      organizationId: req.tenant?.organizationId,
      title: 'Student Government Presidential Election 2026',
      description: 'Annual election for university student body representation.',
      status: ElectionStatus.ACTIVE,
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      timezone: 'UTC',
      allowSelfRegistration: true,
      isPaidVoting: false,
      createdAt: new Date().toISOString()
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'elec-new',
        organizationId: req.tenant?.organizationId,
        title: req.body.title || 'Untitled Election',
        description: req.body.description || '',
        status: ElectionStatus.DRAFT,
        startTime: req.body.startTime || new Date().toISOString(),
        endTime: req.body.endTime || new Date(Date.now() + 86400000).toISOString(),
        timezone: req.body.timezone || 'UTC',
        allowSelfRegistration: req.body.allowSelfRegistration ?? false,
        isPaidVoting: req.body.isPaidVoting ?? false,
        createdAt: new Date().toISOString()
      },
      undefined,
      201
    );
  }
}

