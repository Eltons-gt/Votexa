import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class VotersController {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'voter-1',
        organizationId: req.tenant?.organizationId,
        electionId: req.query.electionId || 'elec-1',
        voterCode: 'VTR-9981',
        email: 'voter1@university.edu',
        hasVoted: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  async register(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'voter-new',
        organizationId: req.tenant?.organizationId,
        electionId: req.body.electionId,
        voterCode: `VTR-${Math.floor(1000 + Math.random() * 9000)}`,
        email: req.body.email,
        hasVoted: false,
        createdAt: new Date().toISOString()
      },
      undefined,
      201
    );
  }
}

