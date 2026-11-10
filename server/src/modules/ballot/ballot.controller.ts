import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { BallotType } from '@votexa/shared';

export class BallotController {
  async getByElection(req: Request, res: Response): Promise<void> {
    const electionId = req.params.electionId || (req.query.electionId as string);
    sendSuccess(res, {
      id: 'ballot-1',
      electionId,
      organizationId: req.tenant?.organizationId,
      title: 'Official 2026 Student Government Ballot',
      type: BallotType.SINGLE_CHOICE,
      questions: [
        {
          id: 'q-1',
          questionText: 'Select your preferred candidate for President',
          orderIndex: 1,
          options: [
            { id: 'opt-1', label: 'Jordan Hayes', candidateId: 'cand-1' },
            { id: 'opt-2', label: 'Morgan Chen', candidateId: 'cand-2' }
          ]
        }
      ]
    });
  }
}

