import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class ReportsController {
  async getTurnoutReport(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      electionId: req.params.electionId,
      totalRegisteredVoters: 1250,
      totalVotesCast: 842,
      turnoutPercentage: 67.36,
      generatedAt: new Date().toISOString()
    });
  }
}

