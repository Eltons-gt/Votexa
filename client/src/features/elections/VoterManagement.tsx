import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  UserCheck,
  Plus,
  Upload,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import {
  Voter,
  VoterEligibilityStatus,
  RegisterVoterRequest,
  BulkImportVotersRequest,
  BulkImportVotersResponse
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface VoterManagementProps {
  electionId: string;
  isReadOnly?: boolean;
}

export function VoterManagement({ electionId, isReadOnly = false }: VoterManagementProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single voter form
  const [singleEmail, setSingleEmail] = useState('');
  const [singleFirstName, setSingleFirstName] = useState('');
  const [singleLastName, setSingleLastName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleTag, setSingleTag] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk import form
  const [csvText, setCsvText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkImportVotersResponse | null>(null);

  // Invitations
  const [sendingInvites, setSendingInvites] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Voter[]>(`/voters?electionId=${electionId}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.data) setVoters(res.data);
    } catch {
      // Fallback
      setVoters([
        {
          id: 'vtr-1',
          organizationId: 'current',
          electionId,
          voterCode: 'VTR-METRO-1011',
          email: 'alexander.vance@metro.edu',
          firstName: 'Alexander',
          lastName: 'Vance',
          eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
          eligibilityTag: 'Faculty of Engineering - Senior',
          hasVoted: false,
          votesCastCount: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'vtr-2',
          organizationId: 'current',
          electionId,
          voterCode: 'VTR-METRO-1012',
          email: 'charlotte.sinclair@metro.edu',
          firstName: 'Charlotte',
          lastName: 'Sinclair',
          eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
          eligibilityTag: 'School of Law - Year 3',
          hasVoted: false,
          votesCastCount: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'vtr-3',
          organizationId: 'current',
          electionId,
          voterCode: 'VTR-METRO-1013',
          email: 'devon.okafor@metro.edu',
          firstName: 'Devon',
          lastName: 'Okafor',
          eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
          eligibilityTag: 'School of Business - Year 2',
          hasVoted: true,
          votesCastCount: 1,
          verifiedAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [electionId, search]);

  const handleRegisterSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);
    try {
      const payload: RegisterVoterRequest = {
        email: singleEmail.trim(),
        firstName: singleFirstName.trim() || undefined,
        lastName: singleLastName.trim() || undefined,
        phone: singlePhone.trim() || undefined,
        eligibilityTag: singleTag.trim() || 'Manual Registration'
      };
      await apiClient.post('/voters', {
        ...payload,
        electionId
      });
      setIsSingleModalOpen(false);
      setSingleEmail('');
      setSingleFirstName('');
      setSingleLastName('');
      setSinglePhone('');
      setSingleTag('');
      fetchVoters();
    } catch (err) {
      setSingleError((err as Error).message || 'Failed to register voter');
    }
  };

  const handleBulkImport = async () => {
    setBulkError(null);
    setBulkResult(null);

    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setBulkError('Please enter at least one line of CSV data');
      return;
    }

    const parsed: Array<{ email?: string; firstName?: string; lastName?: string; phone?: string; eligibilityTag?: string }> = [];

    // Check if line 0 is header
    const firstLine = lines[0]?.toLowerCase() || '';
    const startIndex = firstLine.includes('email') || firstLine.includes('name') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length > 0) {
        parsed.push({
          email: parts[0] || undefined,
          firstName: parts[1] || undefined,
          lastName: parts[2] || undefined,
          eligibilityTag: parts[3] || 'CSV Import'
        });
      }
    }

    if (parsed.length === 0) {
      setBulkError('No valid rows found in CSV text');
      return;
    }

    try {
      const payload: BulkImportVotersRequest = { voters: parsed };
      const res = await apiClient.post<BulkImportVotersResponse>('/voters/bulk-import', {
        ...payload,
        electionId
      });
      if (res.data) {
        setBulkResult(res.data);
        fetchVoters();
      }
    } catch (err) {
      setBulkError((err as Error).message || 'Bulk import failed');
    }
  };

  const handleSendInvitations = async () => {
    setSendingInvites(true);
    setInviteSuccessMsg(null);
    try {
      const res = await apiClient.post<{ sentCount: number }>('/voters/send-invitations', { electionId });
      setInviteSuccessMsg(`Successfully generated and dispatched ${res.data?.sentCount ?? 0} voter invitations with secure 7-day tokens!`);
    } catch (err) {
      alert((err as Error).message || 'Failed to send invitations');
    } finally {
      setSendingInvites(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied voter credential code: ${code}`);
  };

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Voter Roll & Eligibility Register
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage authenticated voter rosters, CSV bulk imports, and credential invitation tokens.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendInvitations}
              disabled={sendingInvites || totalVoters === 0}
              className="gap-1.5 text-xs"
            >
              <Send className="h-3.5 w-3.5 text-primary" />
              {sendingInvites ? 'Sending...' : 'Send Invitations'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBulkError(null);
                setBulkResult(null);
                setIsBulkModalOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" /> Bulk CSV Import
            </Button>
            <Button size="sm" onClick={() => setIsSingleModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Add Voter
            </Button>
          </div>
        )}
      </div>

      {inviteSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{inviteSuccessMsg}</span>
        </div>
      )}

      {/* Roster Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Registered Voters</p>
          <p className="text-2xl font-black text-foreground mt-1">{totalVoters}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Ballots Cast</p>
          <p className="text-2xl font-black text-primary mt-1">
            {votedCount} <span className="text-xs font-normal text-muted-foreground">({turnoutPercent}% Turnout)</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Eligible Awaiting Vote</p>
          <p className="text-2xl font-black text-foreground mt-1">{totalVoters - votedCount}</p>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by voter name, email, or voter code..."
          className="pl-9 text-xs"
        />
      </div>

      {/* Voters Table */}
      {loading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading voter roll...</div>
      ) : voters.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <CardContent className="space-y-2">
            <UserCheck className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">No voters registered</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add individual voters or bulk import your roster using CSV format (email, first name, last name, cohort).
            </p>
            {!isReadOnly && (
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setIsBulkModalOpen(true)} className="text-xs">
                  Bulk CSV Import
                </Button>
                <Button size="sm" onClick={() => setIsSingleModalOpen(true)} className="text-xs">
                  + Add Single Voter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Voter Name / Email</th>
                  <th className="px-4 py-3">Voter Code</th>
                  <th className="px-4 py-3">Cohort / Tag</th>
                  <th className="px-4 py-3">Eligibility</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {voters.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        {v.firstName || v.lastName ? `${v.firstName || ''} ${v.lastName || ''}`.trim() : 'Anonymous Voter'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{v.email || 'No email attached'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
                        <span>{v.voterCode}</span>
                        <button
                          onClick={() => handleCopyCode(v.voterCode)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                          title="Copy credential code"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {v.eligibilityTag || 'Standard'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={v.eligibilityStatus === VoterEligibilityStatus.ELIGIBLE ? 'success' : 'destructive'}
                        className="text-[10px]"
                      >
                        {v.eligibilityStatus || 'ELIGIBLE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {v.hasVoted ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ballot Cast
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Not Voted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(v.voterCode)}
                        className="h-7 text-[11px]"
                      >
                        Copy Code
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Voter Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h4 className="text-base font-bold">Register Single Voter</h4>

            {singleError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSingle} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Email Address *</label>
                <Input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="voter@university.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">First Name</label>
                  <Input
                    value={singleFirstName}
                    onChange={(e) => setSingleFirstName(e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Last Name</label>
                  <Input
                    value={singleLastName}
                    onChange={(e) => setSingleLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Phone Number (Optional)</label>
                <Input
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Cohort / Eligibility Tag</label>
                <Input
                  value={singleTag}
                  onChange={(e) => setSingleTag(e.target.value)}
                  placeholder="e.g. Class of 2026, Engineering Faculty, SACCO Branch #4"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSingleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Register Voter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h4 className="text-base font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Bulk Voter CSV Import
            </h4>
            <p className="text-xs text-muted-foreground">
              Paste CSV data with columns: <b>email, first_name, last_name, cohort_tag</b>
            </p>

            {bulkError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkResult && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs space-y-1">
                <p className="font-semibold">Import Complete!</p>
                <p>Imported: {bulkResult.importedCount} voters • Skipped (Duplicates): {bulkResult.skippedCount}</p>
                {bulkResult.errors && (
                  <ul className="list-disc pl-4 text-[11px] text-muted-foreground">
                    {bulkResult.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-medium text-foreground text-xs block">CSV Text Content</label>
              <textarea
                className="w-full font-mono text-[11px] rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary min-h-[160px]"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`email,first_name,last_name,cohort\njane.smith@metro.edu,Jane,Smith,Class of 2026\nalex.turner@metro.edu,Alex,Turner,Faculty\nsarah.connor@metro.edu,Sarah,Connor,SACCO Member`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={handleBulkImport}>
                Import Roster Rows
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
