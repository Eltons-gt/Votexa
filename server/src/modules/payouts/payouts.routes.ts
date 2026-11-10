import { Router } from 'express';
import { payoutsController } from './payouts.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(tenantContext({ required: false }));

// GET /api/v1/payouts - List payouts
router.get('/', (req, res, next) => {
  payoutsController.list(req, res).catch(next);
});

// POST /api/v1/payouts/request - Submit withdrawal request
router.post('/request', (req, res, next) => {
  payoutsController.requestPayout(req, res).catch(next);
});

// Destination accounts
router.get('/accounts', (req, res, next) => {
  payoutsController.listAccounts(req, res).catch(next);
});

router.post('/accounts', (req, res, next) => {
  payoutsController.saveAccount(req, res).catch(next);
});

// Single payout details
router.get('/:id', (req, res, next) => {
  payoutsController.getPayout(req, res).catch(next);
});

// Admin review: Approve or Reject
router.post('/:id/review', (req, res, next) => {
  payoutsController.reviewPayout(req, res).catch(next);
});

// Admin settlement: Record settlement evidence and mark PAID
router.post('/:id/settle', (req, res, next) => {
  payoutsController.settlePayout(req, res).catch(next);
});

// Admin automated M-Pesa B2C direct disbursement execution
router.post('/:id/disburse-mpesa', (req, res, next) => {
  payoutsController.disburseMpesaB2C(req, res).catch(next);
});

// List B2C disbursement logs for a payout
router.get('/:id/disbursements', (req, res, next) => {
  payoutsController.listDisbursements(req, res).catch(next);
});

export default router;
