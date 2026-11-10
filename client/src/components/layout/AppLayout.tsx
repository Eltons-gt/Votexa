import { useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/button';
import {
  UserProfile,
  UserOrganizationMembership
} from '@votexa/shared';

export interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  currentUser: UserProfile;
  memberships: UserOrganizationMembership[];
  activeOrgId: string;
  onSwitchOrg: (orgId: string) => void;
  onOpenOnboarding: () => void;
  onNavigateHome: () => void;
  onSignOut: () => void;
  serverStatus: string;
  walletBalanceCents?: number;
}

export function AppLayout({
  children,
  activeTab,
  onSelectTab,
  currentUser,
  memberships,
  activeOrgId,
  onSwitchOrg,
  onOpenOnboarding,
  onNavigateHome,
  onSignOut,
  serverStatus,
  walletBalanceCents
}: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeMembership =
    memberships.find((m) => m.organization.id === activeOrgId) || memberships[0];
  const activeOrg = activeMembership?.organization;

  // Pretty Tab Titles
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    voting: {
      title: 'Cryptographic Ballot Interface',
      subtitle: 'Cast confidential ballots with double-voting prevention and tamper-evident receipt tokens.'
    },
    elections: {
      title: 'Election Lifecycle & Positions',
      subtitle: 'Manage institutional ballots, paid competitions, scheduling, and results visibility.'
    },
    candidates: {
      title: 'Candidate Directory & Ballots',
      subtitle: 'Review nominations, candidate statements, and position ballot assignments.'
    },
    voters: {
      title: 'Voter Register & Eligibility',
      subtitle: 'Audit enrolled voters, bulk import CSV rosters, and manage institutional domains.'
    },
    members: {
      title: 'Organization Members & Roles',
      subtitle: 'Manage workspace access, invite colleagues, and configure Owner, Admin, or Staff permissions.'
    },
    settings: {
      title: 'Workspace Settings & Policies',
      subtitle: 'Configure timezone, organization contact details, and tenant preferences.'
    },
    finance: {
      title: 'Treasury, 40/60 Split & Payouts',
      subtitle: 'Monitor 60% organiser earnings, M-Pesa B2C disbursements, and double-entry ledger balance.'
    },
    admin: {
      title: 'Platform Super Administration',
      subtitle: 'Platform-wide oversight, 9 RFC 4180 audit reports, commission controls, and security log viewer.'
    },
    profile: {
      title: 'User Profile & Identity',
      subtitle: 'Manage your authenticated session credentials, platform roles, and organization memberships.'
    },
    onboarding: {
      title: 'Create New Organization Workspace',
      subtitle: 'Establish an independent tenant workspace with PostgreSQL Row-Level Security isolation.'
    }
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'Workspace Dashboard',
    subtitle: 'Manage and monitor your electoral operations.'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row selection:bg-blue-600 selection:text-white">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        currentUser={currentUser}
        memberships={memberships}
        activeOrgId={activeOrgId}
        onSwitchOrg={onSwitchOrg}
        onOpenOnboarding={onOpenOnboarding}
        onNavigateHome={onNavigateHome}
        onSignOut={onSignOut}
        walletBalanceCents={walletBalanceCents}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs truncate">
              <span className="font-semibold text-slate-400 truncate hidden sm:inline">
                {activeOrg?.name || 'Workspace'}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-bold text-white truncate">
                {currentTabInfo.title}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Server Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 text-xs font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{serverStatus}</span>
            </div>

            {/* Public Landing Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-900 gap-1.5 hidden sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Landing Page</span>
            </Button>

            {/* Quick Profile Avatar */}
            <button
              onClick={() => onSelectTab('profile')}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-transform"
              title="View Profile"
            >
              {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
            </button>
          </div>
        </header>

        {/* Dynamic Page Header */}
        <div className="px-4 lg:px-8 pt-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-8">
          {children}
        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 px-4 lg:px-8 py-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Votexa Multi-Tenant Platform • Scoped to <code>{activeOrg?.id}</code>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">● PostgreSQL RLS Active</span>
            <span>Daraja B2C Live</span>
            <span>40/60 Ledger Balanced</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
