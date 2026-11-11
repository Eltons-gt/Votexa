import { Router } from 'express';
import { paymentsController } from './payments.controller.js';

const router = Router();

// 1. POST /api/v1/webhooks/mpesa - Safaricom Daraja STK Push Callback Endpoint
router.post('/mpesa', (req, res, next) => {
  paymentsController.handleMpesaCallback(req, res).catch(next);
});

// 2. POST /api/v1/webhooks/mpesa/b2c-result - Safaricom Daraja B2C Result Endpoint
router.post('/mpesa/b2c-result', (req, res, next) => {
  paymentsController.handleMpesaB2CResult(req, res).catch(next);
});

// 3. POST /api/v1/webhooks/mpesa/b2c-timeout - Safaricom Daraja B2C Queue Timeout Endpoint
router.post('/mpesa/b2c-timeout', (req, res, next) => {
  paymentsController.handleMpesaB2CTimeout(req, res).catch(next);
});

// 4. POST /api/v1/webhooks/paystack - Paystack Webhook Receiver Endpoint
router.post('/paystack', (req, res, next) => {
  paymentsController.handlePaystackWebhook(req, res).catch(next);
});

export default router;
