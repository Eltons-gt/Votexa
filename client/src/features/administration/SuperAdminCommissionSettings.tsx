import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Percent,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { CommissionSettingsResponse, CommissionSettingRecord } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function SuperAdminCommissionSettings() {
  const [settings, setSettings] = useState<CommissionSettingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [newPlatformRateBps, setNewPlatformRateBps] = useState<number>(4000);
  const [notes, setNotes] = useState<string>('');

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<CommissionSettingsResponse>('/admin/commissions');
      if (res.success && res.data) {
        setSettings(res.data);
        setNewPlatformRateBps(res.data.currentPlatformRateBasisPoints);
      } else {
        setError(res.error?.message || 'Failed to fetch commission settings');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with administration service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPlatformRateBps < 0 || newPlatformRateBps > 10000) {
      setError('Platform commission rate must be between 0 and 10,000 basis points (0% - 100%)');
      return;
    }

    if (!notes.trim()) {
      setError('A formal justification note is mandatory for commission rate modifications');
      return;
    }

    setUpdating(true);
    try {
      const res = await apiClient.post<CommissionSettingRecord>('/admin/commissions', {
        platformRateBasisPoints: newPlatformRateBps,
        reason: notes.trim()
      });

      if (res.success && res.data) {
        await fetchSettings();
        setSuccessMsg(
          `Platform commission successfully set to ${(res.data.platformRateBasisPoints / 100).toFixed(2)}% (Organiser: ${(res.data.organiserRateBasisPoints / 100).toFixed(2)}%)`
        );
        setNotes('');
      } else {
        setError(res.error?.message || 'Failed to update commission rate');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error updating commission rate');
    } finally {
      setUpdating(false);
    }
  };

  const calculatedPlatformPct = (newPlatformRateBps / 100).toFixed(2);
  const calculatedOrganiserPct = ((10000 - newPlatformRateBps) / 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Platform Commercial Commission & Revenue Share
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure global platform revenue split. Historical allocations are immutable and remain strictly intact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
            Super Admin Only
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="text-xs gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Commission Split KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center justify-between">
              <span>Platform Retained Commission</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {settings ? `${(settings.currentPlatformRateBasisPoints / 100).toFixed(2)}%` : '40.00%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings?.currentPlatformRateBasisPoints || 4000} basis points of distributable payment pool.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground font-semibold flex items-center justify-between">
              <span>Organiser Net Share</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {settings ? `${(settings.currentOrganiserRateBasisPoints / 100).toFixed(2)}%` : '60.00%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Guaranteed remainder after platform deduction. Discrepancy zero-rounding enforced.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-4 rounded-md border bg-muted/20 text-xs space-y-2">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <ArrowRight className="h-4 w-4 text-primary" />
          Double-Entry Accounting Formula
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground font-mono text-[11px]">
          <div className="p-2 bg-background rounded border">
            <strong>1. Distributable Pool</strong> = Gross Payment - Processing Fees - Deductions
          </div>
          <div className="p-2 bg-background rounded border">
            <strong>2. Platform Share</strong> = Rate % × Distributable Pool (Integer Cents)
          </div>
          <div className="p-2 bg-background rounded border">
            <strong>3. Organiser Share</strong> = Distributable Pool - Platform Share
          </div>
        </div>
      </div>

      {/* Commission Rate Modification Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            Modify Global Platform Commission Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Platform Commission (in Basis Points, 1 bp = 0.01%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="10000"
                    step="50"
                    value={newPlatformRateBps}
                    onChange={(e) => setNewPlatformRateBps(parseInt(e.target.value) || 0)}
                    className="text-xs font-mono"
                    required
                  />
                  <div className="px-3 py-2 bg-muted rounded-md text-xs font-bold shrink-0 min-w-[70px] text-center">
                    {calculatedPlatformPct}%
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Organiser share will automatically adjust to <strong>{calculatedOrganiserPct}%</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Executive Justification & Audit Notes <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Q4 enterprise partner promotional rate update"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Mandatory reason recorded into the immutable platform audit ledger.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-md text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Immutability Guarantee:</strong> Changing this rate sets the default for all future transactions.
                Past allocations and completed payouts will <em>never</em> be retroactively recalculated.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" disabled={updating} className="text-xs h-9">
              {updating ? 'Saving & Auditing...' : 'Commit New Global Rate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Historical Commission Audit Trail */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Historical Commission Rate Snapshots
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Immutable audit records</span>
        </CardHeader>
        <CardContent>
          {!settings || settings.history.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No historical rate modifications on record. Operating under initial 40.00% / 60.00% standard baseline.
            </div>
          ) : (
            <div className="space-y-2">
              {settings.history.map((h, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-md bg-card hover:bg-muted/10 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      Platform: {(h.platformRateBasisPoints / 100).toFixed(2)}%
                    </Badge>
                    <Badge variant="success" className="font-mono text-xs">
                      Organiser: {(h.organiserRateBasisPoints / 100).toFixed(2)}%
                    </Badge>
                    <span className="text-foreground font-medium">{h.notes}</span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {h.updatedBy}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(h.effectiveFrom || h.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
