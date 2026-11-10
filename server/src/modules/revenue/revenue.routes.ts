import { Router } from 'express';
import { RevenueController } from './revenue.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new RevenueController();

router.use(authenticate);
router.use(tenantContext());

router.get('/metrics', (req, res, next) => {
  controller.getMetrics(req, res).catch(next);
});

export default router;

