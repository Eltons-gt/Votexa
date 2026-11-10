import { Request, Response, NextFunction } from 'express';
import { OrganizationRole, SystemRole } from '@votexa/shared';
import { AppError } from '../utils/apiResponse.js';
import { pool } from '../database/db.js';
import { AuthService } from '../modules/auth/auth.service.js';

interface TenantMiddlewareOptions {
  required?: boolean;
  allowedRoles?: OrganizationRole[];
}

export function tenantContext(options: TenantMiddlewareOptions = { required: true }) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Extract tenant identifier from header, route params, or query
      const orgId =
        (req.headers['x-organization-id'] as string) ||
        (req.params.organizationId as string) ||
        (req.params.id as string) ||
        (req.query.organizationId as string);

      if (!orgId) {
        if (options.required) {
          throw new AppError(
            'Tenant context is required. Provide X-Organization-Id header.',
            400,
            'TENANT_CONTEXT_MISSING'
          );
        }
        return next();
      }

      // 2. If authenticated, verify membership and roles
      if (req.user) {
        // Platform Super Admin bypasses tenant isolation restrictions for maintenance
        if (req.user.systemRole === SystemRole.SUPER_ADMIN) {
          req.tenant = {
            organizationId: orgId,
            role: OrganizationRole.OWNER
          };
          return next();
        }

        let userRole: OrganizationRole | null = null;

        // Try DB verification first
        try {
          const client = await pool.connect();
          try {
            const memberRes = await client.query(
              'SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2',
              [orgId, req.user.id]
            );

            if (memberRes.rows.length > 0) {
              userRole = memberRes.rows[0].role as OrganizationRole;
            }
          } finally {
            client.release();
          }
        } catch {
          // In disconnected / test mode, check in-memory membership
          const memberships = AuthService.getLocalUserOrganizations(req.user.id);
          const match = memberships.find((m) => m.organization.id === orgId);
          if (match) {
            userRole = match.role;
          }
        }

        // Cross-tenant protection: Reject if caller has no membership in requested organization!
        if (!userRole) {
          throw new AppError(
            `Access Denied: You are not an authorized member of organization workspace '${orgId}'.`,
            403,
            'TENANT_ACCESS_DENIED'
          );
        }

        // Role-based authorization check
        if (options.allowedRoles && options.allowedRoles.length > 0) {
          if (!options.allowedRoles.includes(userRole)) {
            throw new AppError(
              `Forbidden: Your role (${userRole}) lacks the necessary permissions for this operation. Required: ${options.allowedRoles.join(', ')}`,
              403,
              'INSUFFICIENT_PERMISSIONS'
            );
          }
        }

        req.tenant = {
          organizationId: orgId,
          role: userRole
        };
      } else {
        // For unauthenticated endpoints (like public ballot view or voter status), attach unauthenticated tenant context
        req.tenant = {
          organizationId: orgId
        };
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
