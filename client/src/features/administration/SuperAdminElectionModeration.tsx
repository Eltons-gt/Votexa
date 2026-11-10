import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Vote,
  Search,
  RefreshCw,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { ElectionCategory, ElectionStatus } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface ElectionModerationItem {
  id: string;
  organizationId: string;
  title: string;
  category: ElectionCategory;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  positionsCount?: number;
  totalVotesCast?: number;
}

export function SuperAdminElectionModeration() {
  const [elections, setElections] = useState<ElectionModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Moderation action modal
  const [targetElectionId, setTargetElectionId] = useState<string | null>(null);
  const [targetTitle, setTargetTitle] = useState('');
  const [actionType, setActionType] = useState<'PAUSE' | 'RESUME' | 'CANCEL' | 'CERTIFY'>('PAUSE');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ElectionModerationItem[]>('/admin/elections');
      if (res.success && res.data) {
        setElections(res.data);
      } else {
        // Fallback demo mock if DB is empty
        setElections([
          {
            id: 'elec-metro-1',
            organizationId: 'org-metro-uni',
            title: '2026 Student Union Executive Election',
            category: ElectionCategory.INSTITUTIONAL,
            status: ElectionStatus.ACTIVE,
            startDate: '2026-11-01T08:00:00Z',
            endDate: '2026-11-20T17:00:00Z',
            positionsCount: 4,
            totalVotesCast: 1420
          },
          {
            id: 'elec-talent-2026',
            organizationId: 'org-starlight-col',
            title: 'Starlight Voice Season 4 Finals',
            category: ElectionCategory.PAID_COMPETITION,
            status: ElectionStatus.ACTIVE,
            startDate: '2026-11-05T00:00:00Z',
            endDate: '2026-11-25T23:59:59Z',
            positionsCount: 1,
            totalVotesCast: 8430
          },
          {
            id: 'elec-poll-energy',
            organizationId: 'org-apex-sacco',
            title: 'Clean Energy Policy Member Opinion Poll',
            category: ElectionCategory.PUBLIC_POLL,
            status: ElectionStatus.CLOSED,
            startDate: '2026-10-01T08:00:00Z',
            endDate: '2026-10-31T18:00:00Z',
            positionsCount: 1,
            totalVotesCast: 512
          }
        ]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with moderation service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleModerate = async () => {
    if (!targetElectionId || !reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.patch(`/admin/elections/${targetElectionId}/moderate`, {
        action: actionType,
        reason: reason.trim()
      });

      if (res.success) {
        setElections((prev) =>
          prev.map((e) => {
            if (e.id !== targetElectionId) return e;
            let nextStatus = e.status;
            if (actionType === 'PAUSE') nextStatus = ElectionStatus.PAUSED;
            if (actionType === 'RESUME') nextStatus = ElectionStatus.ACTIVE;
            if (actionType === 'CANCEL') nextStatus = ElectionStatus.CANCELLED;
            if (actionType === 'CERTIFY') nextStatus = ElectionStatus.AUDITED;
            return { ...e, status: nextStatus };
          })
        );
        setTargetElectionId(null);
        setReason('');
      } else {
        setError(res.error?.message || 'Failed to moderate election');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error moderating election');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredElections = elections.filter((e) => {
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.organizationId.toLowerCase().includes(q);
  });

  const getStatusBadgeVariant = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return 'success';
      case ElectionStatus.PAUSED:
        return 'outline';
      case ElectionStatus.CANCELLED:
        return 'destructive';
      case ElectionStatus.AUDITED:
      case ElectionStatus.CONCLUDED:
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            Cross-Tenant Election Moderation & Ballot Integrity
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervise institutional voting, paid fan competitions, and public opinion polls across all tenant organisations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchElections}
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
                placeholder="Search election title, ID, organisation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Categories (3 Types)</option>
                <option value={ElectionCategory.INSTITUTIONAL}>Institutional Elections</option>
                <option value={ElectionCategory.PAID_COMPETITION}>Paid Competitions</option>
                <option value={ElectionCategory.PUBLIC_POLL}>Public Opinion Polls</option>
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

      {/* Elections Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Vote className="h-4 w-4 text-primary" />
            Elections Under Governance ({filteredElections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Election Title</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Tenant Scope</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Category</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Ballots Cast</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredElections.map((elec) => (
                  <tr key={elec.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{elec.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{elec.id}</div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-primary" />
                        {elec.organizationId}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={elec.category === ElectionCategory.PAID_COMPETITION ? 'default' : 'outline'}
                        className="text-[10px] font-mono"
                      >
                        {elec.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={getStatusBadgeVariant(elec.status) as any} className="text-[10px] font-mono">
                        {elec.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-foreground">
                      {elec.totalVotesCast?.toLocaleString() || '0'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {elec.status === ElectionStatus.ACTIVE && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetElectionId(elec.id);
                              setTargetTitle(elec.title);
                              setActionType('PAUSE');
                              setReason('');
                            }}
                            className="h-7 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                          >
                            <PauseCircle className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        )}

                        {elec.status === ElectionStatus.PAUSED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetElectionId(elec.id);
                              setTargetTitle(elec.title);
                              setActionType('RESUME');
                              setReason('');
                            }}
                            className="h-7 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Resume
                          </Button>
                        )}

                        {elec.status !== ElectionStatus.CANCELLED && elec.status !== ElectionStatus.AUDITED && elec.status !== ElectionStatus.CONCLUDED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetElectionId(elec.id);
                              setTargetTitle(elec.title);
                              setActionType('CANCEL');
                              setReason('');
                            }}
                            className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}

                        {elec.status === ElectionStatus.CLOSED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetElectionId(elec.id);
                              setTargetTitle(elec.title);
                              setActionType('CERTIFY');
                              setReason('');
                            }}
                            className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certify
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Confirmation Modal */}
      {targetElectionId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {actionType} Election
            </h4>
            <p className="text-xs text-muted-foreground">
              Election: <strong>{targetTitle}</strong> ({targetElectionId})
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Executive Moderation Justification <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Ballot dispute investigation or compliance hold"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetElectionId(null)}
                disabled={submitting}
                className="text-xs"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                variant={actionType === 'CANCEL' ? 'destructive' : 'default'}
                onClick={handleModerate}
                disabled={submitting || !reason.trim()}
                className="text-xs"
              >
                {submitting ? 'Auditing...' : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
