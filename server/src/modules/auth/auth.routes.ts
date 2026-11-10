import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new AuthController();

router.get('/me', authenticate, (req, res, next) => {
  controller.getProfile(req, res).catch(next);
});

router.post('/logout', authenticate, (req, res, next) => {
  controller.logout(req, res).catch(next);
});

export default router;

