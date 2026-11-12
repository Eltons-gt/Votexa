import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Vote,
  Shield,
  DollarSign,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Globe
} from 'lucide-react';
import {
  Election,
  ElectionCategory,
  ResultsVisibility,
  CreateElectionRequest
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface ElectionWizardProps {
  onCreated: (election: Election) => void;
  onCancel: () => void;
}

export function ElectionWizard({ onCreated, onCancel }: ElectionWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Category
  const [category, setCategory] = useState<ElectionCategory>(ElectionCategory.INSTITUTIONAL);

  // Step 2: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');

  // Dates default to tomorrow and +3 days
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const endDefault = new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 16);
  const [startTime, setStartTime] = useState(tomorrow);
  const [endTime, setEndTime] = useState(endDefault);

  // Step 3: Specific Rules
  // Institutional
  const [allowedDomains, setAllowedDomains] = useState('@metro.edu, @university.edu');

  // Paid Competition
  const [votePrice, setVotePrice] = useState(1.0);
  const [maxVotes, setMaxVotes] = useState(50);
  const [allowMultiple, setAllowMultiple] = useState(true);

  // Public Poll
  const [allowSelfReg, setAllowSelfReg] = useState(true);
  const [visibility, setVisibility] = useState<ResultsVisibility>(ResultsVisibility.AFTER_CLOSE);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (category === ElectionCategory.PAID_COMPETITION) {
        setVisibility(ResultsVisibility.LIVE);
      } else {
        setVisibility(ResultsVisibility.AFTER_CLOSE);
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        setError('Election title is required');
        return;
      }
      if (!startTime || !endTime) {
        setError('Start time and end time are required');
        return;
      }
      if (new Date(endTime) <= new Date(startTime)) {
        setError('End time must be strictly after start time');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    const domains = allowedDomains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const isPaid = category === ElectionCategory.PAID_COMPETITION;

    const payload: CreateElectionRequest = {
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      timezone,
      allowSelfRegistration: category === ElectionCategory.PUBLIC_POLL ? allowSelfReg : false,
      isPaidVoting: isPaid,
      settings: {
        resultsVisibility: visibility,
        allowMultipleVotes: isPaid ? allowMultiple : false,
        maxVotesPerVoter: isPaid ? maxVotes : 1,
        votePriceCents: isPaid ? Math.round(votePrice * 100) : 0,
        requireVoterVerification: category === ElectionCategory.INSTITUTIONAL ? true : false,
        allowedDomains: category === ElectionCategory.INSTITUTIONAL ? domains : []
      }
    };

    try {
      const res = await apiClient.post<Election>('/elections', payload);
      if (res.success && res.data) {
        onCreated(res.data);
      } else {
        setError(res.error?.message || 'Failed to create draft election. Please check your session and organization permissions.');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" /> Create New Election Workspace
          </h2>
          <p className="text-xs text-muted-foreground">
            Step {step} of 4: {step === 1 ? 'Choose Category' : step === 2 ? 'General Details' : step === 3 ? 'Voting Rules' : 'Review & Finalize'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          Cancel
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Select Election Category</h3>
            <p className="text-xs text-muted-foreground">
              Choose the architectural category. The backend strictly enforces compliance with each category's rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Institutional */}
            <div
              onClick={() => setCategory(ElectionCategory.INSTITUTIONAL)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                category === ElectionCategory.INSTITUTIONAL
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-muted-foreground/40 bg-card'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Institutional Election</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Universities, companies, professional associations, unions, and SACCOs.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> One voter, one vote
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Lock className="h-3.5 w-3.5 text-primary" /> No vote purchases/credits
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Shield className="h-3.5 w-3.5 text-blue-500" /> Backend eligibility verification
                </div>
              </div>
            </div>

            {/* 2. Paid Competition */}
            <div
              onClick={() => setCategory(ElectionCategory.PAID_COMPETITION)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                category === ElectionCategory.PAID_COMPETITION
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-muted-foreground/40 bg-card'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Paid Competition</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Talent competitions, fan voting, audience choice awards, and public contests.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Multiple votes permitted
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-amber-500" /> Paid voting explicitly enabled
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Credits scoped to this election
                </div>
              </div>
            </div>

            {/* 3. Public Opinion Poll */}
            <div
              onClick={() => setCategory(ElectionCategory.PUBLIC_POLL)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                category === ElectionCategory.PUBLIC_POLL
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-muted-foreground/40 bg-card'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Public Opinion Poll</h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Community sentiment, civic surveys, and open policy consultations.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" /> Configurable public access
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Flexible participation rules
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <BarChart2 className="h-3.5 w-3.5 text-blue-500" /> Configurable results visibility
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: GENERAL DETAILS */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold">Election Details & Schedule</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">Election Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Student Government Executive Election"
                required
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Description / Purpose</label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state the mandate and offices contested..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Polls Open (Start Time) *</label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Polls Close (End Time) *</label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Official Timezone</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="America/New_York">Eastern Time (America/New_York)</option>
                <option value="America/Chicago">Central Time (America/Chicago)</option>
                <option value="America/Denver">Mountain Time (America/Denver)</option>
                <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                <option value="Europe/London">London (UTC/BST)</option>
                <option value="Africa/Nairobi">East Africa Time (Africa/Nairobi)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: CATEGORY RULES */}
      {step === 3 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Category-Specific Rule Configuration</h3>
            <Badge variant="outline">{category}</Badge>
          </div>

          {category === ElectionCategory.INSTITUTIONAL && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Institutional Rules Enforced Automatically
                </p>
                <p className="text-[11px] opacity-90">
                  Paid voting is permanently disabled. Each voter receives exactly one non-transferable ballot per position.
                </p>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Institutional Email Domain Whitelist (Optional)
                </label>
                <Input
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  placeholder="@metro.edu, @university.edu"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Leave empty if voter verification relies strictly on CSV roster codes.
                </p>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Results Visibility</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ResultsVisibility)}
                >
                  <option value={ResultsVisibility.AFTER_CLOSE}>Embargoed: Reveal After Polls Close (Recommended)</option>
                  <option value={ResultsVisibility.ORGANIZATION_ONLY}>Private: Organization Admins Only</option>
                  <option value={ResultsVisibility.LIVE}>Transparent: Live Real-Time Tallies</option>
                </select>
              </div>
            </div>
          )}

          {category === ElectionCategory.PAID_COMPETITION && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-foreground block mb-1">Vote Price ($ USD)</label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={votePrice}
                    onChange={(e) => setVotePrice(parseFloat(e.target.value) || 0.25)}
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Maximum Votes Allowed Per Voter</label>
                  <Input
                    type="number"
                    min="1"
                    value={maxVotes}
                    onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                  className="rounded border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Enable Multiple Votes per User Session</span>
              </label>

              <div>
                <label className="font-medium text-foreground block mb-1">Results Visibility</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ResultsVisibility)}
                >
                  <option value={ResultsVisibility.LIVE}>Live Real-Time Leaderboard (Engage Fans)</option>
                  <option value={ResultsVisibility.AFTER_CLOSE}>Reveal After Competition Closes</option>
                </select>
              </div>
            </div>
          )}

          {category === ElectionCategory.PUBLIC_POLL && (
            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowSelfReg}
                  onChange={(e) => setAllowSelfReg(e.target.checked)}
                  className="rounded border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Allow Public Self-Registration (Open Participation)</span>
              </label>

              <div>
                <label className="font-medium text-foreground block mb-1">Results Visibility</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ResultsVisibility)}
                >
                  <option value={ResultsVisibility.LIVE}>Live Public Results</option>
                  <option value={ResultsVisibility.AFTER_CLOSE}>Display After Poll Closes</option>
                </select>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold">Review & Initialize Draft Election</h3>

          <div className="bg-muted/40 p-4 rounded-xl border space-y-2 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-bold">{category}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-bold">{title}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Schedule:</span>
              <span>{new Date(startTime).toLocaleString()} — {new Date(endTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Paid Voting:</span>
              <span className="font-semibold">{category === ElectionCategory.PAID_COMPETITION ? `YES ($${votePrice}/vote)` : 'DISABLED'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Results Visibility:</span>
              <span className="font-semibold">{visibility}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Status:</span>
              <Badge variant="default" className="text-[10px]">DRAFT</Badge>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Once created, you will be directed to the Election Workspace to configure positions, candidates, and voter rolls before scheduling.
          </p>
        </Card>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex justify-between pt-4 border-t">
        {step > 1 ? (
          <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="gap-1 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button size="sm" onClick={handleNextStep} className="gap-1 text-xs">
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleCreate} disabled={loading} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Initializing Workspace...' : 'Create Draft Election'}
          </Button>
        )}
      </div>
    </div>
  );
}
