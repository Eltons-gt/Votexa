import crypto from 'crypto';
import {
  PlatformAuditLogEntry,
  SecurityEventRecord,
  SecurityEventSeverity
} from '@votexa/shared';
import { pool } from '../../database/db.js';

export class AuditService {
  // In-memory stores for unit testing and offline environments
  private static localAuditLogs: PlatformAuditLogEntry[] = [];
  private static localSecurityEvents: SecurityEventRecord[] = [];

  public static resetState(): void {
    AuditService.localAuditLogs = [];
    AuditService.localSecurityEvents = [];
  }

  /**
   * Sensitive Key Sanitizer:
   * Strips passwords, auth tokens, payment secrets, private keys, and credentials from audit metadata.
   */
  public sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sensitiveKeyPatterns = [
      /pass(word)?/i,
      /token/i,
      /secret/i,
      /passkey/i,
      /auth(orization)?/i,
      /credential/i,
      /card/i,
      /cvv/i,
      /pin/i,
      /private_?key/i,
      /api_?key/i
    ];

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const isSensitive = sensitiveKeyPatterns.some((pattern) => pattern.test(key));
      if (isSensitive) {
        sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 1. Record an Immutable Platform Audit Log Entry
   */
  async recordAudit(params: {
    actorId?: string;
    actorEmail?: string;
    actorRole?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    organizationId?: string;
    requestReference?: string;
    ipAddress?: string;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<PlatformAuditLogEntry> {
    const id = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const sanitizedBefore = params.beforeState
      ? (this.sanitizeData(params.beforeState) as Record<string, unknown>)
      : undefined;
    const sanitizedAfter = params.afterState
      ? (this.sanitizeData(params.afterState) as Record<string, unknown>)
      : undefined;
    const sanitizedMeta = params.metadata
      ? (this.sanitizeData(params.metadata) as Record<string, unknown>)
      : {};

    const entry: PlatformAuditLogEntry = {
      id,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      organizationId: params.organizationId,
      requestReference: params.requestReference,
      ipAddress: params.ipAddress,
      beforeState: sanitizedBefore,
      afterState: sanitizedAfter,
      metadata: sanitizedMeta,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_audit_logs (
            id, actor_id, actor_email, actor_role, action, resource_type,
            resource_id, organization_id, request_reference, ip_address,
            before_state, after_state, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            entry.id,
            entry.actorId || null,
            entry.actorEmail || null,
            entry.actorRole || null,
            entry.action,
            entry.resourceType,
            entry.resourceId || null,
            entry.organizationId || null,
            entry.requestReference || null,
            entry.ipAddress || null,
            entry.beforeState ? JSON.stringify(entry.beforeState) : null,
            entry.afterState ? JSON.stringify(entry.afterState) : null,
            entry.metadata ? JSON.stringify(entry.metadata) : null,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      AuditService.localAuditLogs.unshift(entry);
    }

    return entry;
  }

  /**
   * 2. Record a Security Event
   */
  async recordSecurityEvent(params: {
    eventType: string;
    severity?: SecurityEventSeverity;
    actorId?: string;
    actorEmail?: string;
    ipAddress?: string;
    organizationId?: string;
    details?: Record<string, unknown>;
  }): Promise<SecurityEventRecord> {
    const id = `sec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const severity = params.severity || SecurityEventSeverity.MEDIUM;
    const sanitizedDetails = params.details
      ? (this.sanitizeData(params.details) as Record<string, unknown>)
      : {};

    const event: SecurityEventRecord = {
      id,
      eventType: params.eventType,
      severity,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      ipAddress: params.ipAddress,
      organizationId: params.organizationId,
      details: sanitizedDetails,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_security_events (
            id, event_type, severity, actor_id, actor_email, ip_address, organization_id, details, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.id,
            event.eventType,
            event.severity,
            event.actorId || null,
            event.actorEmail || null,
            event.ipAddress || null,
            event.organizationId || null,
            JSON.stringify(event.details),
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      AuditService.localSecurityEvents.unshift(event);
    }

    return event;
  }

  /**
   * 3. Query Platform Audit Logs with Filters
   */
  async listAuditLogs(filters?: {
    action?: string;
    resourceType?: string;
    organizationId?: string;
    actorId?: string;
    limit?: number;
  }): Promise<PlatformAuditLogEntry[]> {
    const limit = filters?.limit || 100;
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM platform_audit_logs WHERE 1=1';
        const params: unknown[] = [];

        if (filters?.action) {
          params.push(filters.action);
          query += ` AND action = $${params.length}`;
        }
        if (filters?.resourceType) {
          params.push(filters.resourceType);
          query += ` AND resource_type = $${params.length}`;
        }
        if (filters?.organizationId) {
          params.push(filters.organizationId);
          query += ` AND organization_id = $${params.length}`;
        }
        if (filters?.actorId) {
          params.push(filters.actorId);
          query += ` AND actor_id = $${params.length}`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbAuditLog(r));
      } finally {
        client.release();
      }
    } catch {
      let list = [...AuditService.localAuditLogs];
      if (filters?.action) list = list.filter((l) => l.action === filters.action);
      if (filters?.resourceType) list = list.filter((l) => l.resourceType === filters.resourceType);
      if (filters?.organizationId) list = list.filter((l) => l.organizationId === filters.organizationId);
      if (filters?.actorId) list = list.filter((l) => l.actorId === filters.actorId);
      return list.slice(0, limit);
    }
  }

  /**
   * 4. Query Platform Security Events with Filters
   */
  async listSecurityEvents(filters?: {
    eventType?: string;
    severity?: SecurityEventSeverity;
    limit?: number;
  }): Promise<SecurityEventRecord[]> {
    const limit = filters?.limit || 100;
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM platform_security_events WHERE 1=1';
        const params: unknown[] = [];

        if (filters?.eventType) {
          params.push(filters.eventType);
          query += ` AND event_type = $${params.length}`;
        }
        if (filters?.severity) {
          params.push(filters.severity);
          query += ` AND severity = $${params.length}`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          eventType: r.event_type,
          severity: r.severity as SecurityEventSeverity,
          actorId: r.actor_id || undefined,
          actorEmail: r.actor_email || undefined,
          ipAddress: r.ip_address || undefined,
          organizationId: r.organization_id || undefined,
          details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details || {},
          createdAt: (r.created_at as Date)?.toISOString ? (r.created_at as Date).toISOString() : (r.created_at as string)
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = [...AuditService.localSecurityEvents];
      if (filters?.eventType) list = list.filter((e) => e.eventType === filters.eventType);
      if (filters?.severity) list = list.filter((e) => e.severity === filters.severity);
      return list.slice(0, limit);
    }
  }

  private mapDbAuditLog(r: any): PlatformAuditLogEntry {
    return {
      id: r.id,
      actorId: r.actor_id || undefined,
      actorEmail: r.actor_email || undefined,
      actorRole: r.actor_role || undefined,
      action: r.action,
      resourceType: r.resource_type,
      resourceId: r.resource_id || undefined,
      organizationId: r.organization_id || undefined,
      requestReference: r.request_reference || undefined,
      ipAddress: r.ip_address || undefined,
      beforeState: typeof r.before_state === 'string' ? JSON.parse(r.before_state) : r.before_state || undefined,
      afterState: typeof r.after_state === 'string' ? JSON.parse(r.after_state) : r.after_state || undefined,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata || {},
      createdAt: (r.created_at as Date)?.toISOString ? (r.created_at as Date).toISOString() : (r.created_at as string)
    };
  }
}

export const auditService = new AuditService();

