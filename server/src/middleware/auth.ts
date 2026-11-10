import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { AppError } from '../utils/apiResponse.js';
import { SystemRole } from '@votexa/shared';

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

    // In local development or test mode, allow a mock test token
    if (config.env === 'test' && token === 'mock-test-token') {
      req.user = {
        id: 'usr-test-123',
        email: 'test@votexa.io',
        fullName: 'Test User',
        systemRole: SystemRole.USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return next();
    }

    // Validate with Supabase Auth
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
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at
    };

    next();
  } catch (err) {
    next(err);
  }
}
