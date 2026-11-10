import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Search,
  AlertCircle,
  Vote,
  Lock,
  UserCheck,
  ChevronRight,
  Download,
  RotateCcw
} from 'lucide-react';
import {
  Election,
  ElectionPosition,
  Candidate,
  ElectionCategory,
  VoteReceipt,
  RequestVoteAuthorizationResponse,
  CastAuthorizedVoteResponse
} from '@votexa/shared';
import { VoterWalletPanel } from './VoterWalletPanel';
import { apiClient } from '../../lib/api';

interface VotingInterfaceProps {
  electionId?: string;
  electionTitle?: string;
  electionCategory?: ElectionCategory;
}

export function VotingInterface({
  electionId = 'elec-inst-1',
  electionTitle = 'Student Government Executive Council Election 2026',
  electionCategory = ElectionCategory.INSTITUTIONAL
}: VotingInterfaceProps) {
  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Voter state
  const [voterCode, setVoterCode] = useState(
    electionCategory === ElectionCategory.PAID_COMPETITION ? 'VTR-FAN-501' : 'VTR-METRO-1011'
  );
  const [_walletBalance, setWalletBalance] = useState<number>(0);

  // Selections: keyed by positionId -> candidateId
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [voteWeights, setVoteWeights] = useState<Record<string, number>>({});

  // Workflow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Receipt verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<{ checked: boolean; valid: boolean; record?: any } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch election details, positions, and candidates
  useEffect(() => {
    const loadElectionData = async () => {
      try {
        setLoading(true);
        const [elecRes, posRes, candRes] = await Promise.all([
          apiClient.get<Election>(`/elections/${electionId}`),
          apiClient.get<ElectionPosition[]>(`/elections/${electionId}/positions`),
          apiClient.get<Candidate[]>(`/candidates/election/${electionId}`)
        ]);

        if (elecRes.data) setElection(elecRes.data);
        if (posRes.data) setPositions(posRes.data);
        if (candRes.data) setCandidates(candRes.data);
      } catch {
        // Fallback demo data
        setPositions([
          {
            id: 'pos-1',
            electionId,
            organizationId: 'current',
            title: 'Student Body President',
            description: 'Chief executive officer of the student association.',
            minSelections: 1,
            maxSelections: 1,
            orderIndex: 0,
            createdAt: new Date().toISOString()
          },
          {
            id: 'pos-2',
            electionId,
            organizationId: 'current',
            title: 'Executive Vice President',
            description: 'Presides over the student senate and committee hearings.',
            minSelections: 1,
            maxSelections: 1,
            orderIndex: 1,
            createdAt: new Date().toISOString()
          }
        ]);
        setCandidates([
          {
            id: 'cand-1',
            electionId,
            organizationId: 'current',
            positionId: 'pos-1',
            name: 'Jordan Hayes',
            bio: 'Senior, Computer Science & Public Policy.',
            manifesto: 'Campus sustainability, open budget hearings, and 24/7 library wings.',
            ballotOrder: 1,
            status: 'APPROVED' as any
          },
          {
            id: 'cand-2',
            electionId,
            organizationId: 'current',
            positionId: 'pos-1',
            name: 'Morgan Chen',
            bio: 'Junior, Economics & Data Analytics.',
            manifesto: 'Subsidized transit passes, streamlined club grants, and better dining.',
            ballotOrder: 2,
            status: 'APPROVED' as any
          },
          {
            id: 'cand-3',
            electionId,
            organizationId: 'current',
            positionId: 'pos-2',
            name: 'Elena Rostova',
            bio: 'Senior, International Relations.',
            manifesto: 'Enhanced student safety lighting and inter-collegiate partnerships.',
            ballotOrder: 1,
            status: 'APPROVED' as any
          },
          {
            id: 'cand-4',
            electionId,
            organizationId: 'current',
            positionId: 'pos-2',
            name: 'Marcus Williams',
            bio: 'Junior, Mechanical Engineering.',
            manifesto: 'Maker-space funding and research grant opportunities for undergraduates.',
            ballotOrder: 2,
            status: 'APPROVED' as any
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadElectionData();
  }, [electionId]);

  const activeCategory = election?.category || electionCategory;

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelections({
      ...selections,
      [positionId]: candidateId
    });
    if (!voteWeights[positionId]) {
      setVoteWeights({
        ...voteWeights,
        [positionId]: 1
      });
    }
  };

  const handleOpenConfirm = () => {
    setErrorMessage(null);
    if (!voterCode.trim()) {
      setErrorMessage('Please enter your authorized voter credential code.');
      return;
    }

    if (positions.length > 0 && Object.keys(selections).length === 0) {
      setErrorMessage('Please make at least one candidate selection before submitting your ballot.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmAndCast = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Process positions sequentially with one-time authorizations
      let latestReceipt: VoteReceipt | null = null;

      for (const [posId, candId] of Object.entries(selections)) {
        const weight = voteWeights[posId] || 1;

        // Step 1: Request confidential one-time authorization token
        const authRes = await apiClient.post<RequestVoteAuthorizationResponse>('/voting/authorize', {
          electionId,
          voterCode: voterCode.trim().toUpperCase(),
          positionId: posId,
          creditsRequested: weight
        });

        if (!authRes.data?.authorizationToken) {
          throw new Error('Failed to obtain cryptographic voting authorization');
        }

        // Step 2: Cast confidential authorized ballot
        const voteRes = await apiClient.post<CastAuthorizedVoteResponse>('/voting/cast-authorized', {
          electionId,
          authorizationToken: authRes.data.authorizationToken,
          positionId: posId,
          candidateId: candId
        });

        if (voteRes.data?.receipt) {
          latestReceipt = voteRes.data.receipt;
        }
      }

      if (latestReceipt) {
        setReceipt(latestReceipt);
        setIsConfirmModalOpen(false);
      } else {
        throw new Error('Vote submission failed to generate a receipt');
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Ballot submission failed');
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    setIsVerifying(true);
    try {
      const res = await apiClient.post<{ valid: boolean; record?: any }>('/voting/verify-receipt', {
        receiptCode: verifyCode.trim().toUpperCase()
      });
      if (res.data) {
        setVerifyStatus({ checked: true, valid: res.data.valid, record: res.data.record });
      }
    } catch {
      setVerifyStatus({ checked: true, valid: false });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyReceipt = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* SUCCESS SCREEN: CRYPTOGRAPHIC RECEIPT */}
      {receipt ? (
        <Card className="border-emerald-500/40 bg-card shadow-2xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              Ballot Successfully Cast & Encrypted!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your secret ballot choices have been securely anonymized and committed to the cryptographic ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Digital Receipt Code</span>
              <Badge variant="success" className="text-[10px]">
                AUTHENTICATED & VERIFIED
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border font-mono text-sm sm:text-base font-black text-primary tracking-wider">
              <span>{receipt.receiptCode}</span>
              <Button size="sm" variant="ghost" onClick={copyReceipt} className="h-7 text-xs gap-1">
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
              <div>
                <span className="block font-medium text-foreground">Voter Anonymized Hash:</span>
                <span className="font-mono text-[10px] break-all">{receipt.voterHash}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Timestamp:</span>
                <span>{new Date(receipt.castAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReceipt(null);
                setSelections({});
              }}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Vote in Another Contest
            </Button>
            <Button size="sm" onClick={copyReceipt} className="text-xs gap-1.5 bg-primary text-primary-foreground">
              <Download className="h-3.5 w-3.5" /> Save Ballot Receipt
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="outline" className="text-[11px]">
                {activeCategory}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-primary" /> Tamper-Evident Secret Ballot
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {election?.title || electionTitle}
            </h2>
            <p className="text-xs text-muted-foreground">
              {election?.description || 'Select candidates for each contested position. One-time cryptographic authorization ensures zero link between your identity and secret choices.'}
            </p>
          </div>

          {/* Voter Authentication & Wallet Panel */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-card border space-y-2">
              <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" /> Voter Credential Authorization Code *
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={voterCode}
                  onChange={(e) => setVoterCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VTR-METRO-1011"
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your credential code will be cryptographically hashed to authorize your ballot.
              </p>
            </div>

            <VoterWalletPanel
              electionId={electionId}
              category={activeCategory}
              voterCode={voterCode}
              onBalanceChanged={setWalletBalance}
            />
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Multi-Office Contested Ballot Form */}
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Loading ballot candidates...</div>
          ) : positions.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No contested offices configured for this election yet.
            </Card>
          ) : (
            <div className="space-y-6">
              {positions.map((pos) => {
                const posCandidates = candidates.filter((c) => c.positionId === pos.id);
                const selectedCandId = selections[pos.id];
                return (
                  <Card key={pos.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="bg-muted/30 pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-foreground">
                          {pos.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {selectedCandId ? 'Selection Made' : 'Select 1 Candidate'}
                        </Badge>
                      </div>
                      {pos.description && (
                        <p className="text-xs text-muted-foreground">{pos.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {posCandidates.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No candidates registered for this position.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {posCandidates.map((cand) => {
                            const isSelected = selectedCandId === cand.id;
                            return (
                              <div
                                key={cand.id}
                                onClick={() => handleSelectCandidate(pos.id, cand.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                    : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start gap-3">
                                    {cand.avatarUrl ? (
                                      <img
                                        src={cand.avatarUrl}
                                        alt={cand.name}
                                        className="h-10 w-10 rounded-full object-cover border border-primary/20 shrink-0"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                        {cand.name.charAt(0)}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-sm text-foreground truncate">
                                          {cand.name}
                                        </h5>
                                        <input
                                          type="radio"
                                          name={`pos-${pos.id}`}
                                          checked={isSelected}
                                          onChange={() => handleSelectCandidate(pos.id, cand.id)}
                                          className="accent-primary"
                                        />
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">
                                        Ballot #{cand.ballotOrder}
                                      </span>
                                    </div>
                                  </div>

                                  {cand.bio && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                                      {cand.bio}
                                    </p>
                                  )}
                                  {cand.manifesto && (
                                    <div className="p-2 rounded bg-muted/40 text-[10px] text-muted-foreground italic line-clamp-2 border border-muted">
                                      "{cand.manifesto}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Cast Ballot Submission Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Selections: <b>{Object.keys(selections).length}</b> of <b>{positions.length}</b> offices
                </span>
                <Button
                  size="sm"
                  onClick={handleOpenConfirm}
                  disabled={isSubmitting || Object.keys(selections).length === 0}
                  className="gap-2 text-xs h-9 bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90"
                >
                  <Vote className="h-4 w-4" /> Review & Cast Secret Ballot <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* CONFIRMATION MODAL */}
          {isConfirmModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Confirm Your Secret Ballot
                </h4>

                <p className="text-xs text-muted-foreground">
                  Please review your selections. Once confirmed, a one-time cryptographic authorization will be minted and permanently consumed.
                </p>

                <div className="p-3 rounded-xl bg-muted/40 border space-y-2 text-xs">
                  {Object.entries(selections).map(([posId, candId]) => {
                    const pos = positions.find((p) => p.id === posId);
                    const cand = candidates.find((c) => c.id === candId);
                    return (
                      <div key={posId} className="flex justify-between border-b last:border-b-0 pb-1.5 last:pb-0">
                        <span className="text-muted-foreground">{pos?.title}:</span>
                        <span className="font-bold text-foreground">{cand?.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-muted-foreground font-mono">Voter: {voterCode}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConfirmModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmAndCast}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {isSubmitting ? 'Encrypting & Casting...' : 'Confirm & Commit Ballot'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECEIPT VERIFICATION TOOL */}
          <div className="pt-8 border-t">
            <Card className="bg-muted/20 border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" /> Independent Receipt Verification
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Verify any previously cast ballot receipt code to check its digital cryptographic signature.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter receipt code e.g. VTX-XXXX-XXXX-XXXX-XXXX"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                    className="font-mono text-xs uppercase"
                  />
                  <Button size="sm" onClick={handleVerify} disabled={isVerifying || !verifyCode.trim()} className="text-xs shrink-0">
                    {isVerifying ? 'Verifying...' : 'Verify Receipt'}
                  </Button>
                </div>

                {verifyStatus?.checked && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                      verifyStatus.valid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : 'bg-destructive/10 border-destructive/30 text-destructive'
                    }`}
                  >
                    {verifyStatus.valid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Receipt Verified! Authentic tamper-evident ballot recorded in election ledger.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Invalid or unrecognised ballot receipt code.</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
