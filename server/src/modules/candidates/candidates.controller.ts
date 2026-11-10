import { Request, Response } from 'express';
import { sendSuccess, AppError } from '../../utils/apiResponse.js';
import { candidatesService } from './candidates.service.js';

export class CandidatesController {
  async listByElection(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = (req.params.electionId || req.query.electionId) as string;
    if (!electionId) {
      throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');
    }

    const positionId = req.query.positionId as string | undefined;
    const candidates = await candidatesService.listCandidates(orgId, electionId, positionId);
    sendSuccess(res, candidates);
  }

  async create(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');
    }

    const candidate = await candidatesService.createCandidate(orgId, electionId, req.body);
    sendSuccess(res, candidate, undefined, 201);
  }

  async update(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || (req.query.electionId as string);
    if (!electionId) {
      throw new AppError('Election ID is required for updating candidate', 400, 'ELECTION_REQUIRED');
    }

    const updated = await candidatesService.updateCandidate(
      orgId,
      electionId,
      req.params.id as string,
      req.body
    );
    sendSuccess(res, updated);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = (req.query.electionId || req.body.electionId) as string;
    if (!electionId) {
      throw new AppError('Election ID is required for deleting candidate', 400, 'ELECTION_REQUIRED');
    }

    await candidatesService.deleteCandidate(orgId, electionId, req.params.id as string);
    sendSuccess(res, { deleted: true });
  }
}

export const candidatesController = new CandidatesController();
