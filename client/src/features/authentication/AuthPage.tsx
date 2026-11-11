import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ThemeToggle } from '../../lib/theme';
import {
  UserProfile,
  UserOrganizationMembership
} from '@votexa/shared';
import { VotexaLogo } from '../../components/brand/VotexaLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  targetRole?: 'organizer' | 'voter';
  onAuthSuccess: (
    userProfile?: UserProfile,
    membership?: UserOrganizationMembership,
    organizations?: UserOrganizationMembership[]
  ) => void;
  onBackToHome: () => void;
}

export function AuthPage({
  initialMode = 'login',
  onAuthSuccess,
  onBackToHome
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-white transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="h-16 px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Home</span>
        </button>

        <div className="cursor-pointer" onClick={onBackToHome}>
          <VotexaLogo size="md" />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Segmented Switcher (Sign In vs Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* Active Auth Card */}
          {mode === 'login' && (
            <LoginForm
              onLoginSuccess={(user, tenant, orgs) => onAuthSuccess(user, tenant, orgs)}
              onSwitchToRegister={() => setMode('register')}
              onSwitchToForgot={() => setMode('forgot')}
            />
          )}

          {mode === 'register' && (
            <RegisterForm
              onRegisterSuccess={(user, tenant, orgs) => onAuthSuccess(user, tenant, orgs)}
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

      {/* Clean Minimal Footer */}
      <footer className="h-12 border-t border-border px-4 text-center text-xs text-muted-foreground flex items-center justify-center bg-card/30">
        © 2026 Votexa • Enterprise Digital Voting Infrastructure
      </footer>
    </div>
  );
}
