import { Router } from 'express';
import { CandidatesController } from './candidates.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new CandidatesController();

router.use(authenticate);
router.use(tenantContext());

router.get('/', (req, res, next) => {
  controller.listByElection(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  controller.create(req, res).catch(next);
});

export default router;

