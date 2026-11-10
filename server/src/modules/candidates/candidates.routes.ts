import { Router } from 'express';
import { candidatesController } from './candidates.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();

router.use(authenticate);

router.get('/', tenantContext(), (req, res, next) => {
  candidatesController.listByElection(req, res).catch(next);
});

router.get('/election/:electionId', tenantContext(), (req, res, next) => {
  candidatesController.listByElection(req, res).catch(next);
});

router.post(
  '/',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.create(req, res).catch(next);
  }
);

router.put(
  '/:id',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.update(req, res).catch(next);
  }
);

router.delete(
  '/:id',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.delete(req, res).catch(next);
  }
);

export default router;
