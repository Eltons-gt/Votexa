import { Router } from 'express';
import { ElectionsController } from './elections.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new ElectionsController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  controller.create(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getById(req, res).catch(next);
});

export default router;

