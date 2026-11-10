import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new ReportsController();

router.use(authenticate);
router.use(tenantContext());

router.get('/turnout/:electionId', (req, res, next) => {
  controller.getTurnoutReport(req, res).catch(next);
});

export default router;

