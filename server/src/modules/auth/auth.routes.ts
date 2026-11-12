import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res, next) => {
  controller.register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  controller.login(req, res).catch(next);
});

router.post('/forgot-password', (req, res, next) => {
  controller.forgotPassword(req, res).catch(next);
});

router.post('/reset-password', (req, res, next) => {
  controller.resetPassword(req, res).catch(next);
});

router.get('/me', authenticate, (req, res, next) => {
  controller.getProfile(req, res).catch(next);
});

router.patch('/profile', authenticate, (req, res, next) => {
  controller.updateProfile(req, res).catch(next);
});

router.post('/logout', authenticate, (req, res, next) => {
  controller.logout(req, res).catch(next);
});

router.delete('/account', authenticate, (req, res, next) => {
  controller.deleteAccount(req, res).catch(next);
});

export default router;
