import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, UserPlus, Trash2, Shield, AlertCircle } from 'lucide-react';
import { OrganizationMember, OrganizationRole } from '@votexa/shared';
import { InviteMemberModal } from './InviteMemberModal';
import { apiClient } from '../../lib/api';

export function MemberManagement({
  organizationId,
  userRole
}: {
  organizationId: string;
  userRole: string;
}) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canManageMembers = userRole === 'OWNER' || userRole === 'ADMIN';
  const isOwner = userRole === 'OWNER';

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<OrganizationMember[]>('/organization-members');
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const handleRoleChange = async (targetUserId: string, newRole: OrganizationRole) => {
    if (!isOwner) return;
    try {
      const res = await apiClient.patch<OrganizationMember>(`/organization-members/${targetUserId}/role`, {
        role: newRole
      });
      if (res.success) {
        loadMembers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleRemove = async (targetUserId: string) => {
    if (!canManageMembers) return;
    if (!confirm('Are you sure you want to remove this member from the workspace?')) return;

    try {
      const res = await apiClient.delete(`/organization-members/${targetUserId}`);
      if (res.success) {
        loadMembers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Workspace Members & Roles
            </CardTitle>
            <CardDescription className="text-xs">
              Manage team access, RBAC permissions, and administrative delegates
            </CardDescription>
          </div>
          {canManageMembers && (
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4" /> Invite Colleague
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {errorMsg}
            </div>
          )}

          <div className="divide-y rounded-lg border">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Loading members roster...</div>
            ) : members.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No members found.</div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {m.user?.fullName ? m.user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {m.user?.fullName || 'Colleague'}
                        {m.role === 'OWNER' && <Shield className="h-3.5 w-3.5 text-amber-500" />}
                      </h4>
                      <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isOwner ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value as OrganizationRole)}
                        className="text-xs border rounded-md px-2 py-1 bg-card text-foreground font-medium"
                      >
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    ) : (
                      <Badge variant={m.role === 'OWNER' ? 'default' : m.role === 'ADMIN' ? 'secondary' : 'outline'}>
                        {m.role}
                      </Badge>
                    )}

                    {canManageMembers && m.role !== 'OWNER' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(m.userId)}
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            loadMembers();
          }}
        />
      )}
    </div>
  );
}
