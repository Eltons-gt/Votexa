import { useState, useEffect } from 'react';
import {
  Vote,
  Users,
  UserCheck,
  Wallet,
  ArrowRight,
  Plus,
  CheckCircle2,
  Building2,
  Activity,
  Layers,
  ChevronRight,
  Calendar,
  Sparkles,
  Share2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Organization,
  OrganizationRole,
  UserProfile,
  Election,
  ElectionCategory,
  ElectionStatus
} from '@votexa/shared';
import { apiClient } from '../../lib/api';
import { ShareElectionModal } from '../../components/modals/ShareElectionModal';

interface WorkspaceDashboardOverviewProps {
  organization: Organization;
  userRole: OrganizationRole;
  currentUser: UserProfile;
  walletBalanceCents: number;
  onNavigateTab: (tab: string) => void;
  onOpenCreateElection: () => void;
}

export function WorkspaceDashboardOverview({
  organization,
  userRole,
  currentUser,
  walletBalanceCents,
  onNavigateTab,
  onOpenCreateElection
}: WorkspaceDashboardOverviewProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolledVotersCount, setEnrolledVotersCount] = useState<number>(0);
  const [ballotsCastCount, setBallotsCastCount] = useState<number>(0);
  const [sharingElection, setSharingElection] = useState<Election | null>(null);

  const formatKes = (cents: number = 0) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (organization?.id) {
          apiClient.setTenant(organization.id);
        }
        const res = await apiClient.get<Election[]>('/elections');
        if (isMounted) {
          if (res.data) {
            setElections(res.data);
            // Calculate total ballots if available
            const totalCast = res.data.reduce((sum, e: any) => sum + (e.ballotsCastCount || e.votesCount || 0), 0);
            setBallotsCastCount(totalCast);

            const firstElection = res.data[0];
            if (firstElection?.id) {
              apiClient.get<any[]>(`/voters?electionId=${firstElection.id}`)
                .then((vRes) => {
                  if (isMounted && vRes.data) {
                    setEnrolledVotersCount(vRes.data.length);
                  }
                })
                .catch(() => {});
            }
          } else {
            setElections([]);
          }
        }
      } catch {
        if (isMounted) setElections([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [organization.id]);

  const totalElections = elections.length;
  const activeElections = elections.filter((e) => e.status === ElectionStatus.ACTIVE);
  const institutionalElections = elections.filter((e) => e.category === ElectionCategory.INSTITUTIONAL);
  const paidCompetitions = elections.filter((e) => e.category === ElectionCategory.PAID_COMPETITION);

  const getCategoryBadge = (category: ElectionCategory) => {
    switch (category) {
      case ElectionCategory.INSTITUTIONAL:
        return {
          label: 'INSTITUTIONAL',
          color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
          rule: '1 Voter = 1 Vote'
        };
      case ElectionCategory.PAID_COMPETITION:
        return {
          label: 'PAID COMPETITION',
          color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
          rule: 'Voting Credit Bundles'
        };
      case ElectionCategory.PUBLIC_POLL:
        return {
          label: 'PUBLIC OPINION POLL',
          color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
          rule: 'Community Survey'
        };
      default:
        return {
          label: category,
          color: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
          rule: 'Standard Voting'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* =====================================================================
          1. WELCOME HERO CARD
      ===================================================================== */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[11px] font-mono">
                {organization.name}
              </Badge>
              <Badge variant="success" className="text-[11px]">
                {organization.planId || 'STANDARD'} TIER
              </Badge>
              <Badge variant="secondary" className="text-[11px] uppercase font-mono">
                Role: {userRole}
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {currentUser.fullName || 'Event Organiser'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Your elections and voting activities are running smoothly. All ballots are verified in real time,
              and your organization's workspace is private and secure.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={onOpenCreateElection}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md shadow-primary/20 gap-1.5"
            >
              <Plus className="h-4 w-4" /> New Election
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigateTab('voting')}
              className="border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold gap-1.5"
            >
              <Vote className="h-4 w-4 text-emerald-500" /> Cast Ballot
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. KEY METRICS STAT GRID (4 CARDS)
      ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Active Elections */}
        <div
          onClick={() => onNavigateTab('elections')}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Contests</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">
              {activeElections.length}{' '}
              <span className="text-sm font-normal text-muted-foreground">/ {totalElections} Total</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {institutionalElections.length} Institutional • {paidCompetitions.length} Paid
            </p>
          </div>
        </div>

        {/* Metric 2: Total Ballots Cast */}
        <div
          onClick={() => onNavigateTab('voting')}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Ballots Cast</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Vote className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{ballotsCastCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 100% Cryptographic Integrity
            </p>
          </div>
        </div>

        {/* Metric 3: Enrolled Voters */}
        <div
          onClick={() => onNavigateTab('voters')}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Enrolled Voters</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{enrolledVotersCount.toLocaleString()}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" /> Verified by domain & CSV
            </p>
          </div>
        </div>

        {/* Metric 4: Available Earnings */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Available Earnings</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {formatKes(walletBalanceCents)}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Ready for Withdrawal
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. ACTIVE ELECTIONS SNAPSHOT & LIVE PARTICIPATION
      ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground tracking-tight">Active Elections</h3>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {activeElections.length} Live
            </Badge>
          </div>
          <button
            onClick={() => onNavigateTab('elections')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View All Elections</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            Loading elections from workspace database...
          </div>
        ) : elections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
            <Vote className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <h4 className="text-sm font-bold text-foreground">No elections found in {organization.name}</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Launch your first institutional election, paid talent competition, or public opinion poll.
            </p>
            <Button
              size="sm"
              onClick={onOpenCreateElection}
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Create Election
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elections.slice(0, 6).map((elec) => {
              const badge = getCategoryBadge(elec.category);
              const isActive = elec.status === ElectionStatus.ACTIVE;
              return (
                <div
                  key={elec.id}
                  className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] font-mono ${badge.color}`}>
                        {badge.label}
                      </Badge>
                      <Badge
                        variant={isActive ? 'success' : 'secondary'}
                        className="text-[10px] uppercase font-mono"
                      >
                        {elec.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                      {elec.title}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {elec.description || 'No description provided.'}
                    </p>

                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      Rule: {badge.rule}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="h-3 w-3" />
                      {new Date(elec.startTime).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSharingElection(elec)}
                        className="text-primary hover:bg-primary/10 text-xs font-semibold h-7 px-2 gap-1"
                        title="Share vote link & QR code"
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigateTab('elections')}
                        className="border-border bg-card text-foreground hover:bg-muted text-xs font-semibold h-7 px-2.5"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          4. OPERATIONS SHORTCUTS & AUDIT LOG ACCESS
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Electoral Event Stream */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-foreground">Workspace Activity Stream</h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">System Online</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-lg border border-primary/20 bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground truncate">{organization.name} Workspace Active</h4>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">Live</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Workspace verified. All operations are securely isolated to your organization.
                </p>
              </div>
            </div>

            {totalElections > 0 ? (
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Vote className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">{totalElections} Contests Configured</h4>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">Synchronized</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    All voting workspaces are live and ready for {organization.name}.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Quick Operations Cards */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Operations Shortcuts</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('voters')}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Bulk Import Voter Register
                  </div>
                  <div className="text-[10px] text-muted-foreground">Upload CSV with domain tags</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('finance')}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
                    Request Payout
                  </div>
                  <div className="text-[10px] text-muted-foreground">Withdraw available earnings to your account</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('members')}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors">
                    Manage Roles & Staff
                  </div>
                  <div className="text-[10px] text-muted-foreground">Configure Owner, Admin, Staff</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                    Workspace Policies & Timezone
                  </div>
                  <div className="text-[10px] text-muted-foreground">Configure tenant settings</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-muted-foreground">
            Organization Slug: <code className="text-foreground font-mono font-semibold">{organization.slug}</code>
          </div>
        </div>
      </div>

      <ShareElectionModal
        election={sharingElection}
        isOpen={!!sharingElection}
        onClose={() => setSharingElection(null)}
      />
    </div>
  );
}
