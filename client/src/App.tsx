import { useState, useEffect } from 'react';
import { Shield, Building2, Vote, Users, DollarSign, Settings, Lock } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { LoginForm } from './features/authentication';
import { OrganizationOverview } from './features/organizations';
import { ElectionCard } from './features/elections';
import { CandidateCard } from './features/candidates';
import { VoterDirectory } from './features/voters';
import { VotingInterface } from './features/voting';
import { PricingPackages } from './features/payments';
import { WalletCard } from './features/wallets';
import { RevenueOverview } from './features/revenue';
import { PayoutsSection } from './features/payouts';
import { AdministrationPanel } from './features/administration';
import { Election, ElectionStatus, Wallet } from '@votexa/shared';
import { apiClient } from './lib/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'elections' | 'candidates' | 'voters' | 'voting' | 'finance' | 'admin' | 'auth'>('voting');
  const [serverStatus, setServerStatus] = useState<string>('Connecting...');

  const organization = {
    id: 'org-demo-1',
    name: 'Metropolitan University',
    slug: 'metropolitan-uni',
    planId: 'ENTERPRISE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleElection: Election = {
    id: 'elec-1',
    organizationId: organization.id,
    title: '2026 Student Union Executive Board Election',
    description: 'Annual election electing student representatives, president, and executive council.',
    status: ElectionStatus.ACTIVE,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    timezone: 'UTC',
    allowSelfRegistration: true,
    isPaidVoting: false,
    createdById: 'usr-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleCandidates = [
    {
      id: 'cand-1',
      electionId: sampleElection.id,
      organizationId: organization.id,
      name: 'Jordan Hayes',
      bio: 'Advocating for campus sustainability, open governance and mental health resources.',
      ballotOrder: 1
    },
    {
      id: 'cand-2',
      electionId: sampleElection.id,
      organizationId: organization.id,
      name: 'Morgan Chen',
      bio: 'Campaigning for academic resource equality and streamlined university services.',
      ballotOrder: 2
    }
  ];

  const sampleVoters = [
    {
      id: 'vtr-1',
      organizationId: organization.id,
      electionId: sampleElection.id,
      voterCode: 'VTR-9981-METRO',
      email: 'student.hayes@metro.edu',
      hasVoted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'vtr-2',
      organizationId: organization.id,
      electionId: sampleElection.id,
      voterCode: 'VTR-9982-METRO',
      email: 'chen.m@metro.edu',
      hasVoted: false,
      createdAt: new Date().toISOString()
    }
  ];

  const [wallet, setWallet] = useState<Wallet>({
    id: 'wal-1',
    organizationId: organization.id,
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

  useEffect(() => {
    apiClient.setTenant(organization.id);
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
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">VOTEXA</span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground ml-2 font-mono">
                v2.0-engine-active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 border px-2.5 py-1 rounded-md text-xs bg-muted/30">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{organization.name}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0">Tenant</Badge>
            </div>

            <Badge variant="success" className="text-xs">
              {serverStatus}
            </Badge>

            <Button
              size="sm"
              variant={activeTab === 'auth' ? 'default' : 'outline'}
              onClick={() => setActiveTab('auth')}
              className="gap-1.5"
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
            { id: 'voters', label: 'Voters Directory', icon: Users },
            { id: 'finance', label: 'Treasury & Ledger', icon: DollarSign },
            { id: 'admin', label: 'Administration', icon: Settings }
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
        <OrganizationOverview organization={organization} />

        {activeTab === 'voting' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Cryptographic Voting Engine</h2>
              <p className="text-sm text-muted-foreground">
                Cast an encrypted ballot with double-voting prevention and tamper-evident receipt verification.
              </p>
            </div>
            <VotingInterface
              electionId={sampleElection.id}
              electionTitle={sampleElection.title}
            />
          </div>
        )}

        {activeTab === 'elections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Active Elections</h2>
                <p className="text-sm text-muted-foreground">Manage ongoing and scheduled voting processes</p>
              </div>
              <Button size="sm">+ Create Election</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ElectionCard election={sampleElection} />
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Election Candidates</h2>
                <p className="text-sm text-muted-foreground">Candidate rosters registered for the active ballot</p>
              </div>
              <Button size="sm">+ Register Candidate</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleCandidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'voters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Voter Verification Register</h2>
                <p className="text-sm text-muted-foreground">Multi-tenant voter credential registry</p>
              </div>
              <Button size="sm">+ Import Voters CSV</Button>
            </div>
            <VoterDirectory voters={sampleVoters} />
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Treasury Vault & Double-Entry Ledger</h2>
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

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdministrationPanel />
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="py-6">
            <LoginForm onLoginSuccess={() => setActiveTab('voting')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Votexa Multi-Tenant Voting SaaS Platform. Supabase Auth & PostgreSQL Connected.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Security Architecture</span>
            <span className="hover:underline cursor-pointer">Cryptographic Protocol</span>
            <span className="hover:underline cursor-pointer">Audit Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
