import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Server, ShieldCheck, Database, Layers, Landmark, DollarSign } from 'lucide-react';
import { SuperAdminFinancialDashboard } from './SuperAdminFinancialDashboard';
import { SuperAdminPayoutQueue } from './SuperAdminPayoutQueue';

interface AdministrationPanelProps {
  currentAdminUserId?: string;
}

export function AdministrationPanel({ currentAdminUserId = 'usr-super-admin' }: AdministrationPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'payouts' | 'financials'>('payouts');

  const stats = [
    { label: 'Active Organizations', value: '48', icon: Layers },
    { label: 'Running Elections', value: '19', icon: ShieldCheck },
    { label: 'Database Health', value: 'PostgreSQL Operational', icon: Database },
    { label: 'Engine Foundation', value: 'Phase 1 Established', icon: Server }
  ];

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Platform Administration & Governance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-tenant governance, double-entry financial ledger, and organiser withdrawal settlement desk.
          </p>
        </div>
        <Badge variant="success" className="gap-1 text-xs self-start sm:self-auto">
          System Operational
        </Badge>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b pb-1 text-xs">
        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium border-b-2 transition-colors ${
            activeSubTab === 'payouts'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Landmark className="h-3.5 w-3.5" />
          Withdrawal Desk & Payouts Queue
        </button>

        <button
          onClick={() => setActiveSubTab('financials')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium border-b-2 transition-colors ${
            activeSubTab === 'financials'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Platform Financial Ledger
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium border-b-2 transition-colors ${
            activeSubTab === 'overview'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          System Health & Metrics
        </button>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'payouts' && (
        <SuperAdminPayoutQueue currentAdminUserId={currentAdminUserId} />
      )}

      {activeSubTab === 'financials' && (
        <SuperAdminFinancialDashboard />
      )}

      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
