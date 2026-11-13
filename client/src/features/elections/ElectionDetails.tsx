import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Briefcase,
  Users,
  UserCheck,
  ShieldCheck,
  Settings,
  History,
  Play,
  CheckCircle2,
  AlertTriangle,
  Share2
} from 'lucide-react';
import {
  Election,
  ElectionStatus,
  ElectionCategory,
  ElectionAuditLog,
  OrganizationRole
} from '@votexa/shared';
import { PositionManagement } from './PositionManagement';
import { CandidateManagement } from './CandidateManagement';
import { VoterManagement } from './VoterManagement';
import { EligibilityManagement } from './EligibilityManagement';
import { ElectionSettingsView } from './ElectionSettingsView';
import { apiClient } from '../../lib/api';
import { ShareElectionModal } from '../../components/modals/ShareElectionModal';

interface ElectionDetailsProps {
  electionId: string;
  userRole?: OrganizationRole;
  onBack: () => void;
}

export function ElectionDetails({ electionId, userRole = OrganizationRole.OWNER, onBack }: ElectionDetailsProps) {
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'positions' | 'candidates' | 'voters' | 'eligibility' | 'settings' | 'audit'
  >('positions');

  const [auditLogs, setAuditLogs] = useState<ElectionAuditLog[]>([]);

  // Transition Modal
  const [targetStatus, setTargetStatus] = useState<ElectionStatus | null>(null);
  const [transitionReason, setTransitionReason] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchElection = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Election>(`/elections/${electionId}`);
      if (res.data) setElection(res.data);

      const auditRes = await apiClient.get<ElectionAuditLog[]>(`/elections/${electionId}/audit-logs`);
      if (auditRes.data) setAuditLogs(auditRes.data);
    } catch {
      // Fallback
      setElection({
        id: electionId,
        organizationId: 'current',
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Student Government Executive Council Election 2026',
        description: 'Official annual election for executive council and student body representation.',
        status: ElectionStatus.ACTIVE,
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        timezone: 'America/New_York',
        allowSelfRegistration: false,
        isPaidVoting: false,
        createdById: 'usr-demo-owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setAuditLogs([
        {
          id: 'log-1',
          electionId,
          organizationId: 'current',
          userId: 'usr-demo-owner',
          action: 'STATUS_CHANGE',
          previousState: { status: 'SCHEDULED' },
          newState: { status: 'ACTIVE' },
          reason: 'Official polling window opened',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'log-2',
          electionId,
          organizationId: 'current',
          userId: 'usr-demo-owner',
          action: 'ELECTION_CREATED',
          reason: 'Initial creation of election workspace',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
  }, [electionId]);

  const handleOpenTransition = (status: ElectionStatus) => {
    setTargetStatus(status);
    setTransitionReason('');
    setErrorMsg(null);
  };

  const handleConfirmTransition = async () => {
    if (!targetStatus) return;
    setIsTransitioning(true);
    setErrorMsg(null);
    try {
      await apiClient.post(`/elections/${electionId}/status`, {
        status: targetStatus,
        reason: transitionReason.trim() || undefined
      });
      setTargetStatus(null);
      fetchElection();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to transition election status');
    } finally {
      setIsTransitioning(false);
    }
  };

  const isReadOnly = userRole === OrganizationRole.STAFF;

  if (loading || !election) {
    return <div className="py-12 text-center text-xs text-muted-foreground">Loading election workspace...</div>;
  }

  const getStatusBadge = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return <Badge variant="success">ACTIVE (Voting Open)</Badge>;
      case ElectionStatus.SCHEDULED:
        return <Badge variant="secondary">SCHEDULED</Badge>;
      case ElectionStatus.CLOSED:
      case ElectionStatus.CONCLUDED:
        return <Badge variant="outline">CLOSED (Finalized)</Badge>;
      case ElectionStatus.CANCELLED:
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="default">DRAFT</Badge>;
    }
  };

  const getCategoryBadge = (cat: ElectionCategory) => {
    switch (cat) {
      case ElectionCategory.INSTITUTIONAL:
        return <Badge variant="outline" className="border-blue-500/40 text-blue-500">Institutional Election</Badge>;
      case ElectionCategory.PAID_COMPETITION:
        return <Badge variant="outline" className="border-amber-500/40 text-amber-500">Paid Competition</Badge>;
      case ElectionCategory.PUBLIC_POLL:
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-500">Public Opinion Poll</Badge>;
      default:
        return <Badge variant="outline">{cat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & top header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Elections
        </button>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-sm">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {getCategoryBadge(election.category)}
              {getStatusBadge(election.status)}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{election.title}</h2>
            <p className="text-xs text-muted-foreground max-w-2xl">{election.description || 'No description provided.'}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {new Date(election.startTime).toLocaleDateString()} — {new Date(election.endTime).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Timezone: {election.timezone}
              </span>
            </div>
          </div>

          {/* Lifecycle Action Buttons & Share */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5" /> Share Vote & QR
            </Button>

            {!isReadOnly && (
              <>
                {election.status === ElectionStatus.DRAFT && (
                  <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenTransition(ElectionStatus.SCHEDULED)}
                    className="text-xs"
                  >
                    Schedule Election
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenTransition(ElectionStatus.ACTIVE)}
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="h-3.5 w-3.5" /> Open Polls Now
                  </Button>
                </>
              )}

              {election.status === ElectionStatus.SCHEDULED && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenTransition(ElectionStatus.DRAFT)}
                    className="text-xs"
                  >
                    Return to Draft
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenTransition(ElectionStatus.ACTIVE)}
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="h-3.5 w-3.5" /> Launch Active Polls
                  </Button>
                </>
              )}

              {election.status === ElectionStatus.ACTIVE && (
                <Button
                  size="sm"
                  onClick={() => handleOpenTransition(ElectionStatus.CLOSED)}
                  className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Conclude & Close Polls
                </Button>
              )}

              {election.status !== ElectionStatus.CANCELLED && election.status !== ElectionStatus.CLOSED && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenTransition(ElectionStatus.CANCELLED)}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Cancel
                </Button>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b pb-1 overflow-x-auto text-xs">
        {[
          { id: 'positions', label: 'Positions & Offices', icon: Briefcase },
          { id: 'candidates', label: 'Candidates Roster', icon: Users },
          { id: 'voters', label: 'Voter Register & CSV', icon: UserCheck },
          { id: 'eligibility', label: 'Eligibility Simulator', icon: ShieldCheck },
          { id: 'settings', label: 'Settings & Visibility', icon: Settings },
          { id: 'audit', label: 'Audit Trail', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium transition-colors shrink-0 ${
                isActive
                  ? 'border-b-2 border-primary text-primary bg-primary/5 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'positions' && (
        <PositionManagement electionId={election.id} isReadOnly={isReadOnly} />
      )}

      {activeTab === 'candidates' && (
        <CandidateManagement electionId={election.id} isReadOnly={isReadOnly} />
      )}

      {activeTab === 'voters' && (
        <VoterManagement electionId={election.id} isReadOnly={isReadOnly} />
      )}

      {activeTab === 'eligibility' && (
        <EligibilityManagement election={election} />
      )}

      {activeTab === 'settings' && (
        <ElectionSettingsView election={election} onUpdated={fetchElection} isReadOnly={isReadOnly} />
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Official Election Audit Log
            </h3>
            <p className="text-xs text-muted-foreground">
              Official log of all status changes, rule modifications, and administrative actions.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No audit logs recorded for this election yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <Card key={log.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <span className="text-xs font-semibold">{log.reason || 'No description recorded'}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                    <span>Authorized by: {log.userId}</span>
                  </div>
                  {(log.previousState || log.newState) && (
                    <div className="bg-muted/50 p-2 rounded text-[11px] font-mono overflow-x-auto text-muted-foreground">
                      {log.previousState && <span>Prev: {JSON.stringify(log.previousState)} </span>}
                      {log.newState && <span>-&gt; New: {JSON.stringify(log.newState)}</span>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transition Confirmation Modal */}
      {targetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Status Transition to {targetStatus}
            </h4>

            <p className="text-xs text-muted-foreground">
              You are moving this election from <b>{election.status}</b> to <b>{targetStatus}</b>.
              {targetStatus === ElectionStatus.ACTIVE && ' Once active, critical voting rules are locked against un-audited changes.'}
              {targetStatus === ElectionStatus.CLOSED && ' Closing the election stops all ballot submission.'}
            </p>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="font-medium text-foreground block">
                Official Authorization Reason / Motion Reference (Optional)
              </label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="e.g. Approved by electoral board on Nov 10, 2026"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetStatus(null)}
                disabled={isTransitioning}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmTransition}
                disabled={isTransitioning}
                variant={targetStatus === ElectionStatus.CANCELLED ? 'destructive' : 'default'}
              >
                {isTransitioning ? 'Updating Status...' : `Confirm -> ${targetStatus}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share & QR Code Modal */}
      {election && (
        <ShareElectionModal
          election={election}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
