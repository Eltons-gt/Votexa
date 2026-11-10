import { Router } from 'express';
import { votersController } from './voters.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();

router.use(authenticate);

router.get('/', tenantContext(), (req, res, next) => {
  votersController.list(req, res).catch(next);
});

router.post(
  '/',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.register(req, res).catch(next);
  }
);

router.post(
  '/bulk-import',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.bulkImport(req, res).catch(next);
  }
);

router.post('/verify-eligibility', tenantContext(), (req, res, next) => {
  votersController.verifyEligibility(req, res).catch(next);
});

router.post(
  '/send-invitations',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.sendInvitations(req, res).catch(next);
  }
);

export default router;
