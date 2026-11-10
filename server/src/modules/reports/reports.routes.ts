import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(authenticate);
router.use(tenantContext({ required: false }));

// POST /api/v1/reports - Generate and export any tenant-scoped or platform report
router.post('/', (req, res, next) => {
  reportsController.generateReport(req, res).catch(next);
});

// GET /api/v1/reports/turnout/:electionId
router.get('/turnout/:electionId', (req, res, next) => {
  reportsController.getTurnoutReport(req, res).catch(next);
});

export default router;
