import { useState } from 'react';
import {
  Server,
  Building2,
  Users,
  Vote,
  CreditCard,
  Landmark,
  DollarSign,
  Percent,
  FileText,
  Lock,
  Radio,
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ThemeToggle } from '../../lib/theme';
import { VotexaLogo } from '../../components/brand/VotexaLogo';
import { UserProfile } from '@votexa/shared';
import { SuperAdminOverview } from './SuperAdminOverview';
import { SuperAdminOrgManagement } from './SuperAdminOrgManagement';
import { SuperAdminUserManagement } from './SuperAdminUserManagement';
import { SuperAdminElectionModeration } from './SuperAdminElectionModeration';
import { SuperAdminPaymentMonitoring } from './SuperAdminPaymentMonitoring';
import { SuperAdminPayoutQueue } from './SuperAdminPayoutQueue';
import { SuperAdminFinancialDashboard } from './SuperAdminFinancialDashboard';
import { SuperAdminCommissionSettings } from './SuperAdminCommissionSettings';
import { SuperAdminReportingCenter } from './SuperAdminReportingCenter';
import { SuperAdminAuditLogViewer } from './SuperAdminAuditLogViewer';
import { SuperAdminSecurityEvents } from './SuperAdminSecurityEvents';

export type SuperAdminNavTab =
  | 'overview'
  | 'organizations'
  | 'users'
  | 'elections'
  | 'payments'
  | 'payouts'
  | 'financials'
  | 'commissions'
  | 'reports'
  | 'audit'
  | 'security';

export interface SuperAdminPortalProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  serverStatus?: string;
}

export function SuperAdminPortal({
  currentUser,
  onSignOut,
  serverStatus = 'Online'
}: SuperAdminPortalProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminNavTab>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navSections = [
    {
      title: 'PLATFORM GOVERNANCE',
      items: [
        { id: 'overview' as const, label: 'Platform Overview', icon: Server, badge: 'Live' },
        { id: 'organizations' as const, label: 'Organisations & Tenants', icon: Building2 },
        { id: 'users' as const, label: 'Users & RBAC Roles', icon: Users },
        { id: 'elections' as const, label: 'Election Moderation', icon: Vote }
      ]
    },
    {
      title: 'FINANCIAL & REVENUE',
      items: [
        { id: 'payments' as const, label: 'Payment Gateway Feeds', icon: CreditCard },
        { id: 'payouts' as const, label: 'Withdrawal Desk', icon: Landmark, badge: 'Queue' },
        { id: 'financials' as const, label: '40/60 Ledger Engine', icon: DollarSign },
        { id: 'commissions' as const, label: 'Commission Settings', icon: Percent }
      ]
    },
    {
      title: 'COMPLIANCE & SECURITY',
      items: [
        { id: 'reports' as const, label: 'Reporting Center', icon: FileText, badge: '9 Reports' },
        { id: 'audit' as const, label: 'Immutable Audit Logs', icon: Lock },
        { id: 'security' as const, label: 'Security & Threat Feed', icon: Radio }
      ]
    }
  ];

  const tabMeta: Record<SuperAdminNavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Platform Command Center',
      subtitle: 'Real-time telemetry, global election turnouts, revenue aggregates, and system health.'
    },
    organizations: {
      title: 'Tenant & Workspace Governance',
      subtitle: 'Inspect and manage all organization tenants, plan subscriptions, and operational statuses.'
    },
    users: {
      title: 'Global Identity & Access Control',
      subtitle: 'Platform user directory, privilege elevation, Super Admin authorizations, and security states.'
    },
    elections: {
      title: 'Global Election Moderation',
      subtitle: 'Cross-tenant contest surveillance, ballot integrity inspection, and emergency freeze controls.'
    },
    payments: {
      title: 'Payment Gateway Stream',
      subtitle: 'Live ingestion of Safaricom Daraja M-Pesa STK pushes and Paystack card transactions.'
    },
    payouts: {
      title: 'Organiser Withdrawal Desk',
      subtitle: 'Review organizer earnings withdrawals and execute automated M-Pesa B2C disbursements.'
    },
    financials: {
      title: 'Commercial Ledger & Revenue Sharing',
      subtitle: 'Double-entry platform ledger tracking the 40/60 commercial split and net platform reserves.'
    },
    commissions: {
      title: 'Platform Commission Settings',
      subtitle: 'Configure dynamic commercial revenue share percentages, flat ticket fees, and enterprise billing.'
    },
    reports: {
      title: 'Regulatory & Compliance Reports',
      subtitle: 'Generate and download 9 official audit reports in RFC 4180 CSV and JSON formats.'
    },
    audit: {
      title: 'Cryptographic Audit Trail',
      subtitle: 'SHA-256 hash-chained immutable audit records of all administrator and tally operations.'
    },
    security: {
      title: 'Security Events & Anomaly Telemetry',
      subtitle: 'Real-time monitoring of authentication anomalies, rate limit violations, and security incidents.'
    }
  };

  const currentTab = tabMeta[activeTab] || tabMeta.overview;

  const handleSelectTab = (tab: SuperAdminNavTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-amber-500 selection:text-black">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sovereign Super Admin Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-slate-900 border-r border-slate-800 text-slate-200 transition-transform duration-200 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <VotexaLogo size="sm" showWordmark={true} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
                <Crown className="h-3 w-3 inline text-amber-400" />
                Super Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="mx-3 my-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-200">Root Governance Mode</span>
          </div>
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold px-1.5 py-0">
            Sovereign
          </Badge>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-500 shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: User Identity */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          {/* Identity Pill */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-2.5 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                {currentUser.fullName || 'George Chune'}
              </p>
              <p className="text-[10px] text-amber-400/90 font-medium truncate flex items-center gap-1">
                <Crown className="h-2.5 w-2.5 inline" />
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Command Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-md text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Super Admin Portal
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-sm font-semibold text-slate-200">{currentTab.title}</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xl">
                {currentTab.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>PostgreSQL Pool: {serverStatus}</span>
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5 px-2.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <SuperAdminOverview onNavigateTab={(tab) => handleSelectTab(tab as SuperAdminNavTab)} />
          )}

          {activeTab === 'organizations' && <SuperAdminOrgManagement />}

          {activeTab === 'users' && <SuperAdminUserManagement />}

          {activeTab === 'elections' && <SuperAdminElectionModeration />}

          {activeTab === 'payments' && <SuperAdminPaymentMonitoring />}

          {activeTab === 'payouts' && (
            <SuperAdminPayoutQueue currentAdminUserId={currentUser.id} />
          )}

          {activeTab === 'financials' && <SuperAdminFinancialDashboard />}

          {activeTab === 'commissions' && <SuperAdminCommissionSettings />}

          {activeTab === 'reports' && <SuperAdminReportingCenter />}

          {activeTab === 'audit' && <SuperAdminAuditLogViewer />}

          {activeTab === 'security' && <SuperAdminSecurityEvents />}
        </main>
      </div>
    </div>
  );
}
