import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class CandidatesController {
  async listByElection(req: Request, res: Response): Promise<void> {
    const electionId = req.params.electionId || (req.query.electionId as string);
    sendSuccess(res, [
      {
        id: 'cand-1',
        electionId,
        organizationId: req.tenant?.organizationId,
        name: 'Jordan Hayes',
        bio: 'Advocating for campus sustainability and academic resources.',
        ballotOrder: 1,
        voteCount: 0
      },
      {
        id: 'cand-2',
        electionId,
        organizationId: req.tenant?.organizationId,
        name: 'Morgan Chen',
        bio: 'Focusing on transparent student budget allocation and student health.',
        ballotOrder: 2,
        voteCount: 0
      }
    ]);
  }

  async create(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        id: 'cand-new',
        electionId: req.body.electionId,
        organizationId: req.tenant?.organizationId,
        name: req.body.name,
        bio: req.body.bio,
        ballotOrder: req.body.ballotOrder || 1
      },
      undefined,
      201
    );
  }
}

