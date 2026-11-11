import { useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, LogOut, Crown } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/button';
import { ThemeToggle } from '../../lib/theme';
import {
  UserProfile,
  UserOrganizationMembership,
  SystemRole,
  PlatformRole
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
  onOpenSuperAdmin?: () => void;
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
  onOpenSuperAdmin,
  serverStatus,
  walletBalanceCents
}: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeMembership =
    memberships.find((m) => m.organization.id === activeOrgId) || memberships[0];
  const activeOrg = activeMembership?.organization;

  const isSuperAdmin =
    currentUser.systemRole === SystemRole.SUPER_ADMIN ||
    currentUser.platformRoles?.includes(PlatformRole.SUPER_ADMIN) ||
    currentUser.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) ||
    currentUser.email === 'chunegeorge112@gmail.com' ||
    currentUser.email === 'admin@votexa.io';

  // Tab Titles and Subtitles
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Workspace Dashboard',
      subtitle: 'Real-time overview of active elections, voter participation, and financial balance.'
    },
    voting: {
      title: 'Official Ballot',
      subtitle: 'Cast your secret ballot securely with an instant digital confirmation receipt.'
    },
    elections: {
      title: 'Elections & Contests',
      subtitle: 'Manage institutional elections, paid competitions, scheduling, and live results.'
    },
    candidates: {
      title: 'Candidates & Nominations',
      subtitle: 'Review nominations, candidate profiles, and ballot listings.'
    },
    voters: {
      title: 'Voter Register & Eligibility',
      subtitle: 'Manage eligible voters, import rosters, and configure verification rules.'
    },
    members: {
      title: 'Organization Members & Roles',
      subtitle: 'Manage workspace access, invite team members, and configure permissions.'
    },
    settings: {
      title: 'Workspace Settings',
      subtitle: 'Configure timezone, organization contact information, and platform preferences.'
    },
    finance: {
      title: 'Treasury & Payouts',
      subtitle: 'View ticket sales, available earnings, and request organizer payouts.'
    },
    admin: {
      title: 'Platform Administration',
      subtitle: 'Platform-wide oversight, audit reports, commission settings, and security logs.'
    },
    profile: {
      title: 'My Profile & Account',
      subtitle: 'Manage your personal account details, security credentials, and organization access.'
    },
    onboarding: {
      title: 'Create Organization Workspace',
      subtitle: 'Set up a private, secure workspace for your institution or contest.'
    }
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'Workspace Dashboard',
    subtitle: 'Manage and monitor your electoral operations.'
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row selection:bg-primary selection:text-white transition-colors duration-200">
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
        onOpenSuperAdmin={onOpenSuperAdmin}
        walletBalanceCents={walletBalanceCents}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="h-16 px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs truncate">
              <span className="font-semibold text-muted-foreground truncate hidden sm:inline">
                {activeOrg?.name || 'Workspace'}
              </span>
              <span className="text-muted-foreground/60 hidden sm:inline">/</span>
              <span className="font-bold text-foreground truncate">
                {currentTabInfo.title}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Server Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{serverStatus}</span>
            </div>

            {/* Super Admin Portal Launcher */}
            {isSuperAdmin && onOpenSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSuperAdmin}
                className="text-xs h-8 gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:text-amber-500 font-bold shadow-sm"
              >
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Super Admin Portal</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            )}

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Log Out Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 gap-1.5 inline-flex"
              title="Log Out of Workspace"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-8">
          {children}
        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-border bg-card/50 px-4 lg:px-8 py-4 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Votexa • Workspace: <span className="font-semibold text-foreground">{activeOrg?.name || 'My Organization'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Workspace Protected</span>
            <span>Verified Payout Account</span>
            <span>Instant Payouts Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
