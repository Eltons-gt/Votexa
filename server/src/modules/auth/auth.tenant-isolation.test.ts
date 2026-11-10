import { describe, it, expect } from 'vitest';
import { authService } from './auth.service.js';
import { organizationsService } from '../organizations/organizations.service.js';
import { organizationMembersService } from '../organization-members/organization-members.service.js';
import { TokenManager } from '../../utils/token.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationRole, SystemRole } from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { Request, Response } from 'express';

describe('Votexa Authentication & Multi-Tenant Isolation Security Suite', () => {
  const orgAId = 'org-metro-uni'; // Metro University
  const orgBId = 'org-starlight-col'; // Starlight Medical College

  // 1. User Registration & Login Tests
  describe('1. Registration and Login', () => {
    it('should register a new user successfully and issue a valid authentication token', async () => {
      const email = `newuser_${Date.now()}@domain.edu`;
      const session = await authService.register({
        email,
        password: 'ValidPassword123!',
        fullName: 'Jane Doe'
      });

      expect(session).toBeDefined();
      expect(session.user.email).toBe(email);
      expect(session.user.fullName).toBe('Jane Doe');
      expect(session.token).toBeDefined();

      const decoded = TokenManager.verify(session.token);
      expect(decoded.userId).toBe(session.user.id);
      expect(decoded.email).toBe(email);
    });

    it('should reject duplicate email registration with 409 EMAIL_ALREADY_EXISTS', async () => {
      const email = `duplicate_${Date.now()}@domain.edu`;
      await authService.register({
        email,
        password: 'ValidPassword123!',
        fullName: 'Original User'
      });

      await expect(
        authService.register({
          email,
          password: 'AnotherPassword123!',
          fullName: 'Duplicate User'
        })
      ).rejects.toThrowError('An account with this email address already exists');
    });

    it('should authenticate valid credentials and reject invalid passwords', async () => {
      const validLogin = await authService.login({
        email: 'user@university.edu',
        password: 'Password123!'
      });
      expect(validLogin.token).toBeDefined();
      expect(validLogin.user.email).toBe('user@university.edu');

      await expect(
        authService.login({
          email: 'user@university.edu',
          password: 'WrongPassword999!'
        })
      ).rejects.toThrowError('Invalid email or password');
    });
  });

  // 2. Token Validation & Expiration Tests
  describe('2. Authentication Token Validation and Expiration', () => {
    it('should reject malformed or tampered tokens with 401 INVALID_TOKEN', () => {
      expect(() => TokenManager.verify('malformed.token.string')).toThrowError(AppError);
      expect(() => TokenManager.verify('eyJhbGciOiJIUzI1NiJ9.invalidpayload.tamperedsig')).toThrowError();
    });

    it('should reject expired tokens with 401 TOKEN_EXPIRED', () => {
      const expiredUser = {
        id: 'usr-expired',
        email: 'expired@test.com',
        fullName: 'Expired User',
        systemRole: SystemRole.USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Generate a token with negative TTL (-10 seconds)
      const expiredToken = TokenManager.sign(expiredUser, undefined, -10);

      try {
        TokenManager.verify(expiredToken);
        expect.unreachable('Expired token should have thrown TOKEN_EXPIRED');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.code).toBe('TOKEN_EXPIRED');
        expect(err.statusCode).toBe(401);
      }
    });
  });

  // 3. Multiple Organization Memberships & Switching Tests
  describe('3. Multiple Organisation Memberships & Workspace Switching', () => {
    it('should allow a user to belong to multiple organisations with distinct roles', async () => {
      // usr-demo-owner belongs to both Metro Uni (OWNER) and Starlight College (ADMIN)
      const memberships = await organizationsService.getUserOrganizations('usr-demo-owner');
      expect(memberships.length).toBeGreaterThanOrEqual(2);

      const orgA = memberships.find((m) => m.organization.id === orgAId);
      const orgB = memberships.find((m) => m.organization.id === orgBId);

      expect(orgA).toBeDefined();
      expect(orgA!.role).toBe(OrganizationRole.OWNER);

      expect(orgB).toBeDefined();
      expect(orgB!.role).toBe(OrganizationRole.ADMIN);
    });

    it('should allow a user to switch between authorized workspaces', async () => {
      const switchResult = await organizationsService.switchOrganization('usr-demo-owner', orgBId);
      expect(switchResult).toBeDefined();
      expect(switchResult.activeTenant.organization.id).toBe(orgBId);
      expect(switchResult.activeTenant.role).toBe(OrganizationRole.ADMIN);

      const decoded = TokenManager.verify(switchResult.token);
      expect(decoded.tenant?.organizationId).toBe(orgBId);
      expect(decoded.tenant?.role).toBe(OrganizationRole.ADMIN);
    });

    it('should reject switching to an unauthorized organization', async () => {
      // Sarah Jenkins (usr-demo-staff) is only a member of Metro Uni, NOT Starlight College
      await expect(
        organizationsService.switchOrganization('usr-demo-staff', orgBId)
      ).rejects.toThrowError(AppError);

      try {
        await organizationsService.switchOrganization('usr-demo-staff', orgBId);
      } catch (err: any) {
        expect(err.code).toBe('TENANT_ACCESS_DENIED');
        expect(err.statusCode).toBe(403);
      }
    });
  });

  // 4. Role Permission Checks
  describe('4. Role-Based Permission Checks', () => {
    it('should allow OWNER to invite and update member roles', async () => {
      const invitation = await organizationMembersService.inviteMember(
        'usr-demo-owner',
        orgAId,
        'newstaff@metro.edu',
        OrganizationRole.STAFF
      );
      expect(invitation).toBeDefined();
      expect(invitation.email).toBe('newstaff@metro.edu');
      expect(invitation.status).toBe('PENDING');
    });

    it('should allow tenantContext middleware to enforce required roles (e.g. OWNER and ADMIN)', async () => {
      // usr-demo-staff is a STAFF member of orgA
      const mockReq = {
        headers: { 'x-organization-id': orgAId },
        user: {
          id: 'usr-demo-staff',
          email: 'staff@university.edu',
          fullName: 'Sarah Jenkins',
          systemRole: SystemRole.USER,
          createdAt: '',
          updatedAt: ''
        },
        query: {},
        params: {}
      } as unknown as Request;

      const mockRes = {} as Response;
      const adminOnlyMiddleware = tenantContext({
        allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN]
      });

      let nextError: any = null;
      await adminOnlyMiddleware(mockReq, mockRes, (err?: any) => {
        nextError = err;
      });

      expect(nextError).toBeInstanceOf(AppError);
      expect(nextError.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(nextError.statusCode).toBe(403);
    });
  });

  // 5. Cross-Tenant Read & Write Isolation (Acceptance Criteria)
  describe('5. Cross-Tenant Security & Isolation Enforcement', () => {
    it('CRITICAL: A member of Organisation A must NOT read Organisation B data by changing IDs', async () => {
      // Sarah Jenkins is a member of Org A ONLY.
      // Malicious attempt: Sarah requests Org B by setting X-Organization-Id to org-starlight-col
      const maliciousReq = {
        headers: { 'x-organization-id': orgBId }, // Injected Org B ID
        user: {
          id: 'usr-demo-staff', // Member of Org A only
          email: 'staff@university.edu',
          fullName: 'Sarah Jenkins',
          systemRole: SystemRole.USER,
          createdAt: '',
          updatedAt: ''
        },
        query: {},
        params: {}
      } as unknown as Request;

      const mockRes = {} as Response;
      const middleware = tenantContext();

      let interceptedError: any = null;
      await middleware(maliciousReq, mockRes, (err?: any) => {
        interceptedError = err;
      });

      expect(interceptedError).toBeInstanceOf(AppError);
      expect(interceptedError.code).toBe('TENANT_ACCESS_DENIED');
      expect(interceptedError.statusCode).toBe(403);
      expect(interceptedError.message).toContain('Access Denied');
    });

    it('CRITICAL: A member of Organisation A must NOT mutate Organisation B data', async () => {
      // Sarah Jenkins attempts to write settings to Org B
      const maliciousWriteReq = {
        headers: { 'x-organization-id': orgBId },
        params: { id: orgBId },
        user: {
          id: 'usr-demo-staff',
          email: 'staff@university.edu',
          fullName: 'Sarah Jenkins',
          systemRole: SystemRole.USER,
          createdAt: '',
          updatedAt: ''
        },
        query: {},
        body: { name: 'Hacked Organization Name' }
      } as unknown as Request;

      const mockRes = {} as Response;
      const writeProtectionMiddleware = tenantContext({
        allowedRoles: [OrganizationRole.OWNER]
      });

      let interceptedError: any = null;
      await writeProtectionMiddleware(maliciousWriteReq, mockRes, (err?: any) => {
        interceptedError = err;
      });

      expect(interceptedError).toBeInstanceOf(AppError);
      expect(interceptedError.code).toBe('TENANT_ACCESS_DENIED');
      expect(interceptedError.statusCode).toBe(403);
    });

    it('should reject requests without tenant context when tenant context is required', async () => {
      const noTenantReq = {
        headers: {},
        user: {
          id: 'usr-demo-owner',
          email: 'user@university.edu',
          fullName: 'Dean Alexander Vance',
          systemRole: SystemRole.USER,
          createdAt: '',
          updatedAt: ''
        },
        query: {},
        params: {}
      } as unknown as Request;

      const mockRes = {} as Response;
      const middleware = tenantContext({ required: true });

      let error: any = null;
      await middleware(noTenantReq, mockRes, (err?: any) => {
        error = err;
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('TENANT_CONTEXT_MISSING');
      expect(error.statusCode).toBe(400);
    });
  });
});
