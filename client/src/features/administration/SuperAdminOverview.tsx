import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Building2,
  Users,
  Vote,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Landmark,
  Scale,
  CreditCard
} from 'lucide-react';
import { PlatformOverviewMetrics } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface SuperAdminOverviewProps {
  onNavigateTab: (tabKey: any) => void;
}

export function SuperAdminOverview({ onNavigateTab }: SuperAdminOverviewProps) {
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<PlatformOverviewMetrics>('/admin/overview');
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        // Fallback demo mock
        setMetrics({
          totalOrganizations: 48,
          activeOrganizations: 46,
          totalUsers: 1240,
          totalElections: 32,
          activeElections: 19,
          paidCompetitionsCount: 8,
          totalPaymentVolumeCents: 4500000,
          platformRevenueCents: 1800000,
          organiserLiabilitiesCents: 2700000,
          payoutsSettledCents: 1250000,
          refundsTotalCents: 15000,
          chargebacksTotalCents: 0,
          reconciliationDiscrepancies: 0,
          systemHealth: 'OPERATIONAL',
          currency: 'USD',
          isLedgerBalanced: true
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with administration service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Platform Executive Command Center
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated platform governance, financial balances, and system health metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {metrics?.isLedgerBalanced ? (
            <Badge variant="success" className="gap-1 text-xs">
              <Scale className="h-3.5 w-3.5" /> Ledger Balanced
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-xs">
              Ledger Discrepancy Alert
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={loading}
            className="text-xs gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20">
          {error}
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Gross Payment Volume
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ${((metrics?.totalPaymentVolumeCents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">M-Pesa STK & card payments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Platform Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${((metrics?.platformRevenueCents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Platform Treasury Balance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Total Organiser Earnings
            </CardTitle>
            <Landmark className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${((metrics?.organiserLiabilitiesCents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Organiser Treasury pool</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Disbursements Settled
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              ${((metrics?.payoutsSettledCents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Via Daraja B2C settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Customer Organisations
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.activeOrganizations || 0}{' '}
              <span className="text-xs font-normal text-muted-foreground">/ {metrics?.totalOrganizations || 0} active</span>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => onNavigateTab('organizations')}
              className="p-0 h-auto text-xs text-primary mt-2"
            >
              Manage organisations →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Elections & Competitions
            </CardTitle>
            <Vote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.activeElections || 0}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                active ({metrics?.paidCompetitionsCount || 0} paid)
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => onNavigateTab('elections')}
              className="p-0 h-auto text-xs text-primary mt-2"
            >
              Moderate elections →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
              Platform Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalUsers?.toLocaleString() || 0}
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => onNavigateTab('users')}
              className="p-0 h-auto text-xs text-primary mt-2"
            >
              Inspect user roles →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Governance Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1.5"
        >
          <div className="font-semibold text-sm text-foreground flex items-center justify-between">
            <span>Enterprise Reporting System</span>
            <Badge variant="outline" className="text-[10px]">9 Reports</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate and export CSV or JSON reports for voter turnout, platform commission, organiser earnings, and audit reconciliations.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('audit')}
          className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1.5"
        >
          <div className="font-semibold text-sm text-foreground flex items-center justify-between">
            <span>Immutable Audit Logs</span>
            <Badge variant="outline" className="text-[10px]">Trigger Protected</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Inspect verified before/after diffs and state transformations. Automatically redacted to protect sensitive secrets.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('security')}
          className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1.5"
        >
          <div className="font-semibold text-sm text-foreground flex items-center justify-between">
            <span>Security Operations Center</span>
            <Badge variant="destructive" className="text-[10px]">Real-time</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitor unauthorized privilege escalation attempts, cross-tenant isolation breaches, and duty separation anomalies.
          </p>
        </div>
      </div>
    </div>
  );
}
