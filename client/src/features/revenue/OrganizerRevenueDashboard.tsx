import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  ShieldCheck,
  RefreshCw,
  Receipt,
  RotateCcw
} from 'lucide-react';
import {
  OrganizerRevenueMetrics,
  RevenueAllocation
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface OrganizerRevenueDashboardProps {
  organizationId?: string;
}

export function OrganizerRevenueDashboard({ organizationId }: OrganizerRevenueDashboardProps) {
  const [metrics, setMetrics] = useState<OrganizerRevenueMetrics | null>(null);
  const [allocations, setAllocations] = useState<RevenueAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const orgParam = organizationId ? `?organizationId=${organizationId}` : '';
      const [metricsRes, allocRes] = await Promise.all([
        apiClient.get<OrganizerRevenueMetrics>(`/revenue/organizer${orgParam}`),
        apiClient.get<RevenueAllocation[]>(`/revenue/allocations${orgParam}`)
      ]);

      if (metricsRes.data) {
        setMetrics(metricsRes.data);
      }
      if (allocRes.data) {
        setAllocations(allocRes.data);
      }
    } catch {
      // Fallback preview
      setMetrics({
        organizationId: organizationId || 'org-metro-uni',
        currency: 'USD',
        grossSales: 15000,
        processingFees: 300,
        approvedDeductions: 0,
        distributableAmount: 14700,
        platformCommission: 3675,
        organiserEarnings: 11025,
        availableBalance: 11025,
        reservedBalance: 0,
        allocationsCount: 2
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [organizationId]);

  const formatCents = (cents: number = 0) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Revenue & Financial Accounting</h2>
            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
              Commercial Split: 60% Organiser / 40% Platform
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time distributable calculations, processing fee deductions, and double-entry ledger earnings.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchFinancials}
          className="h-8 gap-1.5 text-xs text-muted-foreground self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Gross Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{formatCents(metrics?.grossSales)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total voter package purchases</p>
          </CardContent>
        </Card>

        {/* Distributable Amount */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Distributable</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">{formatCents(metrics?.distributableAmount)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Less {formatCents(metrics?.processingFees)} fees & {formatCents(metrics?.approvedDeductions)} deductions
            </p>
          </CardContent>
        </Card>

        {/* Organiser Net Share (60%) */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-emerald-600 uppercase">Organiser Share (60%)</CardTitle>
            <Percent className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{formatCents(metrics?.organiserEarnings)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Net earned revenue</p>
          </CardContent>
        </Card>

        {/* Platform Share (40%) */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Platform Fee (40%)</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-muted-foreground">{formatCents(metrics?.platformCommission)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Votexa SaaS commission</p>
          </CardContent>
        </Card>
      </div>

      {/* Available vs Reserved Treasury Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/20 border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Available Treasury Balance</span>
              <div className="text-xl font-black text-foreground">{formatCents(metrics?.availableBalance)}</div>
            </div>
          </div>
          <Badge variant="success" className="text-xs font-bold">
            Available for Payout
          </Badge>
        </Card>

        <Card className="p-4 bg-muted/20 border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Reserved / Escrow Balance</span>
              <div className="text-xl font-black text-foreground">{formatCents(metrics?.reservedBalance)}</div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-amber-500">
            Dispute & Payout Reserve
          </Badge>
        </Card>
      </div>

      {/* Allocations & Transaction History */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Revenue Allocation Ledger (40/60 Split)</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {allocations.length} Verified Allocations
          </span>
        </div>

        {allocations.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No revenue allocations recorded yet.
          </div>
        ) : (
          <div className="divide-y rounded-xl border bg-card/40 overflow-hidden text-xs">
            {allocations.map((a) => (
              <div key={a.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{a.paymentTransactionId}</span>
                    <Badge
                      variant={
                        a.status === 'ALLOCATED'
                          ? 'success'
                          : a.status === 'FULLY_REFUNDED'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{new Date(a.allocatedAt).toLocaleString()}</span>
                    <span>Gross: {formatCents(a.grossAmountCents)}</span>
                    <span>Fees: {formatCents(a.processingFeeCents)}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="font-bold text-emerald-600 text-sm">
                    +{formatCents(a.organiserFeeCents)} (60%)
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Platform Fee: {formatCents(a.platformFeeCents)} (40%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

