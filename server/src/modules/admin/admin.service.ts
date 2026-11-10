import crypto from 'crypto';
import {
  PlatformOverviewMetrics,
  CommissionSettingRecord,
  SystemRole,
  PlatformRole,
  ElectionStatus,
  ElectionCategory
} from '@votexa/shared';
import { pool } from '../../database/db.js';
import { AppError } from '../../utils/apiResponse.js';
import { auditService } from '../audit/audit.service.js';
import { revenueService } from '../revenue/revenue.service.js';
import { financialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { electionsService } from '../elections/elections.service.js';
import { payoutsService } from '../payouts/payouts.service.js';

export class AdminService {
  // In-memory local stores for test mode and offline preview
  private static localOrganizations = new Map<string, any>([
    [
      'org-metro-uni',
      {
        id: 'org-metro-uni',
        name: 'Metropolitan University',
        slug: 'metropolitan-uni',
        planId: 'ENTERPRISE',
        status: 'ACTIVE',
        settings: { timezone: 'America/New_York', contactEmail: 'elections@metro.edu' },
        memberCount: 14,
        electionCount: 3,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ],
    [
      'org-starlight-col',
      {
        id: 'org-starlight-col',
        name: 'Starlight Medical College',
        slug: 'starlight-college',
        planId: 'STANDARD',
        status: 'ACTIVE',
        settings: { timezone: 'America/Chicago', contactEmail: 'admin@starlight.edu' },
        memberCount: 8,
        electionCount: 2,
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z'
      }
    ]
  ]);

  private static localUsers = new Map<string, any>([
    [
      'usr-super-admin',
      {
        id: 'usr-super-admin',
        email: 'superadmin@votexa.io',
        fullName: 'Alexander Vance',
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ],
    [
      'usr-support-staff',
      {
        id: 'usr-support-staff',
        email: 'support@votexa.io',
        fullName: 'Support Admin Marcus',
        systemRole: SystemRole.USER,
        platformRoles: [PlatformRole.SUPPORT_ADMIN],
        status: 'ACTIVE',
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z'
      }
    ],
    [
      'usr-organizer-1',
      {
        id: 'usr-organizer-1',
        email: 'dean.vance@university.edu',
        fullName: 'Dean Alexander Vance',
        systemRole: SystemRole.USER,
        platformRoles: [],
        status: 'ACTIVE',
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z'
      }
    ]
  ]);

  private static localCommissionHistory: CommissionSettingRecord[] = [
    {
      id: 'com-seed-1',
      platformRateBasisPoints: 4000,
      organiserRateBasisPoints: 6000,
      updatedBy: 'usr-super-admin',
      reason: 'Initial 40/60 commercial split policy configuration',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  public static resetState(): void {
    // Reset local commission history to 40/60 split default
    AdminService.localCommissionHistory = [
      {
        id: 'com-seed-1',
        platformRateBasisPoints: 4000,
        organiserRateBasisPoints: 6000,
        updatedBy: 'usr-super-admin',
        reason: 'Initial 40/60 commercial split policy configuration',
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];
  }

  // --- 1. Platform Overview ---
  async getPlatformOverview(): Promise<PlatformOverviewMetrics> {
    const isLedgerBalanced = await financialLedgerService.verifyLedgerBalance();
    const superMetrics = await revenueService.getPlatformMetrics();
    const elections = await electionsService.listElections();
    const paidCompetitions = elections.filter((e) => e.category === ElectionCategory.PAID_COMPETITION);
    const activeElections = elections.filter((e) => e.status === ElectionStatus.ACTIVE);
    const payouts = await payoutsService.listPayouts();
    const paidPayouts = payouts.filter((p) => p.status === 'PAID');
    const payoutsSettledCents = paidPayouts.reduce((acc, p) => acc + p.netAmountCents, 0);

    return {
      totalOrganizations: AdminService.localOrganizations.size,
      activeOrganizations: Array.from(AdminService.localOrganizations.values()).filter((o) => o.status === 'ACTIVE').length,
      totalUsers: AdminService.localUsers.size,
      totalElections: elections.length,
      activeElections: activeElections.length,
      paidCompetitionsCount: paidCompetitions.length,
      totalPaymentVolumeCents: superMetrics.totalPaymentVolume,
      platformRevenueCents: superMetrics.platformRevenue,
      organiserLiabilitiesCents: superMetrics.organiserLiabilities,
      payoutsSettledCents,
      refundsTotalCents: superMetrics.refundsTotal,
      chargebacksTotalCents: superMetrics.chargebacksTotal,
      reconciliationDiscrepancies: superMetrics.reconciliationDiscrepancies,
      isLedgerBalanced,
      systemHealth: isLedgerBalanced ? 'OPERATIONAL' : 'DEGRADED'
    };
  }

  // --- 2. Organization Management ---
  async listOrganizations(filters?: { status?: string; search?: string }): Promise<any[]> {
    try {
      const client = await pool.connect();
      try {
        let query = `
          SELECT o.*, 
                 COUNT(DISTINCT om.user_id) as member_count,
                 COUNT(DISTINCT e.id) as election_count
          FROM organizations o
          LEFT JOIN organization_members om ON om.organization_id = o.id
          LEFT JOIN elections e ON e.organization_id = o.id
          WHERE 1=1
        `;
        const params: unknown[] = [];
        if (filters?.status) {
          params.push(filters.status);
          query += ` AND o.status = $${params.length}`;
        }
        if (filters?.search) {
          params.push(`%${filters.search}%`);
          query += ` AND (o.name ILIKE $${params.length} OR o.slug ILIKE $${params.length})`;
        }
        query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          planId: r.plan_id,
          status: r.status || 'ACTIVE',
          memberCount: parseInt(r.member_count, 10) || 0,
          electionCount: parseInt(r.election_count, 10) || 0,
          settings: r.settings || {},
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(AdminService.localOrganizations.values());
      if (filters?.status) list = list.filter((o) => o.status === filters.status);
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        list = list.filter((o) => o.name.toLowerCase().includes(s) || o.slug.toLowerCase().includes(s));
      }
      return list;
    }
  }

  async updateOrganizationStatus(
    orgId: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason: string,
    adminUserId: string
  ): Promise<any> {
    let org = AdminService.localOrganizations.get(orgId);
    const beforeState = org ? { ...org } : undefined;

    try {
      const client = await pool.connect();
      try {
        await client.query(`UPDATE organizations SET status = $1, updated_at = NOW() WHERE id = $2`, [status, orgId]);
      } finally {
        client.release();
      }
    } catch {
      if (org) {
        org.status = status;
        org.updatedAt = new Date().toISOString();
        AdminService.localOrganizations.set(orgId, org);
      }
    }

    org = AdminService.localOrganizations.get(orgId) || { id: orgId, status };

    // Record audit log
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: 'SUPER_ADMIN',
      action: status === 'SUSPENDED' ? 'ORGANIZATION_SUSPEND' : 'ORGANIZATION_ACTIVATE',
      resourceType: 'ORGANIZATION',
      resourceId: orgId,
      organizationId: orgId,
      beforeState,
      afterState: org,
      metadata: { reason }
    });

    return org;
  }

  // --- 3. User Management ---
  async listUsers(filters?: { search?: string; systemRole?: string; platformRole?: string }): Promise<any[]> {
    try {
      const client = await pool.connect();
      try {
        let query = `SELECT id, email, full_name, avatar_url, system_role, created_at, updated_at FROM users WHERE 1=1`;
        const params: unknown[] = [];
        if (filters?.systemRole) {
          params.push(filters.systemRole);
          query += ` AND system_role = $${params.length}`;
        }
        if (filters?.search) {
          params.push(`%${filters.search}%`);
          query += ` AND (email ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
        }
        query += ` ORDER BY created_at DESC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          email: r.email,
          fullName: r.full_name,
          avatarUrl: r.avatar_url,
          systemRole: r.system_role,
          platformRoles: r.system_role === 'SUPER_ADMIN' ? [PlatformRole.SUPER_ADMIN] : [],
          status: 'ACTIVE',
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(AdminService.localUsers.values());
      if (filters?.systemRole) list = list.filter((u) => u.systemRole === filters.systemRole);
      if (filters?.platformRole) list = list.filter((u) => u.platformRoles.includes(filters.platformRole));
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        list = list.filter((u) => u.email.toLowerCase().includes(s) || u.fullName.toLowerCase().includes(s));
      }
      return list;
    }
  }

  async updateUserRole(
    userId: string,
    updates: { systemRole?: SystemRole; platformRoles?: PlatformRole[] },
    adminUserId: string
  ): Promise<any> {
    const user = AdminService.localUsers.get(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const beforeState = { ...user };
    if (updates.systemRole) user.systemRole = updates.systemRole;
    if (updates.platformRoles) user.platformRoles = updates.platformRoles;
    user.updatedAt = new Date().toISOString();
    AdminService.localUsers.set(userId, user);

    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: 'SUPER_ADMIN',
      action: 'USER_ROLE_UPDATED',
      resourceType: 'USER',
      resourceId: userId,
      beforeState,
      afterState: user,
      metadata: { updates }
    });

    return user;
  }

  // --- 4. Election Moderation ---
  async listAllElections(filters?: { status?: ElectionStatus; category?: ElectionCategory; search?: string }): Promise<any[]> {
    const elections = await electionsService.listElections();
    let filtered = [...elections];

    if (filters?.status) filtered = filtered.filter((e) => e.status === filters.status);
    if (filters?.category) filtered = filtered.filter((e) => e.category === filters.category);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(s));
    }

    return filtered;
  }

  async moderateElection(
    electionId: string,
    updates: { status?: ElectionStatus; certifiedAt?: string; certifiedBy?: string; notes?: string },
    adminUserId: string
  ): Promise<any> {
    // Find election across organizations
    const elections = await electionsService.listElections();
    const target = elections.find((e) => e.id === electionId);
    if (!target) throw new AppError('Election not found', 404, 'ELECTION_NOT_FOUND');

    const beforeState = { ...target };
    if (updates.status) target.status = updates.status;
    if (updates.certifiedAt) target.certifiedAt = updates.certifiedAt;
    if (updates.certifiedBy) target.certifiedBy = updates.certifiedBy;
    target.updatedAt = new Date().toISOString();

    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: 'SUPER_ADMIN',
      action: 'ELECTION_MODERATED',
      resourceType: 'ELECTION',
      resourceId: electionId,
      organizationId: target.organizationId,
      beforeState: beforeState as unknown as Record<string, unknown>,
      afterState: target as unknown as Record<string, unknown>,
      metadata: { notes: updates.notes, newStatus: updates.status }
    });

    return target;
  }

  // --- 5. Commission Management ---
  async getCommissionSettings(): Promise<{
    currentPlatformRateBasisPoints: number;
    currentOrganiserRateBasisPoints: number;
    history: CommissionSettingRecord[];
  }> {
    const platformRate = revenueService.getGlobalPlatformCommissionRate();
    const organiserRate = 10000 - platformRate;
    return {
      currentPlatformRateBasisPoints: platformRate,
      currentOrganiserRateBasisPoints: organiserRate,
      history: AdminService.localCommissionHistory
    };
  }

  async updateCommissionRate(
    platformRateBasisPoints: number,
    reason: string,
    adminUserId: string
  ): Promise<CommissionSettingRecord> {
    if (platformRateBasisPoints < 0 || platformRateBasisPoints > 10000) {
      throw new AppError('Commission rate must be between 0 and 10,000 basis points (0% - 100%)', 400, 'INVALID_RATE');
    }

    const prevRate = revenueService.getGlobalPlatformCommissionRate();
    revenueService.setGlobalPlatformCommissionRate(platformRateBasisPoints);

    const organiserRate = 10000 - platformRateBasisPoints;
    const now = new Date().toISOString();
    const record: CommissionSettingRecord = {
      id: `com-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      platformRateBasisPoints,
      organiserRateBasisPoints: organiserRate,
      updatedBy: adminUserId,
      reason,
      createdAt: now
    };

    AdminService.localCommissionHistory.unshift(record);

    // Record in database if connected
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_commission_history (
            id, platform_rate_basis_points, organiser_rate_basis_points, updated_by, reason, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [record.id, platformRateBasisPoints, organiserRate, adminUserId, reason, now]
        );
      } finally {
        client.release();
      }
    } catch {
      // Keep local
    }

    // Audit Log
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: 'SUPER_ADMIN',
      action: 'COMMISSION_RATE_UPDATED',
      resourceType: 'PLATFORM_COMMISSION',
      resourceId: record.id,
      beforeState: { platformRateBasisPoints: prevRate, organiserRateBasisPoints: 10000 - prevRate },
      afterState: { platformRateBasisPoints, organiserRateBasisPoints: organiserRate },
      metadata: { reason }
    });

    return record;
  }
}

export const adminService = new AdminService();
