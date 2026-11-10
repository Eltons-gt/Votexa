import { Router } from 'express';
import { RefundsController } from './refunds.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new RefundsController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  controller.requestRefund(req, res).catch(next);
});

export default router;

