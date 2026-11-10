import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Code
} from 'lucide-react';
import { PlatformAuditLogEntry } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function SuperAdminAuditLogViewer() {
  const [logs, setLogs] = useState<PlatformAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (resourceFilter) params.append('resourceType', resourceFilter);

      const res = await apiClient.get<PlatformAuditLogEntry[]>(
        `/admin/audit-logs${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (res.success && res.data) {
        setLogs(res.data);
      } else {
        setError(res.error?.message || 'Failed to fetch audit logs');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with audit service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, resourceFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resourceType.toLowerCase().includes(q) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(q)) ||
      (log.organizationId && log.organizationId.toLowerCase().includes(q))
    );
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('REVOKE')) {
      return 'destructive';
    }
    if (action.includes('APPROVE') || action.includes('ACTIVATE') || action.includes('DISBURSE')) {
      return 'success';
    }
    if (action.includes('UPDATE') || action.includes('MODERATE')) {
      return 'default';
    }
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Platform Immutable Audit Trail & Change Ledger
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically tracked administrative events, state transformations, and role mutations. Protected by database trigger immutability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            Sensitive Secrets Auto-Redacted
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            disabled={loading}
            className="text-xs gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search actor, action, resource, tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Platform Actions</option>
                <option value="COMMISSION_RATE_UPDATED">COMMISSION_RATE_UPDATED</option>
                <option value="ORGANIZATION_STATUS_UPDATED">ORGANIZATION_STATUS_UPDATED</option>
                <option value="PLATFORM_ROLE_MODIFIED">PLATFORM_ROLE_MODIFIED</option>
                <option value="ELECTION_MODERATED">ELECTION_MODERATED</option>
                <option value="PAYOUT_APPROVED">PAYOUT_APPROVED</option>
                <option value="PAYOUT_REJECTED">PAYOUT_REJECTED</option>
              </select>
            </div>

            <div>
              <Input
                placeholder="Filter by Resource Type (e.g. payout, election)"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Audit Records ({filteredLogs.length})
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Ordered descending by event timestamp</span>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {loading ? 'Retrieving audit trail...' : 'No audit entries match the current filter.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="border rounded-md p-3.5 bg-card hover:bg-muted/10 transition-colors text-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getActionBadgeVariant(log.action) as any} className="font-mono text-[11px]">
                          {log.action}
                        </Badge>
                        <span className="font-semibold text-foreground">{log.resourceType}</span>
                        {log.resourceId && (
                          <span className="font-mono text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {log.resourceId}
                          </span>
                        )}
                        {log.organizationId && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Tenant: {log.organizationId}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.actorEmail || 'System Actor'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="h-6 px-1.5 text-xs text-primary"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Metadata & Diff Drawer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-md">
                        {/* Before State */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Code className="h-3 w-3" /> Before State
                          </span>
                          <pre className="bg-background/80 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-40 border">
                            {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : 'null (None)'}
                          </pre>
                        </div>

                        {/* After State */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Code className="h-3 w-3" /> After State
                          </span>
                          <pre className="bg-background/80 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-40 border">
                            {log.afterState ? JSON.stringify(log.afterState, null, 2) : 'null (None)'}
                          </pre>
                        </div>

                        {/* Sanitized Metadata & Request Details */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3 text-emerald-500" /> Sanitized Metadata & Audit Info
                          </span>
                          <div className="bg-background/80 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-40 border space-y-1">
                            <div><strong>IP Address:</strong> {log.ipAddress || '127.0.0.1'}</div>
                            <div><strong>Request Ref:</strong> {log.requestReference || 'N/A'}</div>
                            <div><strong>User Agent:</strong> {log.userAgent || 'Internal System'}</div>
                            <div className="mt-1">
                              <strong>Metadata:</strong>
                              <pre className="mt-0.5 text-[10px]">
                                {log.metadata ? JSON.stringify(log.metadata, null, 2) : '{}'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
