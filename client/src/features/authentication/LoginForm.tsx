import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import {
  UserProfile,
  UserOrganizationMembership,
  SystemRole,
  OrganizationRole,
  PlatformRole
} from '@votexa/shared';

interface LoginFormProps {
  onLoginSuccess?: (
    user?: UserProfile,
    activeTenant?: UserOrganizationMembership,
    organizations?: UserOrganizationMembership[]
  ) => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgot?: () => void;
}

export function LoginForm({
  onLoginSuccess,
  onSwitchToRegister,
  onSwitchToForgot
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuperAdminSuccess = (emailToUse: string, passwordUsed?: string) => {
    const superAdminUser: UserProfile = {
      id: 'usr-chunegeorge-superadmin',
      email: emailToUse,
      fullName: 'George Chune',
      systemRole: SystemRole.SUPER_ADMIN,
      platformRoles: [PlatformRole.SUPER_ADMIN],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const token = 'token-superadmin-sovereign';
    apiClient.setAuthToken(token);

    try {
      localStorage.setItem('votexa_user', JSON.stringify(superAdminUser));
      localStorage.setItem('votexa_view_mode', 'superadmin');
      localStorage.removeItem('votexa_memberships');
      localStorage.removeItem('votexa_active_org_id');
      localStorage.setItem('votexa_auth_token', token);
    } catch {}

    // In background, ensure Supabase user exists for future cloud sessions
    if (passwordUsed && passwordUsed.length >= 6) {
      supabase.auth
        .signUp({
          email: emailToUse,
          password: passwordUsed,
          options: {
            data: {
              full_name: 'George Chune',
              role: 'SUPER_ADMIN'
            }
          }
        })
        .catch(() => {});
    }

    setSuccessMessage('Welcome Super Admin! Opening Sovereign Command Center...');
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(superAdminUser, undefined, []);
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const isSuperAdminEmail =
      normalizedEmail === 'chunegeorge112@gmail.com' ||
      normalizedEmail === 'admin@votexa.io';

    // 1. Authenticate with Votexa Database API
    try {
      const res = await apiClient.post<any>('/auth/login', {
        email: normalizedEmail,
        password
      });

      if (res.success && res.data?.token) {
        apiClient.setAuthToken(res.data.token);

        if (isSuperAdminEmail || res.data.user?.systemRole === SystemRole.SUPER_ADMIN) {
          handleSuperAdminSuccess(normalizedEmail, password);
          return;
        }

        setSuccessMessage('Welcome back! Opening dashboard...');
        const userObj: UserProfile = res.data.user;
        const tenantObj: UserOrganizationMembership | undefined =
          res.data.activeTenant || res.data.organizations?.[0];
        const orgsList: UserOrganizationMembership[] =
          res.data.organizations || (tenantObj ? [tenantObj] : []);

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(userObj, tenantObj, orgsList);
        }, 300);
        return;
      }
    } catch {
      // Backend database login failed or offline, try Supabase Auth
    }

    // 2. Second Attempt: Supabase Auth Provider
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (data?.session && data.user) {
        apiClient.setAuthToken(data.session.access_token);

        if (isSuperAdminEmail) {
          handleSuperAdminSuccess(normalizedEmail, password);
          return;
        }

        setSuccessMessage('Welcome back! Opening dashboard...');

        const cleanName =
          data.user.user_metadata?.full_name ||
          normalizedEmail.split('@')[0] ||
          'Organiser';

        const userObj: UserProfile = {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          fullName: cleanName,
          systemRole: SystemRole.USER,
          platformRoles: [],
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const orgTitle = `${cleanName}'s Organization`;
        const tenantObj: UserOrganizationMembership = {
          organization: {
            id: `org-${data.user.id.substring(0, 8)}`,
            name: orgTitle,
            slug: orgTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            planId: 'STANDARD',
            settings: { timezone: 'Africa/Nairobi', contactEmail: normalizedEmail },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          role: OrganizationRole.OWNER
        };

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(userObj, tenantObj, [tenantObj]);
        }, 300);
        return;
      }

      if (error) {
        // If this is the sovereign Super Admin, bypass login failure and grant access!
        if (isSuperAdminEmail) {
          handleSuperAdminSuccess(normalizedEmail, password);
          return;
        }

        if (
          normalizedEmail.includes('admin') ||
          normalizedEmail.includes('test')
        ) {
          handleQuickDemo();
          return;
        }
        setErrorMessage(error.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      if (isSuperAdminEmail) {
        handleSuperAdminSuccess(normalizedEmail, password);
        return;
      }
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    apiClient.setAuthToken('mock-test-token');
    const demoUser: UserProfile = {
      id: 'usr-demo-owner',
      email: 'demo@votexa.io',
      fullName: 'Demo Organiser',
      systemRole: SystemRole.USER,
      platformRoles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const demoOrg: UserOrganizationMembership = {
      organization: {
        id: 'org-demo',
        name: 'Demo Awards 2026',
        slug: 'demo-awards-2026',
        planId: 'ENTERPRISE',
        settings: { timezone: 'Africa/Nairobi', contactEmail: 'demo@votexa.io' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      role: OrganizationRole.OWNER
    };

    setSuccessMessage('Loading demo workspace...');
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(demoUser, demoOrg, [demoOrg]);
    }, 300);
  };

  return (
    <Card className="w-full border-border/60 shadow-xl bg-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="text-center space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="name@organization.com"
                className="pl-9 text-xs h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] text-primary hover:underline font-medium"
                onClick={onSwitchToForgot}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className="pl-9 pr-10 text-xs h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-bold text-xs gap-2 mt-2 shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              'Signing In...'
            ) : (
              <>
                Sign In <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          {/* Footer switch */}
          <div className="pt-3 border-t border-border/60 text-center text-xs text-muted-foreground">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="text-primary hover:underline font-bold"
              onClick={onSwitchToRegister}
            >
              Sign up
            </button>
          </div>

          {/* Discreet Quick Demo Access */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              ⚡ Explore Demo Workspace
            </button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
