import { Router } from 'express';
import { votingController } from './voting.controller.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole } from '@votexa/shared';

const router = Router();

router.use(tenantContext({ required: false }));

// Packages
router.get('/packages/:electionId', (req, res, next) => {
  votingController.listPackages(req, res).catch(next);
});

router.post(
  '/packages',
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votingController.createPackage(req, res).catch(next);
  }
);

// Voter Wallet & Transaction History
router.get('/wallet/:electionId', (req, res, next) => {
  votingController.getWallet(req, res).catch(next);
});

// Mock Payment Package Purchase
router.post('/packages/purchase', (req, res, next) => {
  votingController.purchasePackage(req, res).catch(next);
});

// Confidential One-Time Vote Authorization
router.post('/authorize', (req, res, next) => {
  votingController.requestAuthorization(req, res).catch(next);
});

// Cast Authorized Vote
router.post('/cast-authorized', (req, res, next) => {
  votingController.castAuthorizedVote(req, res).catch(next);
});

// Status & Receipt Verification
router.get('/status/:electionId', (req, res, next) => {
  votingController.getVotingStatus(req, res).catch(next);
});

router.post('/cast', (req, res, next) => {
  votingController.castVote(req, res).catch(next);
});

router.post('/verify-receipt', (req, res, next) => {
  votingController.verifyReceipt(req, res).catch(next);
});

router.get('/results/:electionId', (req, res, next) => {
  votingController.getResults(req, res).catch(next);
});

export default router;
