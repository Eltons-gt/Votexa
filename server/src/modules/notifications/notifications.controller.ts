import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

export class NotificationsController {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [
      {
        id: 'notif-1',
        title: 'Election Published',
        message: 'Student Government Presidential Election 2026 is now live.',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    sendSuccess(res, { success: true, id: req.params.id });
  }
}
