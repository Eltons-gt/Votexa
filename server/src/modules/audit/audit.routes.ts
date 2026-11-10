import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();

router.use(authenticate);
router.use(tenantContext({ required: false }));

// GET /api/v1/audit - List audit logs
router.get('/', (req, res, next) => {
  auditController.listLogs(req, res).catch(next);
});

export default router;
