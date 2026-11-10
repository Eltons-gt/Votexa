import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react';
import { Election, ElectionCategory, VerifyVoterEligibilityResponse } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface EligibilityManagementProps {
  election: Election;
}

export function EligibilityManagement({ election }: EligibilityManagementProps) {
  const [testCode, setTestCode] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyVoterEligibilityResponse | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode && !testEmail) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await apiClient.post<VerifyVoterEligibilityResponse>('/voters/verify-eligibility', {
        electionId: election.id,
        voterCode: testCode.trim() || undefined,
        email: testEmail.trim() || undefined
      });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setResult({
        isEligible: false,
        reason: (err as Error).message || 'Eligibility verification check failed',
        remainingVotesAllowed: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Voter Eligibility & Verification Engine
        </h3>
        <p className="text-xs text-muted-foreground">
          Real-time backend eligibility simulator enforcing category rules, voting limits, and domain constraints.
        </p>
      </div>

      {/* Rules Currently Enforced Card */}
      <Card className="bg-muted/30 border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Enforced Rules for {election.title}</span>
            <Badge variant="outline" className="text-[10px]">
              {election.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {election.category === ElectionCategory.INSTITUTIONAL && (
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><b>Strictly One Voter, One Vote:</b> Double voting blocked at cryptographic ledger level.</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary shrink-0" />
                <span><b>No Paid Voting or Vote Purchases:</b> Additional voting credits completely forbidden.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span><b>Backend Official Roll Verification:</b> Voter code must exist on pre-approved registry.</span>
              </div>
              {election.settings?.allowedDomains?.length ? (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>
                    <b>Email Domain Lock:</b> Only addresses ending in {election.settings.allowedDomains.join(', ')} permitted.
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {election.category === ElectionCategory.PAID_COMPETITION && (
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary shrink-0" />
                <span><b>Paid Voting Enabled:</b> ${((election.settings?.votePriceCents ?? 100) / 100).toFixed(2)} per ballot entry.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <b>Configured Limit:</b> Max {election.settings?.maxVotesPerVoter ?? 50} votes per voter.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary shrink-0" />
                <span><b>Isolated Scoping:</b> Purchased credits belong exclusively to this election.</span>
              </div>
            </div>
          )}

          {election.category === ElectionCategory.PUBLIC_POLL && (
            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <span><b>Public Civic Feedback:</b> Self-registration is {election.allowSelfRegistration ? 'Enabled' : 'Restricted'}.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <b>Participation:</b> {election.settings?.allowMultipleVotes ? 'Multiple responses allowed' : 'Single response per voter'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Tester Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Interactive Voter Eligibility Simulator</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter a voter credential code or registered email to test how the backend evaluates their eligibility.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Voter Credential Code</label>
                <Input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="e.g. VTR-METRO-1011"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Or Registered Email</label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. alexander.vance@metro.edu"
                />
              </div>
            </div>

            <Button type="submit" size="sm" disabled={loading || (!testCode && !testEmail)} className="gap-1.5 text-xs">
              <Search className="h-3.5 w-3.5" />
              {loading ? 'Evaluating...' : 'Verify Voter Eligibility'}
            </Button>
          </form>

          {/* Test Result Display */}
          {searched && result && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                result.isEligible
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-destructive/10 border-destructive/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.isEligible ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-bold text-sm">
                    {result.isEligible ? 'Voter Is ELIGIBLE to Cast Ballot' : 'Voter Is INELIGIBLE'}
                  </span>
                </div>
                <Badge variant={result.isEligible ? 'success' : 'destructive'} className="text-[10px]">
                  {result.isEligible ? 'AUTHORIZED' : 'ACCESS DENIED'}
                </Badge>
              </div>

              {result.reason && (
                <div className="text-xs text-foreground bg-background/50 p-2.5 rounded-lg border">
                  <span className="font-semibold block text-[11px] text-muted-foreground uppercase">Reason / Rule Match:</span>
                  {result.reason}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-background/60 border">
                  <span className="text-[10px] text-muted-foreground block">Remaining Votes Allowed:</span>
                  <span className="font-black text-sm text-foreground">{result.remainingVotesAllowed}</span>
                </div>
                {result.voter && (
                  <>
                    <div className="p-2 rounded bg-background/60 border">
                      <span className="text-[10px] text-muted-foreground block">Voter Code:</span>
                      <span className="font-mono text-xs text-primary font-semibold">{result.voter.voterCode}</span>
                    </div>
                    <div className="p-2 rounded bg-background/60 border">
                      <span className="text-[10px] text-muted-foreground block">Has Voted Previously:</span>
                      <span className="font-bold text-xs">{result.voter.hasVoted ? 'YES (Ballot Recorded)' : 'NO'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
