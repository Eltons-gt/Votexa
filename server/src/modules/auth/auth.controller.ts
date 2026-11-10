import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class AuthController {
  async getProfile(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      user: req.user,
      tenant: req.tenant
    });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { message: 'Logged out successfully' });
  }
}
