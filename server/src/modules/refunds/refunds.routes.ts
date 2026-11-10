import { Router } from 'express';
import { refundsController } from './refunds.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(tenantContext({ required: false }));

// GET /api/v1/refunds - List refunds
router.get('/', (req, res, next) => {
  refundsController.list(req, res).catch(next);
});

// POST /api/v1/refunds - Process full or partial refund
router.post('/', (req, res, next) => {
  refundsController.requestRefund(req, res).catch(next);
});

// POST /api/v1/refunds/chargeback - Process chargeback/dispute
router.post('/chargeback', (req, res, next) => {
  refundsController.processChargeback(req, res).catch(next);
});

export default router;
