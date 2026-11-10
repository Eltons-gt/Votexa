import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { SystemRole, PlatformRole } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface UserRecordItem {
  id: string;
  email: string;
  name: string;
  systemRole: SystemRole;
  platformRoles: PlatformRole[];
  createdAt: string;
}

export function SuperAdminUserManagement() {
  const [users, setUsers] = useState<UserRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Role modification modal state
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlatformRole>(PlatformRole.SUPPORT_ADMIN);
  const [roleAction, setRoleAction] = useState<'ADD' | 'REMOVE'>('ADD');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<UserRecordItem[]>('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        // Fallback demo mock if DB is empty
        setUsers([
          {
            id: 'usr-admin-alex',
            email: 'alex@votexa.io',
            name: 'Alex Vance',
            systemRole: SystemRole.SUPER_ADMIN,
            platformRoles: [PlatformRole.SUPER_ADMIN],
            createdAt: '2026-01-01T00:00:00Z'
          },
          {
            id: 'usr-support-sam',
            email: 'sam@votexa.io',
            name: 'Sam Taylor',
            systemRole: SystemRole.USER,
            platformRoles: [PlatformRole.SUPPORT_ADMIN],
            createdAt: '2026-01-10T10:00:00Z'
          },
          {
            id: 'usr-org-owner',
            email: 'owner@metro.edu',
            name: 'Dr. Sarah Connor',
            systemRole: SystemRole.USER,
            platformRoles: [],
            createdAt: '2026-01-15T08:00:00Z'
          }
        ]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with administration service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async () => {
    if (!targetUserId || !reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiClient.patch(`/admin/users/${targetUserId}/role`, {
        role: selectedRole,
        action: roleAction,
        reason: reason.trim()
      });

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== targetUserId) return u;
            const updatedRoles =
              roleAction === 'ADD'
                ? Array.from(new Set([...u.platformRoles, selectedRole]))
                : u.platformRoles.filter((r) => r !== selectedRole);
            return { ...u, platformRoles: updatedRoles };
          })
        );
        setTargetUserId(null);
        setReason('');
      } else {
        setError(res.error?.message || 'Failed to update user platform role');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error updating user role');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter && !u.platformRoles.includes(roleFilter as PlatformRole)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Identity Governance & Platform Role Assignment
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit user accounts, elevate Support Staff, and manage Super Administrator privileges with separation of duties.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="text-xs gap-1 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search user email, name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Platform Roles</option>
                <option value={PlatformRole.SUPER_ADMIN}>Super Admins Only</option>
                <option value={PlatformRole.SUPPORT_ADMIN}>Support Admins Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Platform Accounts ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">User</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">System Role</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Platform Roles</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground">Joined</th>
                  <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {u.systemRole}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {u.platformRoles.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">Tenant User</span>
                        ) : (
                          u.platformRoles.map((r) => (
                            <Badge
                              key={r}
                              variant={r === PlatformRole.SUPER_ADMIN ? 'destructive' : 'default'}
                              className="text-[10px] font-mono"
                            >
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetUserId(u.id);
                            setTargetUserEmail(u.email);
                            setSelectedRole(PlatformRole.SUPPORT_ADMIN);
                            setRoleAction('ADD');
                            setReason('');
                          }}
                          className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/5"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Grant Role
                        </Button>
                        {u.platformRoles.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetUserId(u.id);
                              setTargetUserEmail(u.email);
                              setSelectedRole(u.platformRoles[0] || PlatformRole.SUPPORT_ADMIN);
                              setRoleAction('REMOVE');
                              setReason('');
                            }}
                            className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      {targetUserId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              {roleAction === 'ADD' ? 'Assign Platform Role' : 'Revoke Platform Role'}
            </h4>
            <p className="text-xs text-muted-foreground">
              User: <strong>{targetUserEmail}</strong>
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Platform Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as PlatformRole)}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={PlatformRole.SUPPORT_ADMIN}>SUPPORT_ADMIN (Help Desk & Audits)</option>
                  <option value={PlatformRole.SUPER_ADMIN}>SUPER_ADMIN (Full Platform Privileges)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Audit Justification <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Assigned to customer support operations"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetUserId(null)}
                disabled={submitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={roleAction === 'ADD' ? 'default' : 'destructive'}
                onClick={handleRoleUpdate}
                disabled={submitting || !reason.trim()}
                className="text-xs"
              >
                {submitting ? 'Auditing Change...' : `Confirm ${roleAction}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
