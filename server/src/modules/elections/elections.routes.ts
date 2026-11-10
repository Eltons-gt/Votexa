import { Router } from 'express';
import { ElectionsController } from './elections.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();
const controller = new ElectionsController();

router.use(authenticate);

router.get('/', tenantContext(), (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post(
  '/',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller.create(req, res).catch(next);
  }
);

router.get('/:id', tenantContext(), (req, res, next) => {
  controller.getById(req, res).catch(next);
});

export default router;
