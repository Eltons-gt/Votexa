import {
  Organization,
  OrganizationRole,
  UserOrganizationMembership,
  OrganizationSettings
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { TokenManager } from '../../utils/token.js';
import { pool } from '../../database/db.js';
import { authService } from '../auth/auth.service.js';

export class OrganizationsService {
  private static localOrgs = new Map<string, Organization>([
    [
      'org-metro-uni',
      {
        id: 'org-metro-uni',
        name: 'Metropolitan University',
        slug: 'metropolitan-uni',
        planId: 'ENTERPRISE',
        settings: {
          timezone: 'America/New_York',
          allowPublicBallots: true,
          contactEmail: 'elections@metro.edu'
        },
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
        settings: {
          timezone: 'America/Chicago',
          allowPublicBallots: false,
          contactEmail: 'admin@starlight.edu'
        },
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z'
      }
    ]
  ]);

  private static localMembers = new Map<string, { organizationId: string; userId: string; role: OrganizationRole }[]>([
    [
      'org-metro-uni',
      [
        { organizationId: 'org-metro-uni', userId: 'usr-admin-super', role: OrganizationRole.OWNER },
        { organizationId: 'org-metro-uni', userId: 'usr-demo-owner', role: OrganizationRole.OWNER },
        { organizationId: 'org-metro-uni', userId: 'usr-demo-staff', role: OrganizationRole.STAFF }
      ]
    ],
    [
      'org-starlight-col',
      [
        { organizationId: 'org-starlight-col', userId: 'usr-admin-super', role: OrganizationRole.OWNER },
        { organizationId: 'org-starlight-col', userId: 'usr-demo-owner', role: OrganizationRole.ADMIN }
      ]
    ]
  ]);

  /**
   * Create new organization and assign creator as OWNER.
   */
  async createOrganization(userId: string, name: string, slug: string): Promise<UserOrganizationMembership> {
    if (!name || name.trim().length === 0) {
      throw new AppError('Organization name is required', 400, 'INVALID_NAME');
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      throw new AppError('Slug may only contain alphanumeric characters and hyphens', 400, 'INVALID_SLUG');
    }

    const now = new Date().toISOString();

    // 1. Try Database
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if slug taken, and append random suffix if collision
        let finalSlug = cleanSlug;
        const existing = await client.query('SELECT id FROM organizations WHERE slug = $1', [finalSlug]);
        if (existing.rows.length > 0) {
          finalSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        // Create organization
        const orgRes = await client.query(
          `INSERT INTO organizations (name, slug, created_by, plan_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [name.trim(), finalSlug, userId, 'STANDARD', now, now]
        );
        const orgRow = orgRes.rows[0];

        // Add creator as OWNER
        await client.query(
          `INSERT INTO organization_members (organization_id, user_id, role, joined_at)
           VALUES ($1, $2, $3, $4)`,
          [orgRow.id, userId, OrganizationRole.OWNER, now]
        );

        // Initialize tenant wallet
        await client.query(
          `INSERT INTO wallets (organization_id, currency, available_balance, pending_balance)
           VALUES ($1, 'USD', 0, 0)`,
          [orgRow.id]
        );

        await client.query('COMMIT');

        const org: Organization = {
          id: orgRow.id,
          name: orgRow.name,
          slug: orgRow.slug,
          planId: orgRow.plan_id,
          settings: orgRow.settings || {},
          createdAt: orgRow.created_at,
          updatedAt: orgRow.updated_at
        };

        return {
          organization: org,
          role: OrganizationRole.OWNER
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // 2. In-Memory Fallback
      let fallbackSlug = cleanSlug;
      for (const org of OrganizationsService.localOrgs.values()) {
        if (org.slug === fallbackSlug) {
          fallbackSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }

      const orgId = `org-${Date.now()}`;
      const newOrg: Organization = {
        id: orgId,
        name: name.trim(),
        slug: fallbackSlug,
        planId: 'STANDARD',
        settings: { timezone: 'UTC' },
        createdAt: now,
        updatedAt: now
      };

      OrganizationsService.localOrgs.set(orgId, newOrg);
      OrganizationsService.localMembers.set(orgId, [
        { organizationId: orgId, userId, role: OrganizationRole.OWNER }
      ]);

      return {
        organization: newOrg,
        role: OrganizationRole.OWNER
      };
    }
  }

  /**
   * List all organizations where user has an active membership.
   */
  async getUserOrganizations(userId: string): Promise<UserOrganizationMembership[]> {
    // 1. Try Database
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT o.id, o.name, o.slug, o.logo_url, o.plan_id, o.settings, o.created_at, o.updated_at, om.role
           FROM organization_members om
           JOIN organizations o ON o.id = om.organization_id
           WHERE om.user_id = $1`,
          [userId]
        );

        return res.rows.map((r) => ({
          organization: {
            id: r.id,
            name: r.name,
            slug: r.slug,
            logoUrl: r.logo_url,
            planId: r.plan_id,
            settings: r.settings,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          },
          role: r.role as OrganizationRole
        }));
      } finally {
        client.release();
      }
    } catch {
      // In-Memory Fallback
      const memberships: UserOrganizationMembership[] = [];
      for (const [orgId, members] of OrganizationsService.localMembers.entries()) {
        const m = members.find((item) => item.userId === userId);
        if (m) {
          const org = OrganizationsService.localOrgs.get(orgId);
          if (org) {
            memberships.push({ organization: org, role: m.role });
          }
        }
      }
      return memberships;
    }
  }

  /**
   * Switch active workspace. Verifies authorization before returning new scoped token.
   */
  async switchOrganization(userId: string, targetOrgId: string): Promise<{
    activeTenant: UserOrganizationMembership;
    token: string;
  }> {
    const userOrgs = await this.getUserOrganizations(userId);
    const membership = userOrgs.find((m) => m.organization.id === targetOrgId);

    if (!membership) {
      throw new AppError(
        `Cannot switch workspace: You do not have an active membership in organization '${targetOrgId}'`,
        403,
        'TENANT_ACCESS_DENIED'
      );
    }

    const userProfile = await authService.getProfile(userId);
    const token = TokenManager.sign(userProfile, {
      organizationId: membership.organization.id,
      role: membership.role
    });

    return {
      activeTenant: membership,
      token
    };
  }

  /**
   * Get organization profile & settings.
   */
  async getOrganization(orgId: string): Promise<Organization> {
    const org = OrganizationsService.localOrgs.get(orgId);
    if (!org) {
      throw new AppError(`Organization '${orgId}' not found`, 404, 'ORGANIZATION_NOT_FOUND');
    }
    return org;
  }

  /**
   * Update organization settings (Restricted to OWNER and ADMIN).
   */
  async updateSettings(orgId: string, settings: Partial<OrganizationSettings>, name?: string): Promise<Organization> {
    const org = OrganizationsService.localOrgs.get(orgId);
    if (!org) {
      throw new AppError(`Organization '${orgId}' not found`, 404, 'ORGANIZATION_NOT_FOUND');
    }

    if (name) org.name = name.trim();
    org.settings = { ...org.settings, ...settings };
    org.updatedAt = new Date().toISOString();

    return org;
  }
}

export const organizationsService = new OrganizationsService();

