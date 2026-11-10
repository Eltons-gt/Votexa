import { useState } from 'react';
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ThemeToggle } from '../../lib/theme';
import { SystemRole, PlatformRole, UserProfile } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onAuthSuccess: (userProfile?: UserProfile) => void;
  onBackToHome: () => void;
}

export function AuthPage({
  initialMode = 'login',
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
        fullName: 'Dean Alexander Vance (Org Owner)',
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
        email: 'alexander.vance@metro.edu',
        fullName: 'Alexander Vance (Eligible Voter)',
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base text-foreground tracking-tight">VOTEXA</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Supabase Auth Protected
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 container mx-auto px-4 py-8 lg:py-12 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
          {/* Left Column: Visual Branding & Value Proposition */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border text-white">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                <Lock className="h-3.5 w-3.5 text-blue-400" />
                Secure Authentication
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sign In to Your Voting Workspace
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Enterprise-grade privacy ensures that your organization's ballots, voter rosters, and financial records
                  remain strictly protected.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>Bank-Grade Encryption:</strong> Secure session validation and protected credential storage.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>Multi-Workspace Access:</strong> Manage multiple institutions or events with a single login.
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <div className="h-5 w-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong>M-Pesa Integration:</strong> Seamless mobile payments and instant automated payouts.
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Shortcuts Banner */}
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5" /> One-Click Role Simulator
              </div>
              <p className="text-[11px] text-slate-300">
                Instantly simulate pre-configured roles without typing credentials:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSimulateRole('super_admin')}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-blue-600/20 hover:border-blue-500/40 text-left text-slate-200 transition-all font-medium"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('owner')}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-left text-slate-200 transition-all font-medium"
                >
                  🏛️ Org Owner (Dean)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('support')}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-purple-600/20 hover:border-purple-500/40 text-left text-slate-200 transition-all font-medium"
                >
                  🛡️ Support Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateRole('voter')}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-emerald-600/20 hover:border-emerald-500/40 text-left text-slate-200 transition-all font-medium"
                >
                  🗳️ Eligible Voter
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
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create Account
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
                onRegisterSuccess={() => onAuthSuccess()}
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
        © 2026 Votexa • Protected by 256-bit Encryption & Secure Authentication
      </footer>
    </div>
  );
}
