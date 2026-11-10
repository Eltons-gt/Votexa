import { Router } from 'express';
import { OrganizationMembersController } from './organization-members.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new OrganizationMembersController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/invite', (req, res, next) => {
  controller.invite(req, res).catch(next);
});

export default router;

