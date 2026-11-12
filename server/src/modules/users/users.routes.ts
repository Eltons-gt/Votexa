import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new UsersController();

router.use(authenticate);

router.get('/profile', (req, res, next) => {
  controller.getProfile(req, res).catch(next);
});

router.delete('/me', (req, res, next) => {
  controller.deleteMe(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

export default router;

