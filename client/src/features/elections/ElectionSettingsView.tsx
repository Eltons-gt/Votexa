import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Settings,
  Eye,
  Lock,
  Globe,
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  Election,
  ElectionCategory,
  ElectionStatus,
  ResultsVisibility,
  UpdateElectionSettingsRequest
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface ElectionSettingsViewProps {
  election: Election;
  onUpdated?: () => void;
  isReadOnly?: boolean;
}

export function ElectionSettingsView({ election, onUpdated, isReadOnly = false }: ElectionSettingsViewProps) {
  const currentSettings = election.settings;

  const [visibility, setVisibility] = useState<ResultsVisibility>(
    currentSettings?.resultsVisibility || ResultsVisibility.AFTER_CLOSE
  );
  const [shuffleOrder, setShuffleOrder] = useState<boolean>(
    currentSettings?.shuffleCandidateOrder ?? true
  );
  const [realTimeTally, setRealTimeTally] = useState<boolean>(
    currentSettings?.enableRealTimeTally ?? true
  );

  // Institutional domain restrictions
  const [domainsText, setDomainsText] = useState<string>(
    currentSettings?.allowedDomains?.join(', ') || ''
  );

  // Paid competition limits
  const [allowMultiple, setAllowMultiple] = useState<boolean>(
    currentSettings?.allowMultipleVotes ?? false
  );
  const [maxVotes, setMaxVotes] = useState<number>(
    currentSettings?.maxVotesPerVoter ?? 1
  );
  const [votePrice, setVotePrice] = useState<number>(
    (currentSettings?.votePriceCents ?? 0) / 100
  );

  // Audit Override Reason
  const [auditReason, setAuditReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isLiveOrClosed =
    election.status === ElectionStatus.ACTIVE || election.status === ElectionStatus.CLOSED;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const domains = domainsText
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const payload: UpdateElectionSettingsRequest = {
      resultsVisibility: visibility,
      shuffleCandidateOrder: shuffleOrder,
      enableRealTimeTally: realTimeTally,
      allowedDomains: domains,
      allowMultipleVotes: election.category === ElectionCategory.PAID_COMPETITION ? allowMultiple : false,
      maxVotesPerVoter: election.category === ElectionCategory.PAID_COMPETITION ? maxVotes : 1,
      votePriceCents: election.category === ElectionCategory.PAID_COMPETITION ? Math.round(votePrice * 100) : 0,
      auditReason: isLiveOrClosed ? auditReason.trim() : undefined
    };

    try {
      await apiClient.put(`/elections/${election.id}/settings`, payload);
      setSuccessMsg('Election settings and visibility policies updated successfully.');
      if (onUpdated) onUpdated();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Election Settings & Results Visibility
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure real-time transparency rules, voting limits, results embargoes, and candidate display order.
        </p>
      </div>

      {isLiveOrClosed && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Voting Rules Locked (Status: {election.status})</p>
            <p className="text-[11px] opacity-90">
              Critical voting rules (pricing, multiple votes, and category constraints) are locked while voting is underway. Any changes require an explicit audit explanation.
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Results Visibility Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Results Visibility & Public Transparency
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Controls when candidate tallies and voter turnout metrics become visible to participants.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: ResultsVisibility.AFTER_CLOSE,
                  title: 'After Polls Close (Recommended)',
                  desc: 'Tallies remain completely hidden until voting concludes, preventing bandwagon effects.'
                },
                {
                  value: ResultsVisibility.LIVE,
                  title: 'Live Real-Time Tallies',
                  desc: 'Vote tallies and lead changes update dynamically in real time as ballots are verified.'
                },
                {
                  value: ResultsVisibility.ORGANIZATION_ONLY,
                  title: 'Organization Admins Only',
                  desc: 'Only authorized organization staff and admins can view tally reports.'
                },
                {
                  value: ResultsVisibility.HIDDEN,
                  title: 'Completely Hidden',
                  desc: 'Results are never displayed publicly without an official manual audit export.'
                }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-colors ${
                    visibility === opt.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{opt.title}</span>
                      <input
                        type="radio"
                        name="resultsVisibility"
                        value={opt.value}
                        checked={visibility === opt.value}
                        onChange={() => setVisibility(opt.value)}
                        disabled={isReadOnly}
                        className="accent-primary"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeTally}
                  onChange={(e) => setRealTimeTally(e.target.checked)}
                  disabled={isReadOnly}
                  className="rounded border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs">
                  <b>Enable Real-Time Tally Processing:</b> Update cryptographic counters on ballot cast
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOrder}
                  onChange={(e) => setShuffleOrder(e.target.checked)}
                  disabled={isReadOnly}
                  className="rounded border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs">
                  <b>Randomize Candidate Order:</b> Counteract ballot position bias per voter session
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Institutional Domain Restrictions */}
        {election.category === ElectionCategory.INSTITUTIONAL && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Institutional Email Domain Locking
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Restrict voter registration strictly to authorized institutional email domains (e.g. <code>@metro.edu</code>).
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <label className="font-medium text-foreground block">Allowed Email Suffixes (comma-separated)</label>
              <Input
                value={domainsText}
                onChange={(e) => setDomainsText(e.target.value)}
                placeholder="@university.edu, @student.university.edu"
                disabled={isReadOnly}
              />
              <p className="text-[11px] text-muted-foreground">
                Any registration attempt from an unlisted domain will be automatically rejected by the backend.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Paid Competition Limits */}
        {election.category === ElectionCategory.PAID_COMPETITION && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> Paid Competition Voting Limits
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Configure paid ticket pricing and maximum vote caps per participant.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-foreground block mb-1">Price Per Vote ($ USD)</label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0"
                    value={votePrice}
                    onChange={(e) => setVotePrice(parseFloat(e.target.value) || 0)}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Max Votes Cap Per Voter (0 for unlimited)</label>
                  <Input
                    type="number"
                    min="1"
                    value={maxVotes}
                    onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                  disabled={isReadOnly}
                  className="rounded border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs">
                  <b>Allow Multiple Votes:</b> Enable participants to vote repeatedly up to the configured limit.
                </span>
              </label>
            </CardContent>
          </Card>
        )}

        {/* Audit Override Explanation (When Live or Closed) */}
        {isLiveOrClosed && !isReadOnly && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lock className="h-4 w-4" /> Audit Authorization Reason Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <label className="font-medium text-foreground block">
                Official Authorization Reason / Motion Reference *
              </label>
              <Input
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="e.g. Authorized by Senate Resolution #2026-08 due to faculty calendar shift"
                required={isLiveOrClosed}
              />
              <p className="text-[11px] text-muted-foreground">
                This explanation will be permanently recorded in the immutable tenant audit ledger.
              </p>
            </CardContent>
          </Card>
        )}

        {!isReadOnly && (
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving || (isLiveOrClosed && !auditReason.trim())} className="text-xs">
              {saving ? 'Saving...' : 'Save Election Settings'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
