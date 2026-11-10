import { useState, useEffect } from 'react';
import {
  Shield,
  Vote,
  Users,
  DollarSign,
  Settings,
  Lock,
  User as UserIcon,
  UserCheck
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  UserProfileScreen
} from './features/authentication';
import {
  OrganizationSelector,
  OrganizationOnboarding,
  OrganizationSettings as OrgSettingsScreen,
  MemberManagement
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
import { WalletCard } from './features/wallets';
import { RevenueOverview } from './features/revenue';
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
  OrganizationRole,
  PlatformRole
} from '@votexa/shared';
import { apiClient } from './lib/api';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'voting' | 'elections' | 'candidates' | 'voters' | 'members' | 'settings' | 'finance' | 'admin' | 'profile' | 'auth' | 'onboarding'
  >('voting');

  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [serverStatus, setServerStatus] = useState<string>('Connecting...');

  // Election Navigation State
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [showElectionWizard, setShowElectionWizard] = useState<boolean>(false);

  // Active User State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-demo-owner',
    email: 'user@university.edu',
    fullName: 'Dean Alexander Vance',
    systemRole: SystemRole.USER,
    platformRoles: [PlatformRole.SUPPORT_ADMIN],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // User's Authorized Organization Workspaces
  const [memberships, setMemberships] = useState<UserOrganizationMembership[]>([
    {
      organization: {
        id: 'org-metro-uni',
        name: 'Metropolitan University',
        slug: 'metropolitan-uni',
        planId: 'ENTERPRISE',
        settings: { timezone: 'America/New_York', contactEmail: 'elections@metro.edu' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      role: OrganizationRole.OWNER
    },
    {
      organization: {
        id: 'org-starlight-col',
        name: 'Starlight Medical College',
        slug: 'starlight-college',
        planId: 'STANDARD',
        settings: { timezone: 'America/Chicago', contactEmail: 'admin@starlight.edu' },
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z'
      },
      role: OrganizationRole.ADMIN
    }
  ]);

  const [activeOrgId, setActiveOrgId] = useState<string>('org-metro-uni');

  const defaultFallback: UserOrganizationMembership = {
    organization: {
      id: 'org-metro-uni',
      name: 'Metropolitan University',
      slug: 'metropolitan-uni',
      planId: 'ENTERPRISE',
      settings: { timezone: 'America/New_York', contactEmail: 'elections@metro.edu' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    role: OrganizationRole.OWNER
  };

  const activeMembership =
    memberships.find((m) => m.organization.id === activeOrgId) ||
    memberships[0] ||
    defaultFallback;
  const activeOrg = activeMembership.organization;
  const activeRole = activeMembership.role;

  // Active Election Sample
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

  useEffect(() => {
    apiClient.setTenant(activeOrgId);
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServerStatus('Engine Active (Port 5000)');
          refreshWallet();
        } else {
          setServerStatus('Backend Error');
        }
      })
      .catch(() => {
        setServerStatus('Frontend Active');
      });
  }, [activeOrgId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card/70 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">VOTEXA</span>
              <span className="hidden sm:inline-block text-[11px] text-muted-foreground ml-2 font-mono">
                Multi-Tenant SaaS
              </span>
            </div>
          </div>

          {/* Central Workspace Selector */}
          <div className="flex items-center gap-2">
            <OrganizationSelector
              currentOrgId={activeOrgId}
              memberships={memberships}
              onSelectOrg={handleSwitchOrg}
              onOpenOnboarding={() => setActiveTab('onboarding')}
            />
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="success" className="text-[11px] hidden lg:inline-flex">
              {serverStatus}
            </Badge>

            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 border px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/40 transition-colors"
              title="User Profile"
            >
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
              </div>
              <span className="hidden md:inline font-medium truncate max-w-[100px]">
                {currentUser.fullName}
              </span>
            </button>

            <Button
              size="sm"
              variant={activeTab === 'auth' ? 'default' : 'outline'}
              onClick={() => {
                setAuthView('login');
                setActiveTab('auth');
              }}
              className="gap-1.5 text-xs h-8"
            >
              <Lock className="h-3.5 w-3.5" /> Sign In
            </Button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'voting', label: 'Cryptographic Ballot', icon: Shield },
            { id: 'elections', label: 'Elections', icon: Vote },
            { id: 'candidates', label: 'Candidates', icon: Users },
            { id: 'voters', label: 'Voters Register', icon: UserCheck },
            { id: 'members', label: 'Members & Roles', icon: Users },
            { id: 'settings', label: 'Workspace Settings', icon: Settings },
            { id: 'finance', label: 'Treasury & Ledger', icon: DollarSign },
            { id: 'profile', label: 'My Profile', icon: UserIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Onboarding Screen */}
        {activeTab === 'onboarding' && (
          <OrganizationOnboarding
            onCreated={handleOnboarded}
            onCancel={() => setActiveTab('elections')}
          />
        )}

        {/* Voting Tab */}
        {activeTab === 'voting' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Cryptographic Voting Engine</h2>
              <p className="text-sm text-muted-foreground">
                Cast an encrypted ballot in <b>{activeOrg.name}</b> with double-voting prevention and tamper-evident receipt verification.
              </p>
            </div>
            <VotingInterface
              electionId={sampleElection.id}
              electionTitle={sampleElection.title}
            />
          </div>
        )}

        {/* Active Elections Tab */}
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

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <CandidateManagement
            electionId={selectedElectionId || 'elec-inst-1'}
            isReadOnly={activeRole === OrganizationRole.STAFF}
          />
        )}

        {/* Voters Tab */}
        {activeTab === 'voters' && (
          <VoterManagement
            electionId={selectedElectionId || 'elec-inst-1'}
            isReadOnly={activeRole === OrganizationRole.STAFF}
          />
        )}

        {/* Members & Roles Tab */}
        {activeTab === 'members' && (
          <MemberManagement
            organizationId={activeOrg.id}
            userRole={activeRole}
          />
        )}

        {/* Workspace Settings Tab */}
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

        {/* Treasury & Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{activeOrg.name} Treasury Vault</h2>
              <p className="text-sm text-muted-foreground">Double-entry ledger accounting, revenue KPIs, and payout disbursements</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WalletCard wallet={wallet} />
              </div>
              <div className="lg:col-span-2">
                <RevenueOverview
                  totalRevenue={wallet.availableBalance + 109000}
                  votingFees={wallet.availableBalance}
                  payouts={109000}
                />
              </div>
            </div>

            <PayoutsSection />

            <div className="pt-6">
              <h3 className="text-lg font-bold mb-4">SaaS Tier Packages (Stripe Integration Active)</h3>
              <PricingPackages onPaymentCompleted={refreshWallet} />
            </div>
          </div>
        )}

        {/* User Profile Tab */}
        {activeTab === 'profile' && (
          <UserProfileScreen
            user={currentUser}
            memberships={memberships}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        )}

        {/* Administration Tab */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdministrationPanel />
          </div>
        )}

        {/* Authentication Modal / Tab */}
        {activeTab === 'auth' && (
          <div className="py-6">
            {authView === 'login' && (
              <LoginForm
                onLoginSuccess={() => setActiveTab('voting')}
                onSwitchToRegister={() => setAuthView('register')}
                onSwitchToForgot={() => setAuthView('forgot')}
              />
            )}
            {authView === 'register' && (
              <RegisterForm
                onRegisterSuccess={() => setActiveTab('voting')}
                onSwitchToLogin={() => setAuthView('login')}
              />
            )}
            {authView === 'forgot' && (
              <ForgotPasswordForm
                onBackToLogin={() => setAuthView('login')}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Votexa Multi-Tenant Voting SaaS Platform. PostgreSQL RLS & Supabase Auth Protected.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Security Architecture</span>
            <span className="hover:underline cursor-pointer">Multi-Tenant Isolation</span>
            <span className="hover:underline cursor-pointer">Audit Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
