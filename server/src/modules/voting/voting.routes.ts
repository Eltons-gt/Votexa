import { Router } from 'express';
import { VotingController } from './voting.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = Router();
const controller = new VotingController();

router.use(tenantContext({ required: false }));

router.get('/status/:electionId', (req, res, next) => {
  controller.getVotingStatus(req, res).catch(next);
});

router.post('/cast', (req, res, next) => {
  controller.castVote(req, res).catch(next);
});

router.post('/verify-receipt', (req, res, next) => {
  controller.verifyReceipt(req, res).catch(next);
});

router.get('/results/:electionId', (req, res, next) => {
  controller.getResults(req, res).catch(next);
});

export default router;
