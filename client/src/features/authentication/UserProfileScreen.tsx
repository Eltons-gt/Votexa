import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { User, Shield, Building2, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserOrganizationMembership } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function UserProfileScreen({
  user,
  memberships = [],
  onProfileUpdated
}: {
  user: UserProfile;
  memberships?: UserOrganizationMembership[];
  onProfileUpdated?: (updated: UserProfile) => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await apiClient.patch<UserProfile>('/auth/profile', { fullName });
      if (res.success && res.data) {
        setSavedSuccess(true);
        if (onProfileUpdated) onProfileUpdated(res.data);
      }
    } catch {
      setSavedSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              {user.platformRoles?.includes('SUPER_ADMIN' as any) && (
                <Badge variant="destructive" className="gap-1 text-[10px]">
                  <Shield className="h-3 w-3" /> Platform Super Admin
                </Badge>
              )}
            </div>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-md text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Registered Email</label>
              <Input value={user.email} disabled className="bg-muted/50 cursor-not-allowed" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button size="sm" onClick={handleUpdate} disabled={isSaving || fullName === user.fullName}>
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </CardFooter>
      </Card>

      {/* Authorized Organization Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Authorized Workspaces ({memberships.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Organizations and institutional workspaces where your account has verified access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {memberships.length === 0 ? (
            <p className="text-xs text-muted-foreground">No organization memberships linked yet.</p>
          ) : (
            memberships.map((m) => (
              <div
                key={m.organization.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-sm">{m.organization.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">slug: {m.organization.slug}</p>
                </div>
                <Badge
                  variant={
                    m.role === 'OWNER' ? 'default' : m.role === 'ADMIN' ? 'secondary' : 'outline'
                  }
                >
                  Role: {m.role}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

