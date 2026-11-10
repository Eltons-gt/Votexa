import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new AuditController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.listLogs(req, res).catch(next);
});

export default router;

