import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  Sparkles,
  Trophy,
  CreditCard
} from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ThemeToggle } from '../../lib/theme';
import { SystemRole, PlatformRole, UserProfile } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  targetRole?: 'organizer' | 'voter';
  onAuthSuccess: (userProfile?: UserProfile, membership?: any) => void;
  onBackToHome: () => void;
}

export function AuthPage({
  initialMode = 'login',
  targetRole = 'organizer',
  onAuthSuccess,
  onBackToHome
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Quick Demo Simulator Handlers
  const handleSimulateRole = (roleType: 'super_admin' | 'owner' | 'support' | 'voter') => {
    let mockUser: UserProfile;

    if (roleType === 'super_admin') {
      mockUser = {
        id: 'usr-qa-super-admin',
        email: 'superadmin@votexa.io',
        fullName: 'Dr. Sarah Connor (Super Admin)',
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (roleType === 'owner') {
      mockUser = {
        id: 'usr-demo-owner',
        email: 'user@university.edu',
        fullName: 'David Ochieng (Event Organiser)',
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else if (roleType === 'support') {
      mockUser = {
        id: 'usr-qa-support-admin',
        email: 'support@votexa.io',
        fullName: 'Elena Rostova (Support Admin)',
        systemRole: SystemRole.USER,
        platformRoles: [PlatformRole.SUPPORT_ADMIN],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      mockUser = {
        id: 'vtr-1',
        email: 'voter@votexa.io',
        fullName: 'Amara Diallo (Voter)',
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    apiClient.setAuthToken(`mock-token-${mockUser.id}`);
    onAuthSuccess(mockUser);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-white transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="h-16 px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Logo with 3-bar chart icon from inspo */}
          <div className="flex items-end gap-1 h-7 w-7 rounded-lg bg-slate-900 dark:bg-blue-600 p-1.5 justify-center">
            <span className="w-1 h-2.5 bg-amber-400 rounded-sm" />
            <span className="w-1 h-4 bg-amber-500 rounded-sm" />
            <span className="w-1 h-3 bg-amber-300 rounded-sm" />
          </div>
          <span className="font-black text-lg text-foreground tracking-tight">VOTEXA</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block font-medium">
            🔒 Bank-Grade 256-Bit SSL
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 container mx-auto px-4 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
          {/* Left Column: Visual Branding & Inspo Proposition */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border text-white">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Africa's #1 Voting Platform
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Trusted by Over 10,000+ Organisers Across Africa
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                  Powering awards ceremonies, beauty pageants, university elections, and national media campaigns with transparent live tallying.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>Instant Voter Checkout:</strong> Frictionless credit purchases and real-time revenue disbursement to your account.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>Multi-Channel Voting:</strong> Seamless participation across Web, SMS, USSD, and WhatsApp bots.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>Real-Time Leaderboards:</strong> Verified tamper-evident tallying with instant percentage calculations.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Simulator Banner */}
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5" /> 1-Click Sandbox Test Access
              </div>
              <p className="text-[11px] text-slate-400">
                Explore pre-configured voting environments instantly:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSimulateRole('owner')}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-amber-600/20 hover:border-amber-500/40 text-left text-slate-200 transition-all font-semibold"
                >
                  🎪 Event Organiser
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('voter')}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-emerald-600/20 hover:border-emerald-500/40 text-left text-slate-200 transition-all font-semibold"
                >
                  🗳️ Live Voter
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('super_admin')}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-blue-600/20 hover:border-blue-500/40 text-left text-slate-200 transition-all font-semibold"
                >
                  👑 Platform Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('support')}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-purple-600/20 hover:border-purple-500/40 text-left text-slate-200 transition-all font-semibold"
                >
                  🛡️ Support Staff
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-card text-card-foreground">
            {/* Mode Switcher Buttons */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Organiser Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Host Your Event (Sign Up)
                </button>
              </div>
            </div>

            {/* Active Form */}
            {mode === 'login' && (
              <LoginForm
                onLoginSuccess={() => onAuthSuccess()}
                onSwitchToRegister={() => setMode('register')}
                onSwitchToForgot={() => setMode('forgot')}
              />
            )}

            {mode === 'register' && (
              <RegisterForm
                initialRole={targetRole}
                onRegisterSuccess={(user, membership) => onAuthSuccess(user, membership)}
                onSwitchToLogin={() => setMode('login')}
              />
            )}

            {mode === 'forgot' && (
              <ForgotPasswordForm
                onBackToLogin={() => setMode('login')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <footer className="h-12 border-t border-border px-4 text-center text-[11px] text-muted-foreground flex items-center justify-center bg-card/40">
        © 2026 Votexa • Africa's Most Trusted Digital Voting Infrastructure • Instant Organizer Payouts
      </footer>
    </div>
  );
}
