import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new PaymentsController();

router.use(tenantContext({ required: false }));

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/checkout', (req, res, next) => {
  controller.createCheckoutSession(req, res).catch(next);
});

router.post('/confirm', (req, res, next) => {
  controller.confirmPayment(req, res).catch(next);
});

export default router;
