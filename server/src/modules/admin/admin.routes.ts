import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new AdminController();

router.use(authenticate);

router.get('/stats', (req, res, next) => {
  controller.getPlatformStats(req, res).catch(next);
});

export default router;

