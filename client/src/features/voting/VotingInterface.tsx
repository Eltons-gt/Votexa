import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ShieldCheck, CheckCircle2, Copy, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { VoteReceipt } from '@votexa/shared';
import { apiClient } from '../../lib/api';

export function VotingInterface({
  electionId = 'elec-1',
  electionTitle = '2026 Student Union Executive Board Election'
}: {
  electionId?: string;
  electionTitle?: string;
}) {
  const [voterCode, setVoterCode] = useState('VTR-9981-METRO');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('cand-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<{ checked: boolean; valid: boolean; record?: any } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const candidates = [
    { id: 'cand-1', name: 'Jordan Hayes', platform: 'Campus Sustainability & Open Governance' },
    { id: 'cand-2', name: 'Morgan Chen', platform: 'Student Mental Health & Equal Resource Access' }
  ];

  const handleCastVote = async () => {
    if (!voterCode.trim()) {
      setErrorMessage('Please enter your authorized voter credential code.');
      return;
    }

    if (!selectedCandidate) {
      setErrorMessage('Please select a candidate to cast your ballot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<VoteReceipt>('/voting/cast', {
        electionId,
        ballotId: 'ballot-1',
        voterCode: voterCode.trim().toUpperCase(),
        selections: [
          {
            questionId: 'q-1',
            optionId: `opt-${selectedCandidate}`,
            candidateId: selectedCandidate
          }
        ]
      });

      if (response.success && response.data) {
        setReceipt(response.data);
      } else {
        setErrorMessage(response.error?.message || 'Vote casting failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to voting service.');
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
      if (res.success && res.data) {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {receipt ? (
        <Card className="border-emerald-500/50 shadow-lg bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <Badge variant="success" className="mx-auto mb-1">
              Ballot Recorded & Cryptographically Signed
            </Badge>
            <CardTitle className="text-xl">Your Vote Has Been Cast</CardTitle>
            <CardDescription>
              Retain your cryptographic receipt code. You can verify it was tallied into the final ledger at any time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="p-4 bg-muted/60 rounded-lg space-y-2 border font-mono text-center">
              <span className="text-xs uppercase text-muted-foreground tracking-wider font-sans font-semibold">
                Cryptographic Ballot Receipt Code
              </span>
              <div className="text-lg md:text-xl font-black text-primary tracking-widest break-all">
                {receipt.receiptCode}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <div>
                <span className="font-semibold text-foreground">Election ID:</span> {receipt.electionId}
              </div>
              <div>
                <span className="font-semibold text-foreground">Cast Timestamp:</span> {new Date(receipt.castAt).toLocaleTimeString()}
              </div>
              <div className="col-span-2 truncate">
                <span className="font-semibold text-foreground">Digital Signature:</span> {receipt.signature}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button className="flex-1 gap-2" variant="outline" onClick={copyReceipt}>
              <Copy className="h-4 w-4" /> {copied ? 'Copied to Clipboard!' : 'Copy Receipt Code'}
            </Button>
            <Button
              className="flex-1"
              variant="default"
              onClick={() => {
                setReceipt(null);
                setVoterCode('');
              }}
            >
              Cast Another Ballot
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="shadow-md border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="gap-1 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> End-to-End Cryptographic Ledger Active
              </Badge>
              <span className="text-xs text-muted-foreground">Official Ballot</span>
            </div>
            <CardTitle className="text-xl mt-2">{electionTitle}</CardTitle>
            <CardDescription>
              Authorize with your unique voter code, select your candidate, and submit your immutable ballot.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Voter Authorization Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Voter Authorization Credential
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setVoterCode('VTR-9981-METRO')}
                >
                  Use Demo Code (VTR-9981-METRO)
                </button>
              </div>
              <Input
                placeholder="Enter Voter Code (e.g. VTR-9981-METRO)"
                value={voterCode}
                onChange={(e) => setVoterCode(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Candidate Selections */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Official Candidates Roster
              </label>

              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{candidate.name}</span>
                    <input
                      type="radio"
                      name="ballot-choice"
                      checked={selectedCandidate === candidate.id}
                      onChange={() => setSelectedCandidate(candidate.id)}
                      className="text-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{candidate.platform}</p>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full gap-2" onClick={handleCastVote} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Signing & Submitting Encrypted Ballot...
                </>
              ) : (
                'Submit Cryptographic Vote'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Cryptographic Receipt Verifier Widget */}
      <Card className="border-muted bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Verify Cryptographic Ballot Receipt
          </CardTitle>
          <CardDescription className="text-xs">
            Verify any receipt code directly against the cryptographic ledger to confirm it was registered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Paste receipt code (e.g. VTX-XXXX-XXXX-XXXX-XXXX)"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="font-mono text-xs uppercase"
            />
            <Button size="sm" onClick={handleVerify} disabled={isVerifying || !verifyCode.trim()}>
              Verify
            </Button>
          </div>

          {verifyStatus && (
            <div
              className={`p-3 rounded-md text-xs flex items-center justify-between ${
                verifyStatus.valid
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              <span>
                {verifyStatus.valid
                  ? '✓ Verified! Receipt exists in official election ledger.'
                  : '✗ Receipt code not found in recorded ledger.'}
              </span>
              {verifyStatus.valid && verifyStatus.record && (
                <span className="font-mono text-[10px]">
                  Cast: {new Date(verifyStatus.record.castAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
