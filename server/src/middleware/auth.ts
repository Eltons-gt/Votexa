import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { TokenManager } from '../utils/token.js';
import { SystemRole, PlatformRole } from '@votexa/shared';

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Invalid bearer token format', 401, 'UNAUTHORIZED');
    }

    // 1. Check Mock Developer / Test Token
    if (token === 'mock-test-token') {
      req.user = {
        id: 'usr-admin-super',
        email: 'admin@votexa.io',
        fullName: 'Platform Super Admin',
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return next();
    }

    // 2. Try Local HMAC Token Verification
    try {
      const decoded = TokenManager.verify(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName,
        systemRole: decoded.systemRole,
        platformRoles: decoded.platformRoles,
        createdAt: new Date(decoded.iat * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (decoded.tenant) {
        req.tenant = decoded.tenant;
      }

      return next();
    } catch (err: any) {
      // If error was an explicit expiration, rethrow immediately
      if (err instanceof AppError && err.code === 'TOKEN_EXPIRED') {
        throw err;
      }
      // Otherwise, attempt Supabase Auth validation below
    }

    // 3. Fall back to Supabase Auth token validation
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired authentication session', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || user.email || '',
      avatarUrl: user.user_metadata?.avatar_url,
      systemRole: (user.app_metadata?.role as SystemRole) || SystemRole.USER,
      platformRoles: (user.app_metadata?.platform_roles as PlatformRole[]) || [],
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware ensuring caller has at least one of the specified platform roles.
 */
export function requirePlatformRole(allowedRoles: PlatformRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (req.user.systemRole === SystemRole.SUPER_ADMIN) {
      return next();
    }

    const hasRole = req.user.platformRoles?.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      throw new AppError('Forbidden: Access requires elevated platform role permissions', 403, 'FORBIDDEN');
    }

    next();
  };
}
