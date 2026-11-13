import { Request, Response } from 'express';
import { sendSuccess, AppError } from '../../utils/apiResponse.js';
import { votingService } from './voting.service.js';
import { votingPackagesService } from './voting-packages.service.js';
import { voterWalletService } from './voter-wallet.service.js';
import { mockPaymentService } from './mock-payment.service.js';
import { voteAuthorizationService } from './vote-authorization.service.js';

export class VotingController {
  // --- Voting Packages Endpoints ---

  async listPackages(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = (req.params.electionId || req.query.electionId) as string;
    if (!electionId) throw new AppError('Election ID is required', 400, 'ELECTION_REQUIRED');

    const packages = await votingPackagesService.listPackages(orgId, electionId);
    sendSuccess(res, packages, undefined, 200, req.requestId);
  }

  async createPackage(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || 'usr-system';
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const pkg = await votingPackagesService.createPackage(orgId, userId, req.body);
    sendSuccess(res, pkg, undefined, 201, req.requestId);
  }

  // --- Voter Wallet & Transactions ---

  async getWallet(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const electionId = (req.params.electionId || req.query.electionId) as string;
    const voterCode = req.query.voterCode as string;

    if (!electionId || !voterCode) {
      throw new AppError('Election ID and voter code are required', 400, 'INVALID_PAYLOAD');
    }

    const wallet = await voterWalletService.getOrCreateWallet(orgId, electionId, voterCode);
    const transactions = await voterWalletService.getWalletTransactions(wallet.id, electionId);

    sendSuccess(
      res,
      {
        wallet,
        transactions
      },
      undefined,
      200,
      req.requestId
    );
  }

  // --- Package Purchase (Mock Payment Integration) ---

  async purchasePackage(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const result = await mockPaymentService.processMockPayment(orgId, req.body);
    sendSuccess(res, result, undefined, 201, req.requestId);
  }

  // --- One-Time Vote Authorization (Ballot Confidentiality) ---

  async requestAuthorization(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const result = await voteAuthorizationService.requestAuthorization(orgId, req.body);
    sendSuccess(res, result, undefined, 201, req.requestId);
  }

  // --- Cast Authorized Ballot ---

  async castAuthorizedVote(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError('Tenant context required', 400, 'TENANT_REQUIRED');

    const result = await votingService.castAuthorizedVote(orgId, req.body);
    sendSuccess(res, result, undefined, 201, req.requestId);
  }

  // --- Legacy / Direct Cast Ballot ---

  async castVote(req: Request, res: Response): Promise<void> {
    const receipt = await votingService.castVote({
      electionId: req.body.electionId,
      ballotId: req.body.ballotId,
      voterCode: req.body.voterCode,
      selections: req.body.selections
    });

    sendSuccess(res, receipt, undefined, 201, req.requestId);
  }

  // --- Verification & Tally ---

  async verifyReceipt(req: Request, res: Response): Promise<void> {
    const result = await votingService.verifyReceipt(req.body.receiptCode);
    sendSuccess(res, result, undefined, 200, req.requestId);
  }

  async getResults(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant?.organizationId || 'org-metro-uni';
    const electionId = (req.params.electionId as string) || '';
    const tally = await votingService.getElectionTally(orgId, electionId);
    sendSuccess(res, tally, undefined, 200, req.requestId);
  }

  async getVotingStatus(req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      electionId: req.params.electionId,
      canVote: true,
      phase: 'ENGINE_ACTIVE'
    });
  }

  async getPublicBallot(req: Request, res: Response): Promise<void> {
    const electionId = (req.params.electionId || req.query.electionId) as string;
    const ballot = await votingService.getPublicBallot(electionId);
    sendSuccess(res, ballot, undefined, 200, req.requestId);
  }
}

export const votingController = new VotingController();
