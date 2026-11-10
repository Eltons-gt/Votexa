import crypto from 'crypto';
import { UserProfile, PlatformRole, OrganizationRole, SystemRole } from '@votexa/shared';
import { config } from '../config/index.js';
import { AppError } from './apiResponse.js';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  systemRole: SystemRole;
  platformRoles?: PlatformRole[];
  tenant?: {
    organizationId: string;
    role: OrganizationRole;
  };
  iat: number;
  exp: number;
}

export class TokenManager {
  private static readonly SECRET = config.jwt.secret;

  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Signs a JWT-compatible token with HMAC-SHA256 signature and configurable TTL (default 24h).
   */
  static sign(
    user: UserProfile,
    tenant?: { organizationId: string; role: OrganizationRole },
    expiresInSeconds = 86400
  ): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      systemRole: user.systemRole,
      platformRoles: user.platformRoles,
      tenant,
      iat: now,
      exp: now + expiresInSeconds
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${dataToSign}.${signature}`;
  }

  /**
   * Verifies token integrity and expiration.
   */
  static verify(token: string): TokenPayload {
    if (!token || typeof token !== 'string') {
      throw new AppError('Authentication token is missing or malformed', 401, 'INVALID_TOKEN');
    }

    const parts = token.split('.');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      throw new AppError('Invalid token structure', 401, 'INVALID_TOKEN');
    }

    const [headerB64, payloadB64, signature] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET)
      .update(dataToVerify)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      throw new AppError('Invalid token signature', 401, 'INVALID_TOKEN');
    }

    let payload: TokenPayload;
    try {
      payload = JSON.parse(this.base64UrlDecode(payloadB64));
    } catch {
      throw new AppError('Failed to parse token payload', 401, 'INVALID_TOKEN');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new AppError('Authentication session has expired', 401, 'TOKEN_EXPIRED');
    }

    return payload;
  }
}
