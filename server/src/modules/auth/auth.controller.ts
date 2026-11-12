import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { authService } from './auth.service.js';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const session = await authService.register(req.body);
    sendSuccess(res, session, undefined, 201, req.requestId);
  }

  async login(req: Request, res: Response): Promise<void> {
    const session = await authService.login(req.body);
    sendSuccess(res, session, undefined, 200, req.requestId);
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    sendSuccess(
      res,
      {
        user: req.user,
        tenant: req.tenant
      },
      undefined,
      200,
      req.requestId
    );
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const updated = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, updated, undefined, 200, req.requestId);
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, result, undefined, 200, req.requestId);
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    sendSuccess(res, { message: 'Password has been reset successfully' }, undefined, 200, req.requestId);
  }

  async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { message: 'Logged out successfully' }, undefined, 200, _req.requestId);
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    const result = await authService.deleteAccount(req.user!.id);
    sendSuccess(res, result, undefined, 200, req.requestId);
  }
}
