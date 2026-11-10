import { Request, Response } from 'express';
import { sendSuccess, AppError } from '../../utils/apiResponse.js';
import { electionsService } from './elections.service.js';
import { positionsService } from './positions.service.js';
import { ElectionCategory, ElectionStatus } from '@votexa/shared';

export class ElectionsController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const category = req.query.category as ElectionCategory | undefined;
    const status = req.query.status as ElectionStatus | undefined;

    const elections = await electionsService.listElections(orgId, { category, status });
    sendSuccess(res, elections);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const election = await electionsService.getElectionById(orgId, req.params.id as string);
    sendSuccess(res, election);
  }

  async create(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const election = await electionsService.createElection(orgId, userId, req.body);
    sendSuccess(res, election, undefined, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const updated = await electionsService.updateElection(orgId, req.params.id as string, userId, req.body);
    sendSuccess(res, updated);
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const settings = await electionsService.updateElectionSettings(orgId, req.params.id as string, userId, req.body);
    sendSuccess(res, settings);
  }

  async transitionStatus(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const { status, reason } = req.body;
    if (!status) {
      throw new AppError('Target status is required', 400, 'STATUS_REQUIRED');
    }

    const updated = await electionsService.transitionStatus(orgId, req.params.id as string, userId, status, reason);
    sendSuccess(res, updated);
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const logs = await electionsService.getAuditLogs(orgId, req.params.id as string);
    sendSuccess(res, logs);
  }

  // --- Election Positions Endpoints ---

  async listPositions(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const positions = await positionsService.listPositions(orgId, req.params.id as string);
    sendSuccess(res, positions);
  }

  async createPosition(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const position = await positionsService.createPosition(orgId, req.params.id as string, userId, req.body);
    sendSuccess(res, position, undefined, 201);
  }

  async updatePosition(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const updated = await positionsService.updatePosition(
      orgId,
      req.params.id as string,
      req.params.positionId as string,
      req.body
    );
    sendSuccess(res, updated);
  }

  async deletePosition(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    await positionsService.deletePosition(orgId, req.params.id as string, req.params.positionId as string);
    sendSuccess(res, { deleted: true });
  }
}

export const electionsController = new ElectionsController();
