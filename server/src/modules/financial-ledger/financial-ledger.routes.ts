import { Router } from 'express';
import { FinancialLedgerController } from './financial-ledger.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new FinancialLedgerController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.listEntries(req, res).catch(next);
});

export default router;

