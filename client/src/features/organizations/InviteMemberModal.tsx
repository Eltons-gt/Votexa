import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Mail, UserPlus, CheckCircle2, AlertCircle, X, Copy } from 'lucide-react';
import { OrganizationRole, OrganizationInvitation } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function InviteMemberModal({
  onClose,
  onInviteSent
}: {
  onClose: () => void;
  onInviteSent?: (inv: OrganizationInvitation) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>(OrganizationRole.STAFF);
  const [isSending, setIsSending] = useState(false);
  const [invitation, setInvitation] = useState<OrganizationInvitation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post<OrganizationInvitation>('/organization-members/invite', {
        email: email.trim().toLowerCase(),
        role
      });

      if (res.success && res.data) {
        setInvitation(res.data);
        if (onInviteSent) onInviteSent(res.data);
      } else {
        setErrorMessage(res.error?.message || 'Failed to send invitation');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending invitation');
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteLink = () => {
    if (!invitation) return;
    const link = `https://votexa.io/invitations/accept?token=${invitation.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Invite Workspace Member
            </CardTitle>
            <CardDescription className="text-xs">
              Grant staff or administrative permissions to colleagues
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        {invitation ? (
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Invitation Token Generated
              </div>
              <p>An invitation token for <b>{invitation.email}</b> ({invitation.role}) has been created:</p>
              <div className="p-2 bg-card rounded font-mono text-[11px] break-all border text-foreground">
                https://votexa.io/invitations/accept?token={invitation.token}
              </div>
            </div>

            <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={copyInviteLink}>
              <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied Invitation Link!' : 'Copy Invitation Link'}
            </Button>
            <Button size="sm" className="w-full text-xs" onClick={onClose}>
              Done
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              {errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="inv-email">
                  Colleague Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="inv-email"
                    type="email"
                    placeholder="sarah.jenkins@university.edu"
                    className="pl-9 text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Workspace Role Permission Level
                </label>
                <div className="space-y-2">
                  {[
                    { role: OrganizationRole.STAFF, title: 'Staff', desc: 'Can monitor elections and verify voters' },
                    { role: OrganizationRole.ADMIN, title: 'Admin', desc: 'Can create elections, manage candidates & invite staff' },
                    { role: OrganizationRole.OWNER, title: 'Owner', desc: 'Full workspace authority including billing & payouts' }
                  ].map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        role === r.role ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="member-role"
                        value={r.role}
                        checked={role === r.role}
                        onChange={() => setRole(r.role)}
                        className="mt-0.5 text-primary"
                      />
                      <div>
                        <div className="text-xs font-bold text-foreground">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSending || !email.trim()}>
                {isSending ? 'Sending...' : 'Issue Invitation'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

