import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { Organization } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function OrganizationSettings({
  organization,
  userRole,
  onUpdated
}: {
  organization: Organization;
  userRole: string;
  onUpdated?: (org: Organization) => void;
}) {
  const [name, setName] = useState(organization.name);
  const [timezone, setTimezone] = useState(organization.settings?.timezone || 'UTC');
  const [contactEmail, setContactEmail] = useState(organization.settings?.contactEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <Card className="max-w-2xl mx-auto shadow-sm">
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
        <CardFooter className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

