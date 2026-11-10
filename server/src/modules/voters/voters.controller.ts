import { Request, Response } from 'express';
import { sendSuccess, AppError } from '../../utils/apiResponse.js';
import { votersService } from './voters.service.js';

export class VotersController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = (req.query.electionId || req.params.electionId) as string;
    if (!electionId) {
      throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');
    }

    const search = req.query.search as string | undefined;
    const voters = await votersService.listVoters(orgId, electionId, search);
    sendSuccess(res, voters);
  }

  async register(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');
    }

    const voter = await votersService.registerVoter(orgId, electionId, req.body);
    sendSuccess(res, voter, undefined, 201);
  }

  async bulkImport(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');
    }

    if (!Array.isArray(req.body.voters)) {
      throw new AppError('Voters array is required for bulk import', 400, 'INVALID_PAYLOAD');
    }

    const result = await votersService.bulkImportVoters(orgId, electionId, req.body);
    sendSuccess(res, result, undefined, 201);
  }

  async verifyEligibility(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || (req.query.electionId as string);
    if (!electionId) {
      throw new AppError('Election ID is required for verification', 400, 'ELECTION_REQUIRED');
    }

    const result = await votersService.verifyVoterEligibility(orgId, electionId, req.body);
    sendSuccess(res, result);
  }

  async sendInvitations(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = req.body.electionId || (req.query.electionId as string);
    if (!electionId) {
      throw new AppError('Election ID is required for sending invitations', 400, 'ELECTION_REQUIRED');
    }

    const invites = await votersService.sendVoterInvitations(orgId, electionId, req.body.voterIds);
    sendSuccess(res, { sentCount: invites.length, invitations: invites });
  }
}

export const votersController = new VotersController();
