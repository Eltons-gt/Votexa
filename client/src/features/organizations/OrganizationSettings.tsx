import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Settings, CheckCircle2, AlertCircle, AlertTriangle, Trash2, Building2, User, Shield } from 'lucide-react';
import { Organization, UserProfile } from '@votexa/shared';
import { apiClient } from '../../lib/api';
import { DeleteAccountModal } from '../../components/modals/DeleteAccountModal';

export interface OrganizationSettingsProps {
  organization: Organization;
  userRole: string;
  currentUser?: UserProfile;
  onUpdated?: (org: Organization) => void;
  onAccountDeleted?: () => void;
}

export function OrganizationSettings({
  organization,
  userRole,
  currentUser,
  onUpdated,
  onAccountDeleted
}: OrganizationSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'account'>('workspace');
  const [name, setName] = useState(organization.name);
  const [timezone, setTimezone] = useState(organization.settings?.timezone || 'UTC');
  const [contactEmail, setContactEmail] = useState(organization.settings?.contactEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setSuccessMsg(false);
    setErrorMsg(null);

    try {
      const res = await apiClient.patch<Organization>(`/organizations/${organization.id}/settings`, {
        name,
        settings: {
          timezone,
          contactEmail
        }
      });

      if (res.success && res.data) {
        setSuccessMsg(true);
        if (onUpdated) onUpdated(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Failed to update settings');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveSubTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'workspace'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Workspace Settings
        </button>
        <button
          onClick={() => setActiveSubTab('account')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'account'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <User className="h-4 w-4" />
          Account & Security
        </button>
      </div>

      {/* TAB 1: WORKSPACE SETTINGS */}
      {activeSubTab === 'workspace' && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Workspace Settings
              </CardTitle>
              <Badge variant={canEdit ? 'default' : 'secondary'}>
                Your Role: {userRole}
              </Badge>
            </div>
            <CardDescription>
              Configure institutional preferences and voting timezone for {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canEdit && (
              <div className="p-3 bg-muted border rounded-md text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Read-only: Modifying workspace settings requires Owner or Admin permissions.</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-md text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Workspace settings updated successfully!
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Workspace Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Unique Slug</label>
              <Input
                value={organization.slug}
                disabled
                className="bg-muted font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Default Timezone</label>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Administrative Contact Email</label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={!canEdit}
                  placeholder="elections@domain.edu"
                />
              </div>
            </div>
          </CardContent>
          {canEdit && (
            <CardFooter className="flex justify-end border-t pt-4">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* TAB 2: ACCOUNT & SECURITY */}
      {activeSubTab === 'account' && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Personal Account & Security
            </CardTitle>
            <CardDescription>
              Your personal login credentials, identity details, and account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
                <Input
                  value={currentUser?.fullName || ''}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Email Address</label>
                <Input
                  value={currentUser?.email || ''}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/40 border rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground">Authentication Session</div>
                <div className="text-muted-foreground text-[11px]">Protected with enterprise-grade multi-layer security</div>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                Active Session
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DANGER ZONE (Present in Settings) */}
      <Card className="shadow-sm border-destructive/30 bg-destructive/5 overflow-hidden">
        <CardHeader className="border-b border-destructive/20 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive text-lg font-bold">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Destructive actions for your Votexa personal account and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-card">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                Delete Account
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg">
                Permanently delete your Votexa personal account, credentials, and organization memberships. Once deleted, your account cannot be recovered.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          userEmail={currentUser?.email}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            if (onAccountDeleted) {
              onAccountDeleted();
            }
          }}
        />
      )}
    </div>
  );
}
