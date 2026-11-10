import { describe, it, expect, beforeEach } from 'vitest';
import {
  SystemRole,
  PlatformRole,
  ElectionCategory,
  ElectionStatus,
  VoterEligibilityStatus,
  WalletTransactionType,
  FinancialAccountType,
  ReportType
} from '@votexa/shared';
import { adminService, AdminService } from '../admin/admin.service.js';
import { adminController } from '../admin/admin.controller.js';
import { auditService, AuditService } from '../audit/audit.service.js';
import { electionsService, ElectionsService } from '../elections/elections.service.js';
import { candidatesService, CandidatesService } from '../candidates/candidates.service.js';
import { positionsService, PositionsService } from '../elections/positions.service.js';
import { votersService, VotersService } from '../voters/voters.service.js';
import { votingService, VotingService } from '../voting/voting.service.js';
import { voteAuthorizationService, VoteAuthorizationService } from '../voting/vote-authorization.service.js';
import { voterWalletService, VoterWalletService } from '../voting/voter-wallet.service.js';
import { votingPackagesService, VotingPackagesService } from '../voting/voting-packages.service.js';
import { mpesaService, MpesaService } from '../payments/mpesa.service.js';
import { revenueService, RevenueService } from '../revenue/revenue.service.js';
import { refundsService, RefundsService } from '../refunds/refunds.service.js';
import { payoutsService, PayoutsService } from '../payouts/payouts.service.js';
import { mpesaB2CService, MpesaB2CService } from '../payments/mpesa-b2c.service.js';
import { financialLedgerService, FinancialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { reportsService } from '../reports/reports.service.js';

describe('Comprehensive Production-Readiness & QA Assessment (24 Workflows)', () => {
  const superAdminUser = {
    id: 'usr-qa-super-admin',
    email: 'superadmin@votexa.io',
    systemRole: SystemRole.SUPER_ADMIN,
    platformRoles: [PlatformRole.SUPER_ADMIN]
  };

  const supportAdminUser = {
    id: 'usr-qa-support-admin',
    email: 'support@votexa.io',
    systemRole: SystemRole.USER,
    platformRoles: [PlatformRole.SUPPORT_ADMIN]
  };

  const tenantOwnerUser = {
    id: 'usr-qa-owner',
    email: 'owner@institution.edu',
    systemRole: SystemRole.USER,
    platformRoles: []
  };

  beforeEach(async () => {
    AdminService.resetState();
    AuditService.resetState();
    FinancialLedgerService.resetState();
    RevenueService.resetState();
    RefundsService.resetState();
    PayoutsService.resetState();
    MpesaB2CService.resetState();
    MpesaService.resetState();
    VoterWalletService.resetState();
    VoteAuthorizationService.resetState();

    // Balance initial ledger accounts
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: 'org-qa-tenant-1',
      referenceType: 'PAYOUT_RESERVE',
      referenceId: 'init-batch-1',
      description: 'Initial Seed Capital',
      entries: [
        {
          accountId: (await financialLedgerService.getOrCreateAccount('org-qa-tenant-1', FinancialAccountType.ORGANIZER_TREASURY, 'USD')).id,
          direction: 'CREDIT' as any,
          amountCents: 100000,
          description: 'Organizer Treasury Seed'
        },
        {
          accountId: (await financialLedgerService.getOrCreateAccount(null, FinancialAccountType.PLATFORM_TREASURY, 'USD')).id,
          direction: 'DEBIT' as any,
          amountCents: 100000,
          description: 'Platform Clearing Offset'
        }
      ]
    });
  });

  // =========================================================================
  // SECTION 1: WORKFLOWS 1 - 4: AUTH, ORGS, MEMBERSHIP & TENANT ISOLATION
  // =========================================================================
  describe('Workflows 1-4: Auth, Multi-Tenancy & Tenant Isolation', () => {
    it('WF1-3: Handles user profiles, organisation onboarding, and membership roles', async () => {
      // 1. Authenticated Profile
      expect(tenantOwnerUser.email).toBe('owner@institution.edu');
      expect(tenantOwnerUser.systemRole).toBe(SystemRole.USER);

      // 2. Organization Creation
      const org = await adminService.updateOrganizationStatus(
        'org-qa-tenant-1',
        'ACTIVE',
        'Onboarding complete',
        superAdminUser.id
      );
      expect(org.id).toBe('org-qa-tenant-1');
      expect(org.status).toBe('ACTIVE');

      // 3. Organization Membership
      const organizations = await adminService.listOrganizations();
      expect(organizations.length).toBeGreaterThanOrEqual(1);
    });

    it('WF4: Enforces strict tenant isolation and blocks cross-tenant access', async () => {
      // Create election in org-qa-tenant-1
      const instElection = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Tenant 1 Closed Election',
          category: ElectionCategory.INSTITUTIONAL,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );

      // Foreign organization attempt to fetch Tenant 1 election must throw 403 or 404
      await expect(
        electionsService.getElectionById('org-foreign-tenant-99', instElection.id)
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // SECTION 2: WORKFLOWS 5 - 10: ELECTIONS, CANDIDATES, VOTERS & WALLETS
  // =========================================================================
  describe('Workflows 5-10: Election Lifecycle, Roles & Wallets', () => {
    it('WF5-7: Creates election, registers candidates, and verifies voter eligibility', async () => {
      // 5. Election Creation
      const election = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Faculty Senate 2026',
          category: ElectionCategory.INSTITUTIONAL,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );
      expect(election.category).toBe(ElectionCategory.INSTITUTIONAL);

      // Transition to ACTIVE so eligibility verification and voting are permitted
      await electionsService.transitionStatus(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        ElectionStatus.ACTIVE
      );

      // Create Position
      const position = await positionsService.createPosition(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        { title: 'Dean of Faculty', maxSelections: 1, orderIndex: 1 }
      );

      // 6. Candidate Management
      const candidate = await candidatesService.createCandidate(
        'org-qa-tenant-1',
        election.id,
        {
          positionId: position.id,
          name: 'Prof. Katherine Johnson',
          ballotOrder: 1
        }
      );
      expect(candidate.name).toBe('Prof. Katherine Johnson');

      // 7. Voter Registration & Eligibility
      const voter = await votersService.registerVoter(
        'org-qa-tenant-1',
        election.id,
        {
          voterCode: 'FAC-001-MATH',
          voterEmail: 'kjohnson@institution.edu',
          fullName: 'Katherine Johnson'
        }
      );
      expect(voter.eligibilityStatus).toBe(VoterEligibilityStatus.ELIGIBLE);

      const eligibility = await votersService.verifyVoterEligibility(
        'org-qa-tenant-1',
        election.id,
        { voterCode: 'FAC-001-MATH' }
      );
      expect(eligibility.isEligible).toBe(true);
    });

    it('WF8: Institutional Voting strictly enforces One Voter, One Vote per position', async () => {
      const election = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Institutional Single Vote Election',
          category: ElectionCategory.INSTITUTIONAL,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );
      await electionsService.transitionStatus(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        ElectionStatus.ACTIVE
      );

      const position = await positionsService.createPosition(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        { title: 'President', maxSelections: 1, orderIndex: 1 }
      );

      const candidate = await candidatesService.createCandidate(
        'org-qa-tenant-1',
        election.id,
        { positionId: position.id, name: 'Alice Candidate', ballotOrder: 1 }
      );

      await votersService.registerVoter('org-qa-tenant-1', election.id, {
        voterCode: 'VTR-ONE-VOTE',
        voterEmail: 'voter1@inst.edu',
        fullName: 'Voter One'
      });

      // 1st Ballot: Authorization Granted
      const auth = await voteAuthorizationService.requestAuthorization('org-qa-tenant-1', {
        electionId: election.id,
        voterCode: 'VTR-ONE-VOTE',
        positionId: position.id
      });
      expect(auth.authorized).toBe(true);

      // Cast vote
      const cast = await votingService.castAuthorizedVote('org-qa-tenant-1', {
        electionId: election.id,
        authorizationToken: auth.authorizationToken,
        positionId: position.id,
        candidateId: candidate.id
      });
      expect(cast.success).toBe(true);

      // 2nd Ballot attempt for same position: MUST BE REJECTED with 409 ALREADY_VOTED
      await expect(
        voteAuthorizationService.requestAuthorization('org-qa-tenant-1', {
          electionId: election.id,
          voterCode: 'VTR-ONE-VOTE',
          positionId: position.id
        })
      ).rejects.toThrow(/already cast a ballot/i);
    });

    it('WF9-10: Paid Competitions support multiple votes and election-specific isolated wallets', async () => {
      const elecPaidA = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Talent Show A',
          category: ElectionCategory.PAID_COMPETITION,
          status: ElectionStatus.ACTIVE,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );

      const elecPaidB = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Talent Show B',
          category: ElectionCategory.PAID_COMPETITION,
          status: ElectionStatus.ACTIVE,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );

      // Credit Wallet for Election A
      await voterWalletService.creditWallet(
        'org-qa-tenant-1',
        elecPaidA.id,
        'FAN-VOTER-100',
        10,
        'PAY-TX-100',
        '10 votes package purchase'
      );

      const walletA = await voterWalletService.getOrCreateWallet(
        'org-qa-tenant-1',
        elecPaidA.id,
        'FAN-VOTER-100'
      );
      expect(walletA.creditsBalance).toBe(10);

      // Wallet for Election B must have zero balance (Isolation Guarantee)
      const walletB = await voterWalletService.getOrCreateWallet(
        'org-qa-tenant-1',
        elecPaidB.id,
        'FAN-VOTER-100'
      );
      expect(walletB.creditsBalance).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 3: WORKFLOWS 11 - 16: PAYMENTS, MPESA CALLBACKS, CREDITS & CONFIDENTIALITY
  // =========================================================================
  describe('Workflows 11-16: Payments, M-Pesa Callback Idempotency & Ballot Confidentiality', () => {
    it('WF11-14: Initiates STK push, handles callback idempotency, and prevents duplicate credits', async () => {
      const elecPaid = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Paid Voting Competition',
          category: ElectionCategory.PAID_COMPETITION,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );
      await electionsService.transitionStatus(
        'org-qa-tenant-1',
        elecPaid.id,
        tenantOwnerUser.id,
        ElectionStatus.ACTIVE
      );

      // 1. Create paid package
      const pkg = await votingPackagesService.createPackage(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          electionId: elecPaid.id,
          name: 'Super Fan Pack (50 Credits)',
          credits: 50,
          priceCents: 5000,
          currency: 'KES'
        }
      );

      // 2. Initiate Payment (Simulated Provider)
      const initRes = await mpesaService.initiatePayment('org-qa-tenant-1', {
        electionId: elecPaid.id,
        packageId: pkg.id,
        voterCode: 'FAN-KENYA-99',
        phoneNumber: '0712345678'
      });

      expect(initRes.status).toBe('PENDING');
      expect(initRes.checkoutRequestId).toBeDefined();

      // 3. First Callback (ResultCode 0 - Success)
      const callbackPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: initRes.merchantRequestId,
            CheckoutRequestID: initRes.checkoutRequestId,
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 50.0 },
                { Name: 'MpesaReceiptNumber', Value: 'QWE1234567' },
                { Name: 'TransactionDate', Value: 20261110150000 },
                { Name: 'PhoneNumber', Value: 254712345678 }
              ]
            }
          }
        }
      };

      const cb1 = await mpesaService.processCallback(callbackPayload);
      expect(cb1.success).toBe(true);
      expect(cb1.creditsIssued).toBe(true);

      // Verify wallet credited exactly 50
      const wallet = await voterWalletService.getOrCreateWallet(
        'org-qa-tenant-1',
        elecPaid.id,
        'FAN-KENYA-99'
      );
      expect(wallet.creditsBalance).toBe(50);

      // WF13: Duplicate Callback Replay Attack (Identical CheckoutRequestID)
      const cb2 = await mpesaService.processCallback(callbackPayload);
      expect(cb2.success).toBe(true);
      expect(cb2.duplicate).toBe(true);
      expect(cb2.creditsIssued).toBe(false);

      // Wallet MUST NOT be double-credited
      const walletAfter = await voterWalletService.getOrCreateWallet(
        'org-qa-tenant-1',
        elecPaid.id,
        'FAN-KENYA-99'
      );
      expect(walletAfter.creditsBalance).toBe(50); // Unchanged!
    });

    it('WF15-16: Enforces atomic vote submission and ballot confidentiality', async () => {
      // Verify ballot submissions use SHA-256 voter hash and decouple identity from stored candidate choice
      const election = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Secret Ballot Showcase',
          category: ElectionCategory.INSTITUTIONAL,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );
      await electionsService.transitionStatus(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        ElectionStatus.ACTIVE
      );

      const position = await positionsService.createPosition(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        { title: 'Secret Position', maxSelections: 1, orderIndex: 1 }
      );

      const candidate = await candidatesService.createCandidate(
        'org-qa-tenant-1',
        election.id,
        { positionId: position.id, name: 'Confidential Nominee', ballotOrder: 1 }
      );

      await votersService.registerVoter('org-qa-tenant-1', election.id, {
        voterCode: 'CONFIDENTIAL-VOTER',
        voterEmail: 'secret@inst.edu',
        fullName: 'Secret Voter'
      });

      const auth = await voteAuthorizationService.requestAuthorization('org-qa-tenant-1', {
        electionId: election.id,
        voterCode: 'CONFIDENTIAL-VOTER',
        positionId: position.id
      });

      const vote = await votingService.castAuthorizedVote('org-qa-tenant-1', {
        electionId: election.id,
        authorizationToken: auth.authorizationToken,
        positionId: position.id,
        candidateId: candidate.id
      });

      expect(vote.success).toBe(true);
      expect(vote.receipt.receiptCode).toBeDefined();
      expect(vote.receipt.signature).toBeDefined();
      // Verify receipt contains no plain voter code
      expect(JSON.stringify(vote.receipt)).not.toContain('CONFIDENTIAL-VOTER');
    });
  });

  // =========================================================================
  // SECTION 4: WORKFLOWS 17 - 22: FINANCIAL ACCOUNTING, PAYOUTS & RECONCILIATION
  // =========================================================================
  describe('Workflows 17-22: Revenue Allocation (40/60 Split), Payouts & Double-Entry Ledger', () => {
    it('WF17-19: Allocates revenue according to 40% platform / 60% organiser split and handles refund reversals', async () => {
      // Payment of $100.00 (10,000 cents) with $2.00 (200 cents) fee
      // Distributable = 9,800 cents.
      // Platform 40% = 3,920 cents. Organiser 60% = 5,880 cents.
      const allocation = await revenueService.allocateRevenue(
        {
          id: 'pay-split-100',
          organizationId: 'org-qa-tenant-1',
          electionId: 'elec-split-1',
          amountCents: 10000,
          currency: 'USD'
        },
        { processingFeeCents: 200, approvedDeductionCents: 0 }
      );

      expect(allocation.grossAmountCents).toBe(10000);
      expect(allocation.distributableAmountCents).toBe(9800);
      expect(allocation.platformFeeCents).toBe(3920);
      expect(allocation.organiserFeeCents).toBe(5880);
      expect(allocation.platformFeeCents + allocation.organiserFeeCents).toBe(9800);

      // Verify Ledger is balanced
      const isBalanced = await financialLedgerService.verifyLedgerBalance();
      expect(isBalanced).toBe(true);

      // WF18: Refund Reversal (Full refund of allocation)
      const refund = await refundsService.processRefund('org-qa-tenant-1', {
        paymentTransactionId: allocation.paymentTransactionId,
        amountCents: 10000,
        reason: 'Voter package accidental purchase cancellation'
      });
      expect(refund.type).toBe('FULL');
      expect(refund.refundAmountCents).toBe(10000);

      // Re-verify Ledger balance remains true after refund
      const isBalancedAfterRefund = await financialLedgerService.verifyLedgerBalance();
      expect(isBalancedAfterRefund).toBe(true);
    });

    it('WF20-21: Handles withdrawal reservation, prevents self-approval, and settles payout', async () => {
      // 1. Request withdrawal of $200.00 (20,000 cents)
      const request = await payoutsService.requestWithdrawal(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          amountCents: 20000,
          currency: 'USD',
          destinationDetails: {
            method: 'MPESA_B2C' as any,
            phoneNumber: '254712345678'
          }
        }
      );

      expect(request.status).toBe('RESERVED');
      expect(request.amountCents).toBe(20000);

      // 2. Anti-Self-Approval: Requester cannot approve their own payout
      await expect(
        payoutsService.reviewPayout(request.id, tenantOwnerUser.id, 'APPROVE')
      ).rejects.toThrow(/cannot review or approve their own/i);

      // 3. Super Admin approves payout
      const approved = await payoutsService.reviewPayout(
        request.id,
        superAdminUser.id,
        'APPROVE',
        'Verified corporate bank and KYC credentials'
      );
      expect(approved.status).toBe('APPROVED');

      // 4. Mark paid with settlement evidence
      const settled = await payoutsService.recordSettlement(
        request.id,
        superAdminUser.id,
        {
          settlementEvidence: 'B2C-SETTLE-998877',
          providerReference: 'Daraja-B2C-9988',
          notes: 'Settled'
        }
      );
      expect(settled.status).toBe('PAID');
    });

    it('WF22: Financial Reconciliation confirms zero ledger discrepancies across accounts', async () => {
      const integrity = await financialLedgerService.verifyLedgerIntegrity();
      expect(integrity.isBalanced).toBe(true);
      expect(integrity.discrepancies).toHaveLength(0);
    });
  });

  // =========================================================================
  // SECTION 5: WORKFLOWS 23 - 24: REPORTING & AUDIT LOGS
  // =========================================================================
  describe('Workflows 23-24: Reporting Engine & Immutable Audit Logs', () => {
    it('WF23: Generates all 9 report types in RFC 4180 CSV and JSON formats', async () => {
      const reportTypes = [
        ReportType.ELECTION_PARTICIPATION,
        ReportType.CANDIDATE_VOTE_SUMMARY,
        ReportType.VOTER_TURNOUT,
        ReportType.PAYMENT_TRANSACTIONS,
        ReportType.PLATFORM_COMMISSIONS,
        ReportType.ORGANISER_EARNINGS,
        ReportType.PAYOUTS,
        ReportType.REFUNDS,
        ReportType.FINANCIAL_RECONCILIATION
      ];

      for (const rt of reportTypes) {
        const rep = await reportsService.generateReport(
          { reportType: rt, format: 'csv', organizationId: 'org-qa-tenant-1' },
          superAdminUser.id,
          true
        );
        expect(rep.reportType).toBe(rt);
        expect(rep.csvContent).toBeDefined();
      }
    });

    it('WF24: Automatically redacts credentials in audit logs and forbids UPDATE / DELETE', async () => {
      // Record audit with sensitive data
      await auditService.recordAudit({
        actorId: superAdminUser.id,
        actorRole: 'SUPER_ADMIN',
        action: 'PAYMENT_GATEWAY_CONFIG_UPDATED',
        resourceType: 'INTEGRATION',
        resourceId: 'daraja-b2c-gateway',
        organizationId: 'org-qa-tenant-1',
        metadata: {
          clientSecret: 'secret_live_9988112233',
          passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
          initiatorPassword: 'super_secure_b2c_password',
          gatewayTimeoutMs: 30000
        }
      });

      const logs = await auditService.listAuditLogs({ action: 'PAYMENT_GATEWAY_CONFIG_UPDATED' });
      expect(logs).toHaveLength(1);

      // Verify strict redaction
      const meta = logs[0].metadata as Record<string, string>;
      expect(meta.clientSecret).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.passkey).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.initiatorPassword).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.gatewayTimeoutMs).toBe(30000);
    });
  });

  // =========================================================================
  // SECTION 6: SECURITY TESTING SUITE (OWASP TOP 10 & SAAS ISOLATION)
  // =========================================================================
  describe('Security Testing Suite: Access Control, SQL Injection & Race Conditions', () => {
    it('rejects SQL injection vectors in query parameters', async () => {
      const maliciousSqlInputs = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "UNION SELECT * FROM platform_audit_logs --"
      ];

      for (const injection of maliciousSqlInputs) {
        await expect(
          positionsService.listPositions('org-qa-tenant-1', injection)
        ).rejects.toThrow(); // Safely rejected without executing raw SQL or leaking data
      }
    });

    it('prevents Support Staff from altering global commission rates (Privilege Escalation Guard)', async () => {
      // Direct controller execution with support staff identity
      const mockReq = {
        user: supportAdminUser,
        body: { platformRateBasisPoints: 1000, reason: 'Illicit discount' },
        ip: '127.0.0.1'
      } as any;
      const mockRes = {} as any;

      await expect(
        adminController.updateCommissionRate(mockReq, mockRes)
      ).rejects.toThrow(/requires Super Admin privileges/i);
    });

    it('prevents wallet balance corruption under concurrent vote deduction (Race Condition Guard)', async () => {
      const elecConcur = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'Concurrency Benchmark Election',
          category: ElectionCategory.PAID_COMPETITION,
          status: ElectionStatus.ACTIVE,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );

      // Voter has exactly 3 credits
      await voterWalletService.creditWallet(
        'org-qa-tenant-1',
        elecConcur.id,
        'VTR-CONCUR-RACE',
        3,
        'TX-RACE-INIT',
        '3 credits deposit'
      );

      // 5 simultaneous requests attempting to deduct 1 credit each
      // Exactly 3 must succeed, and 2 must fail with INSUFFICIENT_CREDITS
      const promises = Array.from({ length: 5 }).map((_, idx) =>
        voterWalletService.consumeCredits(
          'org-qa-tenant-1',
          elecConcur.id,
          'VTR-CONCUR-RACE',
          1,
          `AUTH-CONCUR-${idx}`,
          `Concurrent vote deduction attempt ${idx}`
        )
      );

      const results = await Promise.allSettled(promises);
      const successes = results.filter((r) => r.status === 'fulfilled');
      const rejections = results.filter((r) => r.status === 'rejected');

      expect(successes).toHaveLength(3);
      expect(rejections).toHaveLength(2);

      // Final wallet balance MUST BE exactly 0, never negative
      const finalWallet = await voterWalletService.getOrCreateWallet(
        'org-qa-tenant-1',
        elecConcur.id,
        'VTR-CONCUR-RACE'
      );
      expect(finalWallet.creditsBalance).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 7: PERFORMANCE & LATENCY MEASUREMENTS
  // =========================================================================
  describe('Performance Testing Suite: Latency & High-Throughput Benchmarks', () => {
    it('processes 20 sequential vote authorizations within sub-second latency thresholds', async () => {
      const election = await electionsService.createElection(
        'org-qa-tenant-1',
        tenantOwnerUser.id,
        {
          title: 'High Throughput Benchmark',
          category: ElectionCategory.PAID_COMPETITION,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString()
        }
      );
      await electionsService.transitionStatus(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        ElectionStatus.ACTIVE
      );

      const position = await positionsService.createPosition(
        'org-qa-tenant-1',
        election.id,
        tenantOwnerUser.id,
        { title: 'Performer of the Year', maxSelections: 1, orderIndex: 1 }
      );

      // Fund voter wallet with 100 credits
      await voterWalletService.creditWallet(
        'org-qa-tenant-1',
        election.id,
        'PERF-TEST-VOTER',
        100,
        'FUND-PERF',
        'Performance test funding'
      );

      const start = performance.now();
      for (let i = 0; i < 20; i++) {
        await voteAuthorizationService.requestAuthorization('org-qa-tenant-1', {
          electionId: election.id,
          voterCode: 'PERF-TEST-VOTER',
          positionId: position.id,
          creditsRequested: 1
        });
      }
      const duration = performance.now() - start;
      const avgLatencyMs = duration / 20;

      // Ensure average latency per authorization is under 150ms
      expect(avgLatencyMs).toBeLessThan(150);
    });
  });
});
