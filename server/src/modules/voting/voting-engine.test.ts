import { describe, it, expect, beforeEach } from 'vitest';
import { votingService } from './voting.service.js';
import { votingPackagesService } from './voting-packages.service.js';
import { voterWalletService } from './voter-wallet.service.js';
import { mockPaymentService } from './mock-payment.service.js';
import { voteAuthorizationService } from './vote-authorization.service.js';
import { electionsService } from '../elections/elections.service.js';
import { positionsService } from '../elections/positions.service.js';
import { candidatesService } from '../candidates/candidates.service.js';
import { votersService } from '../voters/voters.service.js';
import {
  ElectionCategory,
  ElectionStatus,
  WalletTransactionType
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('Voting Engine & Election-Specific Credit System', () => {
  const orgId = 'org-metro-uni';
  const userId = 'usr-demo-owner';

  let instElectionId: string;
  let instPosition1Id: string;
  let instPosition2Id: string;
  let instCandidate1Id: string;
  let instCandidate2Id: string;
  let instVoterCode: string;

  let paidElectionId: string;
  let paidPositionId: string;
  let paidCandidateId: string;
  let paidPackageId: string;
  let paidVoterCode: string;

  beforeEach(async () => {
    // 1. Setup Institutional Election
    const instElection = await electionsService.createElection(orgId, userId, {
      category: ElectionCategory.INSTITUTIONAL,
      title: `Student Union Council Test ${Date.now()}`,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString()
    });
    instElectionId = instElection.id;
    await electionsService.transitionStatus(orgId, instElectionId, userId, ElectionStatus.ACTIVE);

    // Positions for Institutional
    const pos1 = await positionsService.createPosition(orgId, instElectionId, userId, {
      title: 'President',
      minSelections: 1,
      maxSelections: 1
    });
    instPosition1Id = pos1.id;

    const pos2 = await positionsService.createPosition(orgId, instElectionId, userId, {
      title: 'Vice President',
      minSelections: 1,
      maxSelections: 1
    });
    instPosition2Id = pos2.id;

    // Candidates
    const cand1 = await candidatesService.createCandidate(orgId, instElectionId, {
      positionId: instPosition1Id,
      name: 'Alice President',
      ballotOrder: 1
    });
    instCandidate1Id = cand1.id;

    const cand2 = await candidatesService.createCandidate(orgId, instElectionId, {
      positionId: instPosition2Id,
      name: 'Bob VP',
      ballotOrder: 1
    });
    instCandidate2Id = cand2.id;

    // Voter
    const instVoter = await votersService.registerVoter(orgId, instElectionId, {
      email: `student.${Date.now()}@metro.edu`,
      firstName: 'Test',
      lastName: 'Student'
    });
    instVoterCode = instVoter.voterCode;

    // 2. Setup Paid Competition Election
    const paidElection = await electionsService.createElection(orgId, userId, {
      category: ElectionCategory.PAID_COMPETITION,
      title: `Collegiate Talent Show ${Date.now()}`,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      settings: {
        allowMultipleVotes: true,
        maxVotesPerVoter: 50,
        votePriceCents: 100
      }
    });
    paidElectionId = paidElection.id;
    await electionsService.transitionStatus(orgId, paidElectionId, userId, ElectionStatus.ACTIVE);

    const paidPos = await positionsService.createPosition(orgId, paidElectionId, userId, {
      title: 'Best Performer',
      minSelections: 1,
      maxSelections: 1
    });
    paidPositionId = paidPos.id;

    const paidCand = await candidatesService.createCandidate(orgId, paidElectionId, {
      positionId: paidPositionId,
      name: 'Harmony Ensemble',
      ballotOrder: 1
    });
    paidCandidateId = paidCand.id;

    // Package for Paid Election
    const pkg = await votingPackagesService.createPackage(orgId, userId, {
      electionId: paidElectionId,
      name: 'Supporter 5-Pack',
      credits: 5,
      priceCents: 450
    });
    paidPackageId = pkg.id;

    paidVoterCode = `VTR-FAN-${Date.now().toString().slice(-4)}`;
  });

  describe('1. Institutional Voting & Confidentiality', () => {
    it('authorizes an eligible institutional voter and casts a confidential ballot', async () => {
      // 1. Request One-Time Authorization
      const auth = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: instElectionId,
        voterCode: instVoterCode,
        positionId: instPosition1Id
      });

      expect(auth.authorized).toBe(true);
      expect(auth.authorizationToken).toMatch(/^AUTH-/);
      expect(auth.creditsAllocated).toBe(1);

      // 2. Cast Ballot Using Authorization Token
      const voteResult = await votingService.castAuthorizedVote(orgId, {
        electionId: instElectionId,
        authorizationToken: auth.authorizationToken,
        positionId: instPosition1Id,
        candidateId: instCandidate1Id
      });

      expect(voteResult.success).toBe(true);
      expect(voteResult.receipt.receiptCode).toMatch(/^VTX-/);
      expect(voteResult.receipt.verified).toBe(true);
    });

    it('rejects duplicate voting attempts for the same position by an institutional voter', async () => {
      // 1st Vote for President
      const auth1 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: instElectionId,
        voterCode: instVoterCode,
        positionId: instPosition1Id
      });
      await votingService.castAuthorizedVote(orgId, {
        electionId: instElectionId,
        authorizationToken: auth1.authorizationToken,
        positionId: instPosition1Id,
        candidateId: instCandidate1Id
      });

      // 2nd Vote Attempt for same President position -> Rejected!
      await expect(
        voteAuthorizationService.requestAuthorization(orgId, {
          electionId: instElectionId,
          voterCode: instVoterCode,
          positionId: instPosition1Id
        })
      ).rejects.toThrowError('Institutional rule violation: Voter has already cast a ballot for this position');
    });

    it('allows an institutional voter to vote for different positions independently (one per position)', async () => {
      // Vote for President
      const auth1 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: instElectionId,
        voterCode: instVoterCode,
        positionId: instPosition1Id
      });
      const vote1 = await votingService.castAuthorizedVote(orgId, {
        electionId: instElectionId,
        authorizationToken: auth1.authorizationToken,
        positionId: instPosition1Id,
        candidateId: instCandidate1Id
      });
      expect(vote1.success).toBe(true);

      // Vote for Vice President
      const auth2 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: instElectionId,
        voterCode: instVoterCode,
        positionId: instPosition2Id
      });
      const vote2 = await votingService.castAuthorizedVote(orgId, {
        electionId: instElectionId,
        authorizationToken: auth2.authorizationToken,
        positionId: instPosition2Id,
        candidateId: instCandidate2Id
      });
      expect(vote2.success).toBe(true);
    });

    it('strictly forbids creating voting packages or purchasing votes for institutional elections', async () => {
      await expect(
        votingPackagesService.createPackage(orgId, userId, {
          electionId: instElectionId,
          name: 'Illegal Institutional Package',
          credits: 10,
          priceCents: 1000
        })
      ).rejects.toThrowError('Institutional elections do not support paid voting packages or credits');
    });
  });

  describe('2. Paid Competitions, Credit Wallets & Payment Simulation', () => {
    it('creates an independent wallet with zero initial balance and credits it upon mock payment', async () => {
      // 1. Initial wallet
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      expect(wallet.creditsBalance).toBe(0);

      // 2. Mock payment purchase
      const purchaseRes = await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      expect(purchaseRes.success).toBe(true);
      expect(purchaseRes.wallet.creditsBalance).toBe(5);
      expect(purchaseRes.transaction.type).toBe(WalletTransactionType.PURCHASE);
      expect(purchaseRes.transaction.isMockPayment).toBe(true);
      expect(purchaseRes.transaction.referenceId).toMatch(/^MOCK-PAY-/);
    });

    it('rejects vote authorization when wallet has insufficient credits', async () => {
      // Voter has 0 credits
      await expect(
        voteAuthorizationService.requestAuthorization(orgId, {
          electionId: paidElectionId,
          voterCode: paidVoterCode,
          positionId: paidPositionId,
          creditsRequested: 1
        })
      ).rejects.toThrowError('Insufficient voting credits in wallet');
    });

    it('atomically consumes credits from the election wallet and allows multiple paid votes', async () => {
      // Purchase 5 credits
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      // 1st Vote: request 2 credits
      const auth1 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 2
      });

      const vote1 = await votingService.castAuthorizedVote(orgId, {
        electionId: paidElectionId,
        authorizationToken: auth1.authorizationToken,
        positionId: paidPositionId,
        candidateId: paidCandidateId
      });
      expect(vote1.success).toBe(true);

      // Verify wallet balance is 3
      const walletAfter1 = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      expect(walletAfter1.creditsBalance).toBe(3);

      // 2nd Vote: request 3 credits
      const auth2 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 3
      });

      const vote2 = await votingService.castAuthorizedVote(orgId, {
        electionId: paidElectionId,
        authorizationToken: auth2.authorizationToken,
        positionId: paidPositionId,
        candidateId: paidCandidateId
      });
      expect(vote2.success).toBe(true);

      // Verify wallet balance is 0
      const walletAfter2 = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      expect(walletAfter2.creditsBalance).toBe(0);

      // 3rd Vote: now empty -> rejected!
      await expect(
        voteAuthorizationService.requestAuthorization(orgId, {
          electionId: paidElectionId,
          voterCode: paidVoterCode,
          positionId: paidPositionId,
          creditsRequested: 1
        })
      ).rejects.toThrowError('Insufficient voting credits in wallet');
    });

    it('guarantees wallet balance can never become negative', async () => {
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      expect(wallet.creditsBalance).toBe(0);

      await expect(
        voterWalletService.consumeCredits(
          orgId,
          paidElectionId,
          paidVoterCode,
          10,
          'REF-FAIL',
          'Attempt overdraft'
        )
      ).rejects.toThrowError('Insufficient voting credits in wallet');

      const check = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      expect(check.creditsBalance).toBe(0);
    });

    it('maintains a complete transaction history of purchases and spends', async () => {
      // Purchase 5
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      // Spend 2
      const auth = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 2
      });
      await votingService.castAuthorizedVote(orgId, {
        electionId: paidElectionId,
        authorizationToken: auth.authorizationToken,
        positionId: paidPositionId,
        candidateId: paidCandidateId
      });

      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, paidVoterCode);
      const history = await voterWalletService.getWalletTransactions(wallet.id, paidElectionId);

      expect(history.length).toBe(2);
      expect(history[0]?.type).toBe(WalletTransactionType.SPEND);
      expect(history[0]?.creditsAmount).toBe(-2);
      expect(history[0]?.balanceAfter).toBe(3);

      expect(history[1]?.type).toBe(WalletTransactionType.PURCHASE);
      expect(history[1]?.creditsAmount).toBe(5);
      expect(history[1]?.balanceAfter).toBe(5);
    });
  });

  describe('3. One-Time Authorizations & Token Security', () => {
    it('rejects reused one-time authorization tokens (no credit spent twice)', async () => {
      // Purchase credits
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      const auth = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 1
      });

      // 1st submission succeeds
      await votingService.castAuthorizedVote(orgId, {
        electionId: paidElectionId,
        authorizationToken: auth.authorizationToken,
        positionId: paidPositionId,
        candidateId: paidCandidateId
      });

      // 2nd submission with same token -> Rejected!
      await expect(
        votingService.castAuthorizedVote(orgId, {
          electionId: paidElectionId,
          authorizationToken: auth.authorizationToken,
          positionId: paidPositionId,
          candidateId: paidCandidateId
        })
      ).rejects.toThrowError('This one-time authorization token has already been used');
    });

    it('rejects expired authorization tokens', async () => {
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      const auth = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 1
      });

      // Tamper expiration to past
      const tokenHash = require('crypto').createHash('sha256').update(auth.authorizationToken).digest('hex');
      const localMap = (voteAuthorizationService as any).constructor.localAuthorizations;
      const record = localMap.get(tokenHash);
      if (record) {
        record.expiresAt = new Date(Date.now() - 60000).toISOString(); // 1 minute in past
      }

      await expect(
        votingService.castAuthorizedVote(orgId, {
          electionId: paidElectionId,
          authorizationToken: auth.authorizationToken,
          positionId: paidPositionId,
          candidateId: paidCandidateId
        })
      ).rejects.toThrowError('Vote authorization token has expired');
    });
  });

  describe('4. Cross-Election Isolation & Scoping Checks', () => {
    it('strictly forbids cross-election credit access or token reuse', async () => {
      // Create a second paid election
      const paidElection2 = await electionsService.createElection(orgId, userId, {
        category: ElectionCategory.PAID_COMPETITION,
        title: `Second Unrelated Competition ${Date.now()}`,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });
      await electionsService.transitionStatus(orgId, paidElection2.id, userId, ElectionStatus.ACTIVE);

      const pos2 = await positionsService.createPosition(orgId, paidElection2.id, userId, {
        title: 'Contest Office',
        minSelections: 1,
        maxSelections: 1
      });

      // Purchase credits in Election 1
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      const authInElec1 = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 1
      });

      // Try to use token from Election 1 in Election 2 -> Blocked!
      await expect(
        votingService.castAuthorizedVote(orgId, {
          electionId: paidElection2.id,
          authorizationToken: authInElec1.authorizationToken,
          positionId: pos2.id,
          candidateId: paidCandidateId
        })
      ).rejects.toThrowError('Authorization token does not match target election');
    });
  });

  describe('5. Error Handling, Rollback & Validation Guards', () => {
    it('rejects votes cast for invalid or foreign candidates', async () => {
      await mockPaymentService.processMockPayment(orgId, {
        electionId: paidElectionId,
        packageId: paidPackageId,
        voterCode: paidVoterCode
      });

      const auth = await voteAuthorizationService.requestAuthorization(orgId, {
        electionId: paidElectionId,
        voterCode: paidVoterCode,
        positionId: paidPositionId,
        creditsRequested: 1
      });

      await expect(
        votingService.castAuthorizedVote(orgId, {
          electionId: paidElectionId,
          authorizationToken: auth.authorizationToken,
          positionId: paidPositionId,
          candidateId: 'cand-non-existent-999'
        })
      ).rejects.toThrowError('Selected candidate does not exist or is not registered for this position');
    });

    it('rejects voting when election is closed or in draft status', async () => {
      // Close institutional election
      await electionsService.transitionStatus(orgId, instElectionId, userId, ElectionStatus.CLOSED);

      await expect(
        voteAuthorizationService.requestAuthorization(orgId, {
          electionId: instElectionId,
          voterCode: instVoterCode,
          positionId: instPosition1Id
        })
      ).rejects.toThrowError('Election is not currently active for voting');
    });
  });
});
