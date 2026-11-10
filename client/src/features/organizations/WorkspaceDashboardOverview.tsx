import {
  Vote,
  Users,
  UserCheck,
  Wallet,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  Activity,
  Receipt,
  Smartphone,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Organization,
  OrganizationRole,
  UserProfile,
  ElectionCategory
} from '@votexa/shared';

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
  const formatKes = (cents: number) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const sampleActiveElections = [
    {
      id: 'elec-inst-1',
      title: 'Student Government Executive Council Election 2026',
      category: ElectionCategory.INSTITUTIONAL,
      categoryLabel: 'INSTITUTIONAL',
      status: 'ACTIVE',
      votersCast: 2420,
      votersTotal: 3250,
      endTime: 'In 3 days',
      badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10',
      rule: '1 Voter = 1 Vote'
    },
    {
      id: 'elec-paid-1',
      title: 'National Collegiate Performing Arts & Talent Showcase',
      category: ElectionCategory.PAID_COMPETITION,
      categoryLabel: 'PAID COMPETITION',
      status: 'ACTIVE',
      votersCast: 5890,
      votersTotal: 8000,
      endTime: 'In 5 days',
      badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10',
      rule: 'M-Pesa STK Bundles'
    },
    {
      id: 'elec-poll-1',
      title: 'Campus Carbon Neutrality & Light Rail Transit Initiative',
      category: ElectionCategory.PUBLIC_POLL,
      categoryLabel: 'PUBLIC OPINION POLL',
      status: 'DRAFT',
      votersCast: 0,
      votersTotal: 1500,
      endTime: 'Starts in 1 day',
      badgeColor: 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
      rule: 'Anonymous Survey'
    }
  ];

  const recentEvents = [
    {
      id: 'ev-1',
      title: 'Official Ballot Submitted',
      description: 'Voter FAC-001-MATH verified and cast official ballot for Dean of Faculty.',
      timestamp: '2 minutes ago',
      icon: Receipt,
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'ev-2',
      title: 'M-Pesa Payment Callback Verified',
      description: '50 Credits issued to FAN-KENYA-99 via Daraja STK Push (KES 5,000).',
      timestamp: '14 minutes ago',
      icon: Smartphone,
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'ev-3',
      title: 'Earnings Credited',
      description: 'KES 3,000 added to your available earnings balance.',
      timestamp: '14 minutes ago',
      icon: Wallet,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'ev-4',
      title: 'Voter Register CSV Bulk Import',
      description: '250 eligible voters enrolled into Student Government Election.',
      timestamp: '1 hour ago',
      icon: UserCheck,
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
  ];

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
                {organization.planId || 'ENTERPRISE'} TIER
              </Badge>
              <Badge variant="secondary" className="text-[11px] uppercase font-mono">
                Role: {userRole}
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {currentUser.fullName || 'Elections Admin'}
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
            <div className="text-3xl font-black text-foreground">2 <span className="text-sm font-normal text-muted-foreground">/ 3 Total</span></div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 1 Institutional • 1 Paid
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
            <div className="text-3xl font-black text-foreground">8,310</div>
            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> 100% Verified Submissions
            </p>
          </div>
        </div>

        {/* Metric 3: Registered Voters */}
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
            <div className="text-3xl font-black text-foreground">3,250</div>
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
              <Smartphone className="h-3 w-3" /> Ready for M-Pesa Withdrawal
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
              Live Contests
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleActiveElections.map((elec) => {
            const percentage = Math.round((elec.votersCast / elec.votersTotal) * 100);
            return (
              <div
                key={elec.id}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-mono ${elec.badgeColor}`}>
                      {elec.categoryLabel}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {elec.endTime}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                    {elec.title}
                  </h4>

                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    Rule: {elec.rule}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Turnout Progress</span>
                    <span className="font-mono font-bold text-foreground">{percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{elec.votersCast.toLocaleString()} votes cast</span>
                    <span>{elec.votersTotal.toLocaleString()} eligible</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onNavigateTab('voting')}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8"
                  >
                    Open Ballot
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateTab('elections')}
                    className="border-border bg-card text-foreground hover:bg-muted text-xs font-semibold h-8"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          4. RECENT ACTIVITY AUDIT STREAM & QUICK LAUNCHERS
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Electoral Event Stream */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-foreground">Recent Electoral Activity Stream</h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Live Audit Log</span>
          </div>

          <div className="space-y-3">
            {recentEvents.map((ev) => {
              const Icon = ev.icon;
              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-start gap-3.5"
                >
                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${ev.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">{ev.title}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{ev.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ev.description}</p>
                  </div>
                </div>
              );
            })}
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
                    Request M-Pesa Withdrawal
                  </div>
                  <div className="text-[10px] text-muted-foreground">Withdraw available earnings to M-Pesa</div>
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
            Tenant: <code className="text-foreground font-mono font-semibold">{organization.slug}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
