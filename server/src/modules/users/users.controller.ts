import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { authService } from '../auth/auth.service.js';

export class UsersController {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'usr-1',
        email: 'admin@votexa.io',
        fullName: 'Platform Admin',
        systemRole: 'SUPER_ADMIN',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    sendSuccess(res, req.user);
  }

  async deleteMe(req: Request, res: Response): Promise<void> {
    const result = await authService.deleteAccount(req.user!.id);
    sendSuccess(res, result);
  }
}
