import crypto from 'crypto';
import {
  UserProfile,
  SystemRole,
  PlatformRole,
  OrganizationRole,
  AuthSessionResponse,
  RegisterRequest,
  LoginRequest,
  UserOrganizationMembership
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { TokenManager } from '../../utils/token.js';
import { pool } from '../../database/db.js';
import { config } from '../../config/index.js';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  systemRole: SystemRole;
  platformRoles: PlatformRole[];
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  private static localUsers = new Map<string, StoredUser>();
  private static resetTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor() {
    // Seed initial admin and demo users for local dev/testing
    if (AuthService.localUsers.size === 0) {
      const adminPass = AuthService.hashPassword('Admin123!@#');
      const testPass = AuthService.hashPassword('Password123!');

      AuthService.localUsers.set('admin@votexa.io', {
        id: 'usr-admin-super',
        email: 'admin@votexa.io',
        passwordHash: adminPass,
        fullName: 'Platform Super Admin',
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      AuthService.localUsers.set('user@university.edu', {
        id: 'usr-demo-owner',
        email: 'user@university.edu',
        passwordHash: testPass,
        fullName: 'Dean Alexander Vance',
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      AuthService.localUsers.set('staff@university.edu', {
        id: 'usr-demo-staff',
        email: 'staff@university.edu',
        passwordHash: testPass,
        fullName: 'Sarah Jenkins',
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  static hashPassword(password: string): string {
    const salt = config.jwt.secret;
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  /**
   * Register a new user account.
   */
  async register(req: RegisterRequest): Promise<AuthSessionResponse> {
    const { email, password, fullName } = req;

    if (!email || !email.includes('@')) {
      throw new AppError('Valid email address is required', 400, 'INVALID_EMAIL');
    }

    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }

    if (!fullName || fullName.trim().length === 0) {
      throw new AppError('Full name is required', 400, 'MISSING_NAME');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = AuthService.hashPassword(password);
    const now = new Date().toISOString();

    // 1. Database Path
    try {
      const client = await pool.connect();
      try {
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (existing.rows.length > 0) {
          throw new AppError('An account with this email address already exists', 409, 'EMAIL_ALREADY_EXISTS');
        }

        const res = await client.query(
          `INSERT INTO users (email, password_hash, full_name, system_role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, full_name, avatar_url, system_role, created_at, updated_at`,
          [normalizedEmail, passwordHash, fullName.trim(), SystemRole.USER, now, now]
        );

        const row = res.rows[0];
        const user: UserProfile = {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          avatarUrl: row.avatar_url,
          systemRole: row.system_role as SystemRole,
          platformRoles: [],
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };

        const token = TokenManager.sign(user);
        return {
          user,
          token,
          organizations: []
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // 2. In-Memory Fallback
      if (AuthService.localUsers.has(normalizedEmail)) {
        throw new AppError('An account with this email address already exists', 409, 'EMAIL_ALREADY_EXISTS');
      }

      const userId = `usr-${Date.now()}`;
      const newUser: StoredUser = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: now,
        updatedAt: now
      };

      AuthService.localUsers.set(normalizedEmail, newUser);

      const profile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        systemRole: newUser.systemRole,
        platformRoles: [],
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      const token = TokenManager.sign(profile);
      return {
        user: profile,
        token,
        organizations: []
      };
    }
  }

  /**
   * Authenticate with email & password.
   */
  async login(req: LoginRequest): Promise<AuthSessionResponse> {
    const { email, password } = req;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = AuthService.hashPassword(password);

    // 1. Try Database
    try {
      const client = await pool.connect();
      try {
        const userRes = await client.query(
          'SELECT id, email, password_hash, full_name, avatar_url, system_role, created_at, updated_at FROM users WHERE email = $1',
          [normalizedEmail]
        );

        if (userRes.rows.length === 0 || userRes.rows[0].password_hash !== passwordHash) {
          throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        const userRow = userRes.rows[0];

        // Fetch platform roles
        const rolesRes = await client.query('SELECT role FROM platform_roles WHERE user_id = $1', [userRow.id]);
        const platformRoles = rolesRes.rows.map((r) => r.role as PlatformRole);

        // Fetch organizations & memberships
        const orgRes = await client.query(
          `SELECT o.id, o.name, o.slug, o.logo_url, o.plan_id, o.settings, o.created_at, o.updated_at, om.role
           FROM organization_members om
           JOIN organizations o ON o.id = om.organization_id
           WHERE om.user_id = $1`,
          [userRow.id]
        );

        const organizations: UserOrganizationMembership[] = orgRes.rows.map((r) => ({
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

        const activeTenant = organizations.length > 0 ? organizations[0] : undefined;

        const userProfile: UserProfile = {
          id: userRow.id,
          email: userRow.email,
          fullName: userRow.full_name,
          avatarUrl: userRow.avatar_url,
          systemRole: userRow.system_role as SystemRole,
          platformRoles,
          createdAt: userRow.created_at,
          updatedAt: userRow.updated_at
        };

        const token = TokenManager.sign(
          userProfile,
          activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : undefined
        );

        return {
          user: userProfile,
          token,
          organizations,
          activeTenant
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // 2. In-Memory Fallback
      const user = AuthService.localUsers.get(normalizedEmail);
      if (!user || user.passwordHash !== passwordHash) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Check default organizations for local users
      const organizations = AuthService.getLocalUserOrganizations(user.id);
      const activeTenant = organizations.length > 0 ? organizations[0] : undefined;

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        systemRole: user.systemRole,
        platformRoles: user.platformRoles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      const token = TokenManager.sign(
        userProfile,
        activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : undefined
      );

      return {
        user: userProfile,
        token,
        organizations,
        activeTenant
      };
    }
  }

  /**
   * Retrieve active user profile by ID.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    for (const u of AuthService.localUsers.values()) {
      if (u.id === userId) {
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          systemRole: u.systemRole,
          platformRoles: u.platformRoles,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        };
      }
    }
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }

  /**
   * Update profile details.
   */
  async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string }): Promise<UserProfile> {
    for (const u of AuthService.localUsers.values()) {
      if (u.id === userId) {
        if (data.fullName) u.fullName = data.fullName.trim();
        if (data.avatarUrl !== undefined) u.avatarUrl = data.avatarUrl;
        u.updatedAt = new Date().toISOString();
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          systemRole: u.systemRole,
          platformRoles: u.platformRoles,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        };
      }
    }
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  /**
   * Initiate forgot password flow.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; resetToken: string }> {
    const normalized = email.trim().toLowerCase();
    const token = `rst_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = Date.now() + 3600000; // 1 hour

    AuthService.resetTokens.set(token, { userId: normalized, expiresAt });
    return { success: true, resetToken: token };
  }

  /**
   * Reset password with valid reset token.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const session = AuthService.resetTokens.get(token);
    if (!session || session.expiresAt < Date.now()) {
      throw new AppError('Password reset link is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }

    const user = AuthService.localUsers.get(session.userId);
    if (user) {
      user.passwordHash = AuthService.hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();
    }
    AuthService.resetTokens.delete(token);
  }

  // Helper for mock organizations in disconnected mode
  static getLocalUserOrganizations(userId: string): UserOrganizationMembership[] {
    const orgs: UserOrganizationMembership[] = [];

    // Metro University (Org A)
    const orgA = {
      id: 'org-metro-uni',
      name: 'Metropolitan University',
      slug: 'metropolitan-uni',
      planId: 'ENTERPRISE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    // Starlight College (Org B)
    const orgB = {
      id: 'org-starlight-col',
      name: 'Starlight Medical College',
      slug: 'starlight-college',
      planId: 'STANDARD',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z'
    };

    if (userId === 'usr-admin-super') {
      orgs.push({ organization: orgA, role: OrganizationRole.OWNER });
      orgs.push({ organization: orgB, role: OrganizationRole.OWNER });
    } else if (userId === 'usr-demo-owner') {
      orgs.push({ organization: orgA, role: OrganizationRole.OWNER });
      orgs.push({ organization: orgB, role: OrganizationRole.ADMIN });
    } else if (userId === 'usr-demo-staff') {
      orgs.push({ organization: orgA, role: OrganizationRole.STAFF });
    }

    return orgs;
  }
}

export const authService = new AuthService();

