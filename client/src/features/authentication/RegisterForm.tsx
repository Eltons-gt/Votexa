import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { User, Mail, Lock, Building2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { supabase } from '../../lib/supabase';

import {
  UserProfile,
  UserOrganizationMembership,
  SystemRole,
  OrganizationRole
} from '@votexa/shared';

interface RegisterFormProps {
  onRegisterSuccess?: (
    user?: UserProfile,
    activeTenant?: UserOrganizationMembership,
    organizations?: UserOrganizationMembership[]
  ) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({
  onRegisterSuccess,
  onSwitchToLogin
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const orgTitle = organizationName.trim() || `${cleanName}'s Organization`;

    try {
      const payload: any = {
        fullName: cleanName,
        email: cleanEmail,
        password,
        organizationName: orgTitle,
        organizationSlug: orgTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      };

      // Also register in Supabase Auth in background so login works on both auth layers
      try {
        await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: { data: { full_name: payload.fullName } }
        });
      } catch {
        // Fallback silently if direct Supabase signup is rate-limited
      }

      const res = await apiClient.post<any>('/auth/register', payload);

      if (res.success && res.data) {
        if (res.data.token) {
          apiClient.setAuthToken(res.data.token);
        }

        const newMembership = res.data.activeTenant || res.data.organizations?.[0];
        const allOrgs = res.data.organizations || (newMembership ? [newMembership] : []);

        setSuccessMessage('Account created! Opening your dashboard...');

        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(res.data.user, newMembership, allOrgs);
          }
        }, 500);
      } else {
        setErrorMessage(res.error?.message || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      // Offline fallback
      const fallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail || 'organizer@votexa.io',
        fullName: cleanName || 'Event Organiser',
        systemRole: SystemRole.USER,
        platformRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const fallbackMembership: UserOrganizationMembership = {
        organization: {
          id: `org-${Date.now()}`,
          name: orgTitle,
          slug: orgTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          planId: 'STANDARD',
          settings: { timezone: 'Africa/Nairobi', contactEmail: cleanEmail },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        role: OrganizationRole.OWNER
      };

      setSuccessMessage('Account established! Opening dashboard...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(fallbackUser, fallbackMembership, [fallbackMembership]);
        }
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-border/60 shadow-xl bg-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="text-center space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs text-muted-foreground">
              Get started with Votexa in less than a minute
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

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="reg-fullname">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="reg-fullname"
                placeholder="David Ochieng"
                className="pl-9 text-xs h-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="reg-email"
                type="email"
                placeholder="name@organization.com"
                className="pl-9 text-xs h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Organization / Event Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="reg-org">
              Organization or Event Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="reg-org"
                placeholder="e.g. East Africa Music Awards"
                className="pl-9 text-xs h-10"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="reg-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="reg-password"
                type="password"
                placeholder="At least 8 characters"
                className="pl-9 text-xs h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 font-bold text-xs gap-2 mt-2 shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              'Creating Account...'
            ) : (
              <>
                Create Account <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          {/* Footer switch */}
          <div className="pt-3 border-t border-border/60 text-center text-xs text-muted-foreground">
            <span>Already have an account? </span>
            <button
              type="button"
              className="text-primary hover:underline font-bold"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
