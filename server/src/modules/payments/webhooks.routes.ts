import { Router } from 'express';
import { paymentsController } from './payments.controller.js';

const router = Router();

// POST /api/v1/webhooks/mpesa - Safaricom Daraja STK Push Callback Endpoint
router.post('/mpesa', (req, res, next) => {
  paymentsController.handleMpesaCallback(req, res).catch(next);
});

export default router;
