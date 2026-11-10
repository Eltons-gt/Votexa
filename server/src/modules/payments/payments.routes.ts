import { Router } from 'express';
import { paymentsController } from './payments.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(tenantContext({ required: false }));

// Payments listing
router.get('/', (req, res, next) => {
  paymentsController.list(req, res).catch(next);
});

// POST /api/v1/payments/initiate - Initiate M-Pesa STK Push
router.post('/initiate', (req, res, next) => {
  paymentsController.initiateMpesaPayment(req, res).catch(next);
});

// GET /api/v1/payments/:id - Query M-Pesa payment status
router.get('/:id', (req, res, next) => {
  paymentsController.getPaymentById(req, res).catch(next);
});

// SaaS platform subscription checkout
router.post('/checkout', (req, res, next) => {
  paymentsController.createCheckoutSession(req, res).catch(next);
});

// SaaS platform subscription confirm
router.post('/confirm', (req, res, next) => {
  paymentsController.confirmPayment(req, res).catch(next);
});

export default router;
