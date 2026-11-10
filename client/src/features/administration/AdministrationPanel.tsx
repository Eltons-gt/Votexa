import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import {
  Server,
  ShieldCheck,
  Landmark,
  DollarSign,
  Building2,
  Users,
  Vote,
  CreditCard,
  Percent,
  FileText,
  Lock,
  Radio
} from 'lucide-react';
import { SuperAdminFinancialDashboard } from './SuperAdminFinancialDashboard';
import { SuperAdminPayoutQueue } from './SuperAdminPayoutQueue';
import { SuperAdminOverview } from './SuperAdminOverview';
import { SuperAdminOrgManagement } from './SuperAdminOrgManagement';
import { SuperAdminUserManagement } from './SuperAdminUserManagement';
import { SuperAdminElectionModeration } from './SuperAdminElectionModeration';
import { SuperAdminPaymentMonitoring } from './SuperAdminPaymentMonitoring';
import { SuperAdminCommissionSettings } from './SuperAdminCommissionSettings';
import { SuperAdminReportingCenter } from './SuperAdminReportingCenter';
import { SuperAdminAuditLogViewer } from './SuperAdminAuditLogViewer';
import { SuperAdminSecurityEvents } from './SuperAdminSecurityEvents';

interface AdministrationPanelProps {
  currentAdminUserId?: string;
}

export type AdminTab =
  | 'overview'
  | 'payouts'
  | 'financials'
  | 'organizations'
  | 'users'
  | 'elections'
  | 'payments'
  | 'commissions'
  | 'reports'
  | 'audit'
  | 'security';

export function AdministrationPanel({ currentAdminUserId = 'usr-super-admin' }: AdministrationPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs: { key: AdminTab; label: string; icon: any; badge?: string }[] = [
    { key: 'overview', label: 'Platform Overview', icon: Server },
    { key: 'organizations', label: 'Organisations', icon: Building2 },
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'elections', label: 'Election Moderation', icon: Vote },
    { key: 'payments', label: 'Payments Monitor', icon: CreditCard },
    { key: 'payouts', label: 'Withdrawal Desk', icon: Landmark },
    { key: 'financials', label: 'Financial Ledger', icon: DollarSign },
    { key: 'commissions', label: 'Commission Settings', icon: Percent },
    { key: 'reports', label: 'Reporting Center', icon: FileText, badge: '9 Reports' },
    { key: 'audit', label: 'Audit Logs', icon: Lock },
    { key: 'security', label: 'Security Events', icon: Radio }
  ];

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Votexa Super Administrator Suite
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise governance, multi-tenant moderation, 40/60 double-entry ledger, reporting & immutable audit infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Signed in as {currentAdminUserId}
          </Badge>
          <Badge variant="success" className="gap-1 text-xs">
            System Operational
          </Badge>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b pb-1 overflow-x-auto text-xs scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-primary bg-primary/5 font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <SuperAdminOverview onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === 'organizations' && (
        <SuperAdminOrgManagement />
      )}

      {activeTab === 'users' && (
        <SuperAdminUserManagement />
      )}

      {activeTab === 'elections' && (
        <SuperAdminElectionModeration />
      )}

      {activeTab === 'payments' && (
        <SuperAdminPaymentMonitoring />
      )}

      {activeTab === 'payouts' && (
        <SuperAdminPayoutQueue currentAdminUserId={currentAdminUserId} />
      )}

      {activeTab === 'financials' && (
        <SuperAdminFinancialDashboard />
      )}

      {activeTab === 'commissions' && (
        <SuperAdminCommissionSettings />
      )}

      {activeTab === 'reports' && (
        <SuperAdminReportingCenter />
      )}

      {activeTab === 'audit' && (
        <SuperAdminAuditLogViewer />
      )}

      {activeTab === 'security' && (
        <SuperAdminSecurityEvents />
      )}
    </div>
  );
}
