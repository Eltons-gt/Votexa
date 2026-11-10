import { Router } from 'express';
import { PayoutsController } from './payouts.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new PayoutsController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/request', (req, res, next) => {
  controller.requestPayout(req, res).catch(next);
});

export default router;

