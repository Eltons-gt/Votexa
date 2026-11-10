import { Router } from 'express';
import { OrganizationsController } from './organizations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();
const controller = new OrganizationsController();

router.use(authenticate);

// 1. User Workspaces & Onboarding
router.get('/', (req, res, next) => {
  controller.listUserOrganizations(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  controller.create(req, res).catch(next);
});

router.post('/switch', (req, res, next) => {
  controller.switchOrganization(req, res).catch(next);
});

// 2. Organization Scoped Endpoints (Strict Membership & Role Verification)
router.get('/:id', tenantContext(), (req, res, next) => {
  controller.getById(req, res).catch(next);
});

router.patch(
  '/:id/settings',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller.updateSettings(req, res).catch(next);
  }
);

export default router;
