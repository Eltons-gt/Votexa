import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Vote,
  Plus,
  Search,
  Calendar,
  Clock,
  Shield,
  DollarSign,
  BarChart2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  Election,
  ElectionStatus,
  ElectionCategory,
  OrganizationRole
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

const DEFAULT_DEMO_ELECTIONS: Election[] = [
  {
    id: 'elec-inst-1',
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
  },
  {
    id: 'elec-paid-1',
    organizationId: 'current',
    category: ElectionCategory.PAID_COMPETITION,
    title: 'National Collegiate Performing Arts & Talent Showcase',
    description: 'Audience-choice public voting for top collegiate performing ensemble. Multiple votes permitted.',
    status: ElectionStatus.ACTIVE,
    startTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    timezone: 'America/New_York',
    allowSelfRegistration: true,
    isPaidVoting: true,
    createdById: 'usr-demo-owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'elec-poll-1',
    organizationId: 'current',
    category: ElectionCategory.PUBLIC_POLL,
    title: 'Campus Carbon Neutrality & Light Rail Transit Initiative',
    description: 'Community survey on campus transport electrification and renewable energy investments.',
    status: ElectionStatus.DRAFT,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 14).toISOString(),
    timezone: 'America/New_York',
    allowSelfRegistration: true,
    isPaidVoting: false,
    createdById: 'usr-demo-owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface ElectionDashboardProps {
  organizationName: string;
  userRole?: OrganizationRole;
  onSelectElection: (election: Election) => void;
  onOpenWizard: () => void;
}

export function ElectionDashboard({
  organizationName,
  userRole = OrganizationRole.OWNER,
  onSelectElection,
  onOpenWizard
}: ElectionDashboardProps) {
  const [elections, setElections] = useState<Election[]>(DEFAULT_DEMO_ELECTIONS);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchElections = async () => {
    try {
      setLoading(true);
      let query = '/elections';
      const params: string[] = [];
      if (categoryFilter !== 'ALL') params.push(`category=${categoryFilter}`);
      if (statusFilter !== 'ALL') params.push(`status=${statusFilter}`);
      if (params.length > 0) query += `?${params.join('&')}`;

      const res = await apiClient.get<Election[]>(query);
      if (res.data && res.data.length > 0) {
        setElections(res.data);
      } else {
        setElections(DEFAULT_DEMO_ELECTIONS);
      }
    } catch {
      setElections(DEFAULT_DEMO_ELECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, [categoryFilter, statusFilter]);

  const filteredElections = elections.filter((e) => {
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  });

  const totalCount = elections.length;
  const activeCount = elections.filter((e) => e.status === ElectionStatus.ACTIVE).length;
  const institutionalCount = elections.filter((e) => e.category === ElectionCategory.INSTITUTIONAL).length;
  const paidCount = elections.filter((e) => e.category === ElectionCategory.PAID_COMPETITION).length;

  const isReadOnly = userRole === OrganizationRole.STAFF;

  const getStatusBadge = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return <Badge variant="success">ACTIVE</Badge>;
      case ElectionStatus.SCHEDULED:
        return <Badge variant="secondary">SCHEDULED</Badge>;
      case ElectionStatus.CLOSED:
      case ElectionStatus.CONCLUDED:
        return <Badge variant="outline">CLOSED</Badge>;
      case ElectionStatus.CANCELLED:
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="default">DRAFT</Badge>;
    }
  };

  const getCategoryIcon = (cat: ElectionCategory) => {
    switch (cat) {
      case ElectionCategory.INSTITUTIONAL:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case ElectionCategory.PAID_COMPETITION:
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      case ElectionCategory.PUBLIC_POLL:
        return <BarChart2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <Vote className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Election Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Vote className="h-6 w-6 text-primary" />
            <span className="text-foreground">{organizationName} Elections</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage institutional elections, paid competitions, and public polls with verified real-time results.
          </p>
        </div>

        {!isReadOnly && (
          <Button onClick={onOpenWizard} size="sm" className="gap-1.5 text-xs shadow-md">
            <Plus className="h-4 w-4" /> Create Election
          </Button>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3.5 bg-card border-border shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Vote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Elections</p>
            <p className="text-xl font-black text-foreground">{totalCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-card border-border shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Active Polls Now</p>
            <p className="text-xl font-black text-foreground">{activeCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-card border-border shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Institutional</p>
            <p className="text-xl font-black text-foreground">{institutionalCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-card border-border shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Paid Competitions</p>
            <p className="text-xl font-black text-foreground">{paidCount}</p>
          </div>
        </Card>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: ElectionCategory.INSTITUTIONAL, label: 'Institutional' },
            { id: ElectionCategory.PAID_COMPETITION, label: 'Paid Competitions' },
            { id: ElectionCategory.PUBLIC_POLL, label: 'Public Polls' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 font-medium ${
                categoryFilter === cat.id
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'border border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elections..."
              className="pl-8 text-xs h-8 bg-card border-border text-foreground"
            />
          </div>

          <select
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value={ElectionStatus.DRAFT}>Draft</option>
            <option value={ElectionStatus.SCHEDULED}>Scheduled</option>
            <option value={ElectionStatus.ACTIVE}>Active</option>
            <option value={ElectionStatus.CLOSED}>Closed</option>
            <option value={ElectionStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">Loading workspace elections...</div>
      ) : filteredElections.length === 0 ? (
        <Card className="border-dashed py-12 text-center bg-card border-border">
          <CardContent className="space-y-3">
            <Vote className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-base font-semibold text-foreground">No elections match your filter</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create a new institutional election, paid competition, or public poll to get started.
            </p>
            {!isReadOnly && (
              <Button size="sm" onClick={onOpenWizard} className="mt-2 text-xs">
                + Launch Election Wizard
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredElections.map((elec) => (
            <Card
              key={elec.id}
              className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm hover:shadow-md overflow-hidden group bg-card border-border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {getCategoryIcon(elec.category)}
                    <span className="text-[11px] text-muted-foreground">{elec.category}</span>
                  </div>
                  {getStatusBadge(elec.status)}
                </div>
                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2 mt-2 text-foreground">
                  {elec.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {elec.description || 'No description provided.'}
                </p>
              </CardHeader>

              <CardContent className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    {new Date(elec.startTime).toLocaleDateString()} — {new Date(elec.endTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Timezone: {elec.timezone}</span>
                </div>

                {/* Category Rule Badges */}
                <div className="pt-2 border-t border-border flex flex-wrap gap-1.5">
                  {elec.category === ElectionCategory.INSTITUTIONAL ? (
                    <>
                      <Badge variant="outline" className="text-[10px]">
                        1 Vote / Position
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Verified Roll
                      </Badge>
                    </>
                  ) : elec.category === ElectionCategory.PAID_COMPETITION ? (
                    <>
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                        Paid Entry Voting
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Multiple Votes Allowed
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        Public Poll
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {elec.allowSelfRegistration ? 'Open Registration' : 'Closed Roster'}
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border flex items-center justify-between bg-muted/20">
                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: {elec.id.slice(0, 10)}...
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectElection(elec)}
                  className="gap-1 text-xs h-7 hover:bg-primary hover:text-primary-foreground"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
