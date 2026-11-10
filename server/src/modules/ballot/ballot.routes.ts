import { Router } from 'express';
import { BallotController } from './ballot.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new BallotController();

router.use(authenticate);
router.use(tenantContext());

router.get('/:electionId', (req, res, next) => {
  controller.getByElection(req, res).catch(next);
});

export default router;

