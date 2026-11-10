import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new NotificationsController();

router.use(authenticate);

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.patch('/:id/read', (req, res, next) => {
  controller.markAsRead(req, res).catch(next);
});

export default router;

