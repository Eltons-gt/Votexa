import { Router } from 'express';
import { electionsController } from './elections.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();

router.use(authenticate);

// Election collection
router.get('/', tenantContext(), (req, res, next) => {
  electionsController.list(req, res).catch(next);
});

router.post(
  '/',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.create(req, res).catch(next);
  }
);

// Single election
router.get('/:id', tenantContext(), (req, res, next) => {
  electionsController.getById(req, res).catch(next);
});

router.put(
  '/:id',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.update(req, res).catch(next);
  }
);

// Election settings
router.put(
  '/:id/settings',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.updateSettings(req, res).catch(next);
  }
);

// Election status transitions
router.post(
  '/:id/status',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.transitionStatus(req, res).catch(next);
  }
);

// Audit logs
router.get('/:id/audit-logs', tenantContext(), (req, res, next) => {
  electionsController.getAuditLogs(req, res).catch(next);
});

// Election positions
router.get('/:id/positions', tenantContext(), (req, res, next) => {
  electionsController.listPositions(req, res).catch(next);
});

router.post(
  '/:id/positions',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.createPosition(req, res).catch(next);
  }
);

router.put(
  '/:id/positions/:positionId',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.updatePosition(req, res).catch(next);
  }
);

router.delete(
  '/:id/positions/:positionId',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.deletePosition(req, res).catch(next);
  }
);

export default router;
