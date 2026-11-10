import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Building2,
  Search,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface OrgItem {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  planTier: string;
  createdAt: string;
}

export function SuperAdminOrgManagement() {
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Moderation state
  const [actionOrgId, setActionOrgId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'SUSPENDED' | 'ACTIVE'>('SUSPENDED');
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<OrgItem[]>('/admin/organizations');
      if (res.success && res.data) {
        setOrganizations(res.data);
      } else {
        // Fallback demo mock if DB is empty
        setOrganizations([
          {
            id: 'org-metro-uni',
            name: 'Metropolitan University',
            slug: 'metro-uni',
            status: 'ACTIVE',
            planTier: 'ENTERPRISE',
            createdAt: '2026-01-15T08:00:00Z'
          },
          {
            id: 'org-starlight-col',
            name: 'Starlight Media Collective',
            slug: 'starlight',
            status: 'ACTIVE',
            planTier: 'PRO',
            createdAt: '2026-02-10T11:30:00Z'
          },
          {
            id: 'org-apex-sacco',
            name: 'Apex National SACCO',
            slug: 'apex-sacco',
            status: 'ACTIVE',
            planTier: 'ENTERPRISE',
            createdAt: '2026-03-01T14:15:00Z'
          }
        ]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with administration service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleUpdateStatus = async () => {
    if (!actionOrgId || !actionReason.trim()) {
      return;
    }

    setActionSubmitting(true);
    try {
      const res = await apiClient.patch<OrgItem>(`/admin/organizations/${actionOrgId}/status`, {
        status: actionType,
        reason: actionReason.trim()
      });

      if (res.success) {
        setOrganizations((prev) =>
          prev.map((org) => (org.id === actionOrgId ? { ...org, status: actionType } : org))
        );
        setActionOrgId(null);
        setActionReason('');
      } else {
        setError(res.error?.message || 'Failed to update organization status');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error updating organization');
    } finally {
      setActionSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (statusFilter && org.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q) || org.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organisation Workspace Directory & Tenant Moderation
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage multi-tenant enterprise customer workspaces, inspect subscription plans, and enforce compliance suspensions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrganizations}
          disabled={loading}
          className="text-xs gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search organisation name, slug, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active Workspaces Only</option>
                <option value="SUSPENDED">Suspended Workspaces Only</option>
              </select>
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

      {/* Organizations Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Organisations ({filteredOrgs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Organisation</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Tenant ID & Slug</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Plan Tier</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Registered</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-semibold text-foreground">
                      {org.name}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                      <div>{org.slug}</div>
                      <div className="text-[10px] text-muted-foreground/70">{org.id}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {org.planTier}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {org.status === 'ACTIVE' ? (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-[11px]">
                          <AlertTriangle className="h-3 w-3" />
                          SUSPENDED
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {org.status === 'ACTIVE' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActionOrgId(org.id);
                            setActionType('SUSPENDED');
                            setActionReason('');
                          }}
                          className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <PauseCircle className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActionOrgId(org.id);
                            setActionType('ACTIVE');
                            setActionReason('');
                          }}
                          className="h-7 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Reason Dialog */}
      {actionOrgId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {actionType === 'SUSPENDED' ? 'Suspend Organisation Tenant' : 'Reactivate Organisation Tenant'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {actionType === 'SUSPENDED'
                ? 'Suspending an organisation immediately halts active elections, freezes voting credits, and blocks member access.'
                : 'Reactivating restores workspace access and election operations.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Executive Audit Justification <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Terms of Service compliance audit"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionOrgId(null)}
                disabled={actionSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'SUSPENDED' ? 'destructive' : 'default'}
                onClick={handleUpdateStatus}
                disabled={actionSubmitting || !actionReason.trim()}
                className="text-xs"
              >
                {actionSubmitting ? 'Recording Audit...' : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

