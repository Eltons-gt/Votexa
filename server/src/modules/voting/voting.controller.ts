import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { votingService } from './voting.service.js';

export class VotingController {
  /**
   * Cast Vote Endpoint (Cryptographic Voting Engine - Phase 2)
   */
  async castVote(req: Request, res: Response): Promise<void> {
    const receipt = await votingService.castVote({
      electionId: req.body.electionId,
      ballotId: req.body.ballotId,
      voterCode: req.body.voterCode,
      selections: req.body.selections
    });

    sendSuccess(
      res,
      receipt,
      undefined,
      201,
      req.requestId
    );
  }

  /**
   * Cryptographic Ballot Receipt Verification
   */
  async verifyReceipt(req: Request, res: Response): Promise<void> {
    const result = await votingService.verifyReceipt(req.body.receiptCode);
    sendSuccess(res, result, undefined, 200, req.requestId);
  }

  /**
   * Get Election Results & Tally
   */
  async getResults(req: Request, res: Response): Promise<void> {
    const electionId = (req.params.electionId as string) || '';
    const tally = await votingService.getElectionTally(electionId);
    sendSuccess(res, tally, undefined, 200, req.requestId);
  }

  async getVotingStatus(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      electionId: req.params.electionId,
      canVote: true,
      phase: 'ENGINE_ACTIVE'
    });
  }
}
