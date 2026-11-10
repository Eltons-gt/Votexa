import { Router } from 'express';
import { OrganizationMembersController } from './organization-members.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();
const controller = new OrganizationMembersController();

router.use(authenticate);

// Public invitation acceptance
router.post('/accept', (req, res, next) => {
  controller.accept(req, res).catch(next);
});

// Member listing (Any authorized tenant member: OWNER, ADMIN, STAFF)
router.get('/', tenantContext(), (req, res, next) => {
  controller.list(req, res).catch(next);
});

// Member invitation (Requires OWNER or ADMIN)
router.post(
  '/invite',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller.invite(req, res).catch(next);
  }
);

// Member role modification (Restricted strictly to OWNER)
router.patch(
  '/:userId/role',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER] }),
  (req, res, next) => {
    controller.updateRole(req, res).catch(next);
  }
);

// Member removal (Requires OWNER or ADMIN)
router.delete(
  '/:userId',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller.removeMember(req, res).catch(next);
  }
);

export default router;
