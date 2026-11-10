import { Router } from 'express';
import { financialLedgerController } from './financial-ledger.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(tenantContext({ required: false }));

// GET /api/v1/ledger - List ledger entries
router.get('/', (req, res, next) => {
  financialLedgerController.listEntries(req, res).catch(next);
});

// GET /api/v1/ledger/accounts - List financial accounts
router.get('/accounts', (req, res, next) => {
  financialLedgerController.listAccounts(req, res).catch(next);
});

// GET /api/v1/ledger/integrity - Audit ledger balance integrity
router.get('/integrity', (req, res, next) => {
  financialLedgerController.verifyIntegrity(req, res).catch(next);
});

export default router;
