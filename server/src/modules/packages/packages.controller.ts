import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class PackagesController {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'pkg-standard',
        name: 'Standard Tier',
        description: 'Ideal for student unions and community organizations',
        maxElections: 10,
        maxVotersPerElection: 2500,
        priceCents: 4900,
        currency: 'USD'
      },
      {
        id: 'pkg-enterprise',
        name: 'Enterprise Tier',
        description: 'Unlimited elections, audit logs, and priority voter verification',
        maxElections: 100,
        maxVotersPerElection: 50000,
        priceCents: 19900,
        currency: 'USD'
      }
    ]);
  }
}
