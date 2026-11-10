import { Router } from 'express';
import { VotersController } from './voters.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new VotersController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/register', (req, res, next) => {
  controller.register(req, res).catch(next);
});

export default router;

