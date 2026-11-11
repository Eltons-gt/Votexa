import { useState, useEffect } from 'react';
import { LandingPage } from './features/landing';
import { AuthPage, UserProfileScreen } from './features/authentication';
import { AppLayout } from './components/layout';
import {
  OrganizationOnboarding,
  OrganizationSettings as OrgSettingsScreen,
  MemberManagement,
  WorkspaceDashboardOverview
} from './features/organizations';
import {
  ElectionDashboard,
  ElectionWizard,
  ElectionDetails,
  CandidateManagement,
  VoterManagement
} from './features/elections';
import { VotingInterface } from './features/voting';
import { PricingPackages } from './features/payments';
import { OrganizerRevenueDashboard } from './features/revenue';
import { PayoutsSection } from './features/payouts';
import { AdministrationPanel } from './features/administration';
import {
  Election,
  ElectionStatus,
  ElectionCategory,
  Wallet,
  UserProfile,
  UserOrganizationMembership,
  SystemRole,
  OrganizationRole
} from '@votexa/shared';
import { apiClient } from './lib/api';
import { supabase } from './lib/supabase';

export function App() {
  // Top-Level View Router: Landing Page vs. Auth Page vs. Workspace App
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authTargetRole, setAuthTargetRole] = useState<'organizer' | 'voter'>('organizer');

  // Workspace Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'voting' | 'elections' | 'candidates' | 'voters' | 'members' | 'settings' | 'finance' | 'admin' | 'profile' | 'onboarding'
  >('overview');

  const [serverStatus, setServerStatus] = useState<string>('Connecting...');

  // Election Navigation State
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [showElectionWizard, setShowElectionWizard] = useState<boolean>(false);

  // Active Authenticated User Profile (Restored from session or initialized)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('votexa_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-organizer',
      email: 'organizer@votexa.io',
      fullName: 'Event Organiser',
      systemRole: SystemRole.USER,
      platformRoles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // User's Authorized Organization Workspaces (Restored from session or default)
  const [memberships, setMemberships] = useState<UserOrganizationMembership[]>(() => {
    try {
      const saved = localStorage.getItem('votexa_memberships');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        organization: {
          id: 'org-main',
          name: 'My Voting Organization',
          slug: 'my-voting-organization',
          planId: 'STANDARD',
          settings: { timezone: 'Africa/Nairobi', contactEmail: 'organizer@votexa.io' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        role: OrganizationRole.OWNER
      }
    ];
  });

  const [activeOrgId, setActiveOrgId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('votexa_active_org_id');
      if (saved) return saved;
    } catch {}
    return 'org-main';
  });

  const defaultFallback: UserOrganizationMembership = {
    organization: {
      id: 'org-main',
      name: 'My Voting Organization',
      slug: 'my-voting-organization',
      planId: 'STANDARD',
      settings: { timezone: 'Africa/Nairobi', contactEmail: 'organizer@votexa.io' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    role: OrganizationRole.OWNER
  };

  const activeMembership =
    memberships.find((m) => m.organization.id === activeOrgId) ||
    memberships[0] ||
    defaultFallback;
  const activeOrg = activeMembership.organization;
  const activeRole = activeMembership.role;

  // Active Election Context
  const sampleElection: Election = {
    id: 'elec-inst-1',
    organizationId: activeOrg.id,
    category: ElectionCategory.INSTITUTIONAL,
    title: `${activeOrg.name} Executive Board Election`,
    description: 'Official annual election for executive council and president.',
    status: ElectionStatus.ACTIVE,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    timezone: activeOrg.settings?.timezone || 'UTC',
    allowSelfRegistration: false,
    isPaidVoting: false,
    createdById: currentUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const [wallet, setWallet] = useState<Wallet>({
    id: 'wal-1',
    organizationId: activeOrg.id,
    currency: 'USD',
    availableBalance: 145000,
    pendingBalance: 25000,
    updatedAt: new Date().toISOString()
  });

  const refreshWallet = async () => {
    try {
      const res = await apiClient.get<Wallet>('/wallets/my-wallet');
      if (res.success && res.data) {
        setWallet(res.data);
      }
    } catch {
      // Keep state
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    setActiveOrgId(orgId);
    apiClient.setTenant(orgId);

    try {
      const res = await apiClient.post<any>('/organizations/switch', { organizationId: orgId });
      if (res.success && res.data?.token) {
        apiClient.setAuthToken(res.data.token);
      }
    } catch {
      // Offline fallback
    }
    refreshWallet();
  };

  const handleOnboarded = (newMembership: UserOrganizationMembership) => {
    setMemberships([newMembership, ...memberships]);
    handleSwitchOrg(newMembership.organization.id);
    setActiveTab('elections');
  };

  const handleAuthSuccess = (
    authenticatedUser?: UserProfile,
    newMembership?: UserOrganizationMembership,
    organizations?: UserOrganizationMembership[]
  ) => {
    if (authenticatedUser) {
      setCurrentUser(authenticatedUser);
      try {
        localStorage.setItem('votexa_user', JSON.stringify(authenticatedUser));
      } catch {}
    }

    const orgsToSet =
      organizations && organizations.length > 0
        ? organizations
        : newMembership
        ? [newMembership]
        : [];

    if (orgsToSet.length > 0) {
      setMemberships(orgsToSet);
      try {
        localStorage.setItem('votexa_memberships', JSON.stringify(orgsToSet));
      } catch {}

      const activeOrg = newMembership || orgsToSet[0];
      if (activeOrg && activeOrg.organization) {
        setActiveOrgId(activeOrg.organization.id);
        apiClient.setTenant(activeOrg.organization.id);
        try {
          localStorage.setItem('votexa_active_org_id', activeOrg.organization.id);
        } catch {}
      }
    }

    const activeToken = apiClient.getAuthToken();
    if (activeToken) {
      try {
        localStorage.setItem('votexa_auth_token', activeToken);
      } catch {}
    }

    setActiveTab('overview');
    setViewMode('app');
  };

  const handleSignOut = () => {
    supabase.auth.signOut().catch(() => {});
    apiClient.setAuthToken('');
    try {
      localStorage.removeItem('votexa_user');
      localStorage.removeItem('votexa_auth_token');
      localStorage.removeItem('votexa_memberships');
      localStorage.removeItem('votexa_active_org_id');
    } catch {}
    setViewMode('landing');
  };

  // Restore stored session token on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('votexa_auth_token');
      if (storedToken) {
        apiClient.setAuthToken(storedToken);
      }
    } catch {}
  }, []);

  useEffect(() => {
    apiClient.setTenant(activeOrgId);
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServerStatus('System Online');
          refreshWallet();
        } else {
          setServerStatus('Offline');
        }
      })
      .catch(() => {
        setServerStatus('System Online');
      });
  }, [activeOrgId]);

  // =========================================================================
  // VIEW MODE 1: PUBLIC LANDING PAGE
  // =========================================================================
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onNavigateToAuth={(mode) => {
          setAuthInitialMode(mode);
          setAuthTargetRole('organizer');
          setViewMode('auth');
        }}
        onLaunchApp={(targetTab) => {
          if (targetTab) setActiveTab(targetTab as any);
          setViewMode('app');
        }}
        onCastBallot={() => {
          setActiveTab('voting');
          setViewMode('app');
        }}
      />
    );
  }

  // =========================================================================
  // VIEW MODE 2: DEDICATED AUTHENTICATION SCREEN
  // =========================================================================
  if (viewMode === 'auth') {
    return (
      <AuthPage
        initialMode={authInitialMode}
        targetRole={authTargetRole}
        onAuthSuccess={handleAuthSuccess}
        onBackToHome={() => setViewMode('landing')}
      />
    );
  }

  // =========================================================================
  // VIEW MODE 3: WORKSPACE APPLICATION WITH RESPONSIVE SIDEBAR
  // =========================================================================
  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentUser={currentUser}
      memberships={memberships}
      activeOrgId={activeOrgId}
      onSwitchOrg={handleSwitchOrg}
      onOpenOnboarding={() => setActiveTab('onboarding')}
      onNavigateHome={() => setViewMode('landing')}
      onSignOut={handleSignOut}
      serverStatus={serverStatus}
      walletBalanceCents={wallet.availableBalance}
    >
        {/* Workspace Dashboard Overview */}
        {activeTab === 'overview' && (
          <WorkspaceDashboardOverview
            organization={activeOrg}
            userRole={activeRole}
            currentUser={currentUser}
            walletBalanceCents={wallet.availableBalance}
            onNavigateTab={(t) => setActiveTab(t as any)}
            onOpenCreateElection={() => {
              setActiveTab('elections');
              setShowElectionWizard(true);
            }}
          />
        )}

      {/* Onboarding Screen */}
      {activeTab === 'onboarding' && (
        <OrganizationOnboarding
          onCreated={handleOnboarded}
          onCancel={() => setActiveTab('elections')}
        />
      )}

      {/* Voting Ballot Interface */}
      {activeTab === 'voting' && (
        <div className="space-y-6">
          <VotingInterface
            electionId={sampleElection.id}
            electionTitle={sampleElection.title}
          />
        </div>
      )}

      {/* Elections Management */}
      {activeTab === 'elections' && (
        showElectionWizard ? (
          <ElectionWizard
            onCreated={(newElec) => {
              setShowElectionWizard(false);
              setSelectedElectionId(newElec.id);
            }}
            onCancel={() => setShowElectionWizard(false)}
          />
        ) : selectedElectionId ? (
          <ElectionDetails
            electionId={selectedElectionId}
            userRole={activeRole}
            onBack={() => setSelectedElectionId(null)}
          />
        ) : (
          <ElectionDashboard
            organizationName={activeOrg.name}
            userRole={activeRole}
            onSelectElection={(elec) => setSelectedElectionId(elec.id)}
            onOpenWizard={() => setShowElectionWizard(true)}
          />
        )
      )}

      {/* Candidates Management */}
      {activeTab === 'candidates' && (
        <CandidateManagement
          electionId={selectedElectionId || 'elec-inst-1'}
          isReadOnly={activeRole === OrganizationRole.STAFF}
        />
      )}

      {/* Voter Register */}
      {activeTab === 'voters' && (
        <VoterManagement
          electionId={selectedElectionId || 'elec-inst-1'}
          isReadOnly={activeRole === OrganizationRole.STAFF}
        />
      )}

      {/* Members & Roles */}
      {activeTab === 'members' && (
        <MemberManagement
          organizationId={activeOrg.id}
          userRole={activeRole}
        />
      )}

      {/* Workspace Settings */}
      {activeTab === 'settings' && (
        <OrgSettingsScreen
          organization={activeOrg}
          userRole={activeRole}
          onUpdated={(updatedOrg) => {
            setMemberships(
              memberships.map((m) =>
                m.organization.id === updatedOrg.id ? { ...m, organization: updatedOrg } : m
              )
            );
          }}
        />
      )}

      {/* Treasury & Finance */}
      {activeTab === 'finance' && (
        <div className="space-y-8">
          <OrganizerRevenueDashboard organizationId={activeOrg.id} />

          <div className="border-t border-border pt-6">
            <PayoutsSection
              organizationId={activeOrg.id}
              availableBalanceCents={wallet.availableBalance}
              onBalanceUpdated={refreshWallet}
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-bold mb-4 text-foreground">Organization Subscription Plans</h3>
            <PricingPackages onPaymentCompleted={refreshWallet} />
          </div>
        </div>
      )}

      {/* User Profile */}
      {activeTab === 'profile' && (
        <UserProfileScreen
          user={currentUser}
          memberships={memberships}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Super Administration */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <AdministrationPanel currentAdminUserId={currentUser.id} />
        </div>
      )}
    </AppLayout>
  );
}

export default App;
