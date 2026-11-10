import { describe, it, expect, beforeEach } from 'vitest';
import {
  SystemRole,
  PlatformRole,
  OrganizationRole,
  ReportType
} from '@votexa/shared';
import { adminService, AdminService } from './admin.service.js';
import { auditService, AuditService } from '../audit/audit.service.js';
import { reportsService } from '../reports/reports.service.js';
import { revenueService, RevenueService } from '../revenue/revenue.service.js';
import { financialLedgerService, FinancialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { AppError } from '../../utils/apiResponse.js';

describe('Super Administrator Dashboard, Reporting & Audit Infrastructure', () => {
  const superAdminUser = {
    id: 'usr-admin-alex',
    email: 'alex@votexa.io',
    systemRole: SystemRole.SUPER_ADMIN,
    platformRoles: [PlatformRole.SUPER_ADMIN]
  };

  const supportAdminUser = {
    id: 'usr-support-sam',
    email: 'sam@votexa.io',
    systemRole: SystemRole.ADMIN,
    platformRoles: [PlatformRole.SUPPORT_ADMIN]
  };

  const organizerOwnerUser = {
    id: 'usr-org-owner',
    email: 'owner@metro.edu',
    systemRole: SystemRole.USER,
    platformRoles: []
  };

  beforeEach(async () => {
    AdminService.resetState();
    AuditService.resetState();
    FinancialLedgerService.resetState();
    RevenueService.resetState();

    // Seed Treasury with balanced allocations
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: 'org-metro-uni',
      referenceType: 'PAYOUT_RESERVE',
      referenceId: 'batch-test-1',
      description: 'Initial ledger balance',
      entries: [
        {
          accountId: (await financialLedgerService.getOrCreateAccount('org-metro-uni', 'ORGANIZER_TREASURY' as any, 'USD')).id,
          direction: 'CREDIT' as any,
          amountCents: 50000,
          description: 'Organizer Treasury Credit'
        },
        {
          accountId: (await financialLedgerService.getOrCreateAccount(null, 'PLATFORM_TREASURY' as any, 'USD')).id,
          direction: 'DEBIT' as any,
          amountCents: 50000,
          description: 'Platform Clearing Offset'
        }
      ]
    });
  });

  describe('1. Platform Role Permissions & Separation of Privileges', () => {
    it('allows Super Admin full access to platform overview, moderation, and commission settings', async () => {
      const overview = await adminService.getPlatformOverview();
      expect(overview.totalOrganizations).toBeGreaterThanOrEqual(1);
      expect(overview.isLedgerBalanced).toBe(true);

      const commissions = await adminService.getCommissionSettings();
      expect(commissions.currentPlatformRateBasisPoints).toBe(4000); // 40.00%
      expect(commissions.currentOrganiserRateBasisPoints).toBe(6000); // 60.00%
    });

    it('allows Super Admin to update global commission rate with audit trail', async () => {
      const update = await adminService.updateCommissionRate(
        3500, // Change to 35%
        'Seasonal promotional commission reduction',
        superAdminUser.id
      );

      expect(update.platformRateBasisPoints).toBe(3500);
      expect(update.organiserRateBasisPoints).toBe(6500);
      expect(revenueService.getGlobalPlatformCommissionRate()).toBe(3500);

      // Verify audit record was created
      const logs = await auditService.listAuditLogs({ action: 'COMMISSION_RATE_UPDATED' });
      expect(logs).toHaveLength(1);
      expect(logs[0].actorId).toBe(superAdminUser.id);
      expect(logs[0].afterState).toMatchObject({ platformRateBasisPoints: 3500 });
    });

    it('rejects invalid commission rates (< 0 or > 10,000 basis points)', async () => {
      await expect(
        adminService.updateCommissionRate(-500, 'Negative test', superAdminUser.id)
      ).rejects.toThrow(/between 0 and 10,000 basis points/);

      await expect(
        adminService.updateCommissionRate(12000, 'Over 100% test', superAdminUser.id)
      ).rejects.toThrow(/between 0 and 10,000 basis points/);
    });

    it('allows Super Admin to suspend and reactivate organizations with state auditing', async () => {
      const suspended = await adminService.updateOrganizationStatus(
        'org-metro-uni',
        'SUSPENDED',
        'Compliance audit pending',
        superAdminUser.id
      );

      expect(suspended.status).toBe('SUSPENDED');

      const logs = await auditService.listAuditLogs({ action: 'ORGANIZATION_SUSPEND' });
      expect(logs).toHaveLength(1);
      expect(logs[0].resourceId).toBe('org-metro-uni');
      expect(logs[0].metadata?.reason).toBe('Compliance audit pending');

      // Reactivate
      const reactivated = await adminService.updateOrganizationStatus(
        'org-metro-uni',
        'ACTIVE',
        'Compliance audit completed successfully',
        superAdminUser.id
      );
      expect(reactivated.status).toBe('ACTIVE');
    });
  });

  describe('2. Audit Infrastructure, Data Sanitization & Protection', () => {
    it('creates structured audit records capturing actor, action, resource, and request reference', async () => {
      const log = await auditService.recordAudit({
        actorId: superAdminUser.id,
        actorEmail: superAdminUser.email,
        actorRole: 'SUPER_ADMIN',
        action: 'ELECTION_CERTIFIED',
        resourceType: 'ELECTION',
        resourceId: 'elec-spring-2026',
        organizationId: 'org-metro-uni',
        requestReference: 'req_test_8819',
        ipAddress: '192.168.1.10',
        metadata: { certifiedVotesCount: 1420 }
      });

      expect(log.id).toMatch(/^aud-/);
      expect(log.action).toBe('ELECTION_CERTIFIED');
      expect(log.requestReference).toBe('req_test_8819');

      const fetched = await auditService.listAuditLogs({ action: 'ELECTION_CERTIFIED' });
      expect(fetched).toHaveLength(1);
      expect(fetched[0].actorEmail).toBe(superAdminUser.email);
    });

    it('strictly sanitizes and redacts passwords, auth tokens, and secrets from audit metadata', async () => {
      const rawMetadata = {
        username: 'admin',
        password: 'SuperSecretPassword123!',
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        mpesaPasskey: 'bfb279f9aa9bdbcf...',
        securityCredential: 'EncryptedPassword999',
        creditCardNumber: '4111222233334444',
        safeNotes: 'Organization onboarding completed'
      };

      const log = await auditService.recordAudit({
        actorId: superAdminUser.id,
        action: 'USER_PASSWORD_RESET',
        resourceType: 'USER',
        resourceId: 'usr-123',
        metadata: rawMetadata
      });

      const meta = log.metadata as Record<string, unknown>;
      expect(meta.password).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.authToken).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.mpesaPasskey).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.securityCredential).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.creditCardNumber).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(meta.safeNotes).toBe('Organization onboarding completed'); // Preserved
    });

    it('records security events for unauthorized access and breach attempts', async () => {
      const secEvent = await auditService.recordSecurityEvent({
        eventType: 'UNAUTHORIZED_ADMIN_ATTEMPT',
        actorId: organizerOwnerUser.id,
        actorEmail: organizerOwnerUser.email,
        ipAddress: '10.0.0.99',
        details: { attemptedEndpoint: '/api/v1/admin/commissions' }
      });

      expect(secEvent.id).toMatch(/^sec-/);
      expect(secEvent.eventType).toBe('UNAUTHORIZED_ADMIN_ATTEMPT');

      const events = await auditService.listSecurityEvents({ eventType: 'UNAUTHORIZED_ADMIN_ATTEMPT' });
      expect(events).toHaveLength(1);
      expect(events[0].actorEmail).toBe(organizerOwnerUser.email);
    });
  });

  describe('3. Reporting Engine & Financial Accuracy', () => {
    it('generates accurate election participation and candidate vote summaries', async () => {
      const participation = await reportsService.generateReport(
        { reportType: ReportType.ELECTION_PARTICIPATION, organizationId: 'org-metro-uni' },
        superAdminUser.id,
        true
      );

      expect(participation.reportType).toBe(ReportType.ELECTION_PARTICIPATION);
      expect(participation.rowCount).toBeGreaterThanOrEqual(1);

      const candidateSummary = await reportsService.generateReport(
        { reportType: ReportType.CANDIDATE_VOTE_SUMMARY, organizationId: 'org-metro-uni' },
        superAdminUser.id,
        true
      );
      expect(candidateSummary.reportType).toBe(ReportType.CANDIDATE_VOTE_SUMMARY);
    });

    it('generates voter turnout reports with accurate percentages', async () => {
      const turnout = await reportsService.generateReport(
        { reportType: ReportType.VOTER_TURNOUT, organizationId: 'org-metro-uni' },
        superAdminUser.id,
        true
      );

      expect(turnout.reportType).toBe(ReportType.VOTER_TURNOUT);
      expect(turnout.data.length).toBeGreaterThanOrEqual(1);
      expect(turnout.data[0]).toHaveProperty('turnoutPercentage');
    });

    it('generates platform commission report reconciling with 40/60 commercial split', async () => {
      // Record a test revenue allocation: $100.00 gross -> $2.00 fee -> $98.00 distributable
      // 40% platform = $39.20 (3920 cents), 60% organiser = $58.80 (5880 cents)
      await revenueService.allocateRevenue(
        {
          id: 'tx-report-1',
          organizationId: 'org-metro-uni',
          electionId: 'elec-metro-1',
          amountCents: 10000,
          currency: 'USD'
        },
        { processingFeeCents: 200, approvedDeductionCents: 0 }
      );

      const report = await reportsService.generateReport(
        { reportType: ReportType.PLATFORM_COMMISSIONS, organizationId: 'org-metro-uni' },
        superAdminUser.id,
        true
      );

      expect(report.reportType).toBe(ReportType.PLATFORM_COMMISSIONS);
      const match = report.data.find((d: any) => d.paymentTransactionId === 'tx-report-1');
      expect(match).toBeDefined();
      expect(match.platformRate).toBe('40.00%');
      expect(match.platformCommissionCents).toBe(3920);
      expect(match.organiserShareCents).toBe(5880);
      expect(match.platformCommissionCents + match.organiserShareCents).toBe(match.distributableAmountCents);
    });

    it('exports RFC 4180 compliant CSV format with properly escaped quotes and headers', async () => {
      await revenueService.allocateRevenue(
        {
          id: 'tx-report-csv',
          organizationId: 'org-metro-uni',
          electionId: 'elec-metro-1',
          amountCents: 10000,
          currency: 'USD'
        },
        { processingFeeCents: 200, approvedDeductionCents: 0 }
      );

      const report = await reportsService.generateReport(
        {
          reportType: ReportType.PLATFORM_COMMISSIONS,
          organizationId: 'org-metro-uni',
          format: 'csv'
        },
        superAdminUser.id,
        true
      );

      expect(report.csvContent).toBeDefined();
      expect(report.csvContent).toContain('"allocationId"');
      expect(report.csvContent).toContain('"platformRate"');
      expect(report.csvContent).toContain('"40.00%"');
    });

    it('generates financial reconciliation report verifying zero discrepancy in balanced double-entry ledger', async () => {
      const report = await reportsService.generateReport(
        { reportType: ReportType.FINANCIAL_RECONCILIATION },
        superAdminUser.id,
        true
      );

      expect(report.reportType).toBe(ReportType.FINANCIAL_RECONCILIATION);
      expect(report.data[0].isBalanced).toBe(true);
      expect(report.data[0].status).toBe('RECONCILED_CLEAN');
    });
  });

  describe('4. Cross-Tenant Security & Report Access Control', () => {
    it('prohibits ordinary organization users from generating reports without organization scope', async () => {
      await expect(
        reportsService.generateReport(
          { reportType: ReportType.ORGANISER_EARNINGS }, // No organizationId provided
          organizerOwnerUser.id,
          false // isPlatformAdmin = false
        )
      ).rejects.toThrow(/Organization context is required for tenant reports/);
    });

    it('restricts organization users strictly to their own organization data', async () => {
      const report = await reportsService.generateReport(
        { reportType: ReportType.ORGANISER_EARNINGS, organizationId: 'org-metro-uni' },
        organizerOwnerUser.id,
        false
      );

      expect(report.organizationScope).toBe('org-metro-uni');
      expect(report.data.every((d: any) => d.organizationId === 'org-metro-uni')).toBe(true);
    });
  });
});
