import { useState, useEffect, type FormEvent } from 'react';
import {
  OrganizerPayout,
  PayoutStatus,
  PayoutMethod,
  PayoutAuditLog
} from '@votexa/shared';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck,
  RefreshCw,
  Landmark,
  Smartphone,
  History,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  Zap,
  Send
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface SuperAdminPayoutQueueProps {
  currentAdminUserId?: string;
}

export function SuperAdminPayoutQueue({
  currentAdminUserId = 'usr-super-admin'
}: SuperAdminPayoutQueueProps) {
  const [payouts, setPayouts] = useState<OrganizerPayout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'>('ALL');

  // Review Dialog State
  const [reviewPayout, setReviewPayout] = useState<OrganizerPayout | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Settlement Dialog State
  const [settlePayout, setSettlePayout] = useState<OrganizerPayout | null>(null);
  const [settlementEvidence, setSettlementEvidence] = useState<string>('');
  const [providerReference, setProviderReference] = useState<string>('');
  const [settleNotes, setSettleNotes] = useState<string>('');
  const [settleLoading, setSettleLoading] = useState<boolean>(false);
  const [settleError, setSettleError] = useState<string | null>(null);

  // Automated M-Pesa B2C Dialog State
  const [b2cPayout, setB2cPayout] = useState<OrganizerPayout | null>(null);
  const [b2cCommandId, setB2cCommandId] = useState<'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment'>('BusinessPayment');
  const [b2cLoading, setB2cLoading] = useState<boolean>(false);
  const [b2cError, setB2cError] = useState<string | null>(null);
  const [b2cSuccess, setB2cSuccess] = useState<any | null>(null);

  // Audit Logs Dialog State
  const [auditPayout, setAuditPayout] = useState<OrganizerPayout | null>(null);
  const [auditLogs, setAuditLogs] = useState<PayoutAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OrganizerPayout[]>('/payouts');
      if (res.success && res.data) {
        setPayouts(res.data);
      }
    } catch {
      // Fallback sample data
      setPayouts([
        {
          id: 'pay-sample-1',
          organizationId: 'org-metro-uni',
          amountCents: 15000,
          feeCents: 50,
          netAmountCents: 14950,
          currency: 'USD',
          method: PayoutMethod.MPESA_B2C,
          destinationDetails: { phoneNumber: '254712345678', accountName: 'Dean Alexander Vance' },
          status: PayoutStatus.REQUESTED,
          requestedBy: 'usr-organizer-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pay-sample-2',
          organizationId: 'org-starlight-col',
          amountCents: 35000,
          feeCents: 150,
          netAmountCents: 34850,
          currency: 'USD',
          method: PayoutMethod.BANK_TRANSFER,
          destinationDetails: {
            bankName: 'Standard Chartered',
            accountNumber: '0102938475600',
            accountName: 'Starlight Medical Council'
          },
          status: PayoutStatus.APPROVED,
          requestedBy: 'usr-organizer-2',
          reviewedBy: 'usr-admin-vance',
          reviewedAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // Review Action Handler (Approve / Reject)
  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!reviewPayout) return;
    setReviewError(null);

    if (action === 'REJECT' && !rejectionReason.trim()) {
      setReviewError('Please provide a mandatory reason for rejecting this payout request.');
      return;
    }

    try {
      setReviewLoading(true);
      const res = await apiClient.post<OrganizerPayout>(`/payouts/${reviewPayout.id}/review`, {
        action,
        reason: action === 'REJECT' ? rejectionReason.trim() : undefined,
        adminUserId: currentAdminUserId
      });

      if (res.success && res.data) {
        setPayouts((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)));
        setReviewPayout(null);
        setShowRejectInput(false);
        setRejectionReason('');
      } else {
        setReviewError(res.error?.message || 'Failed to submit review decision.');
      }
    } catch (err: any) {
      setReviewError(err?.message || 'Error occurred while processing review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Settlement Action Handler
  const handleSettleAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!settlePayout) return;
    setSettleError(null);

    if (!settlementEvidence.trim()) {
      setSettleError('Settlement evidence is mandatory (e.g. Bank wire reference or M-Pesa B2C Receipt number).');
      return;
    }

    try {
      setSettleLoading(true);
      const res = await apiClient.post<OrganizerPayout>(`/payouts/${settlePayout.id}/settle`, {
        settlementEvidence: settlementEvidence.trim(),
        providerReference: providerReference.trim() || undefined,
        notes: settleNotes.trim() || undefined,
        adminUserId: currentAdminUserId
      });

      if (res.success && res.data) {
        setPayouts((prev) => prev.map((p) => (p.id === res.data!.id ? res.data! : p)));
        setSettlePayout(null);
        setSettlementEvidence('');
        setProviderReference('');
        setSettleNotes('');
      } else {
        setSettleError(res.error?.message || 'Failed to record payout settlement.');
      }
    } catch (err: any) {
      setSettleError(err?.message || 'Error occurred while settling payout.');
    } finally {
      setSettleLoading(false);
    }
  };

  // Automated M-Pesa B2C Execution Handler
  const handleExecuteB2C = async () => {
    if (!b2cPayout) return;
    setB2cError(null);
    try {
      setB2cLoading(true);
      const res = await apiClient.post<any>(`/payouts/${b2cPayout.id}/disburse-mpesa`, {
        commandId: b2cCommandId,
        adminUserId: currentAdminUserId
      });

      if (res.success && res.data) {
        setB2cSuccess(res.data);
        setPayouts((prev) =>
          prev.map((p) => (p.id === b2cPayout.id ? { ...p, status: PayoutStatus.PROCESSING } : p))
        );
      } else {
        setB2cError(res.error?.message || 'Failed to dispatch M-Pesa B2C disbursement.');
      }
    } catch (err: any) {
      setB2cError(err?.message || 'Error occurred while communicating with Safaricom Daraja B2C API.');
    } finally {
      setB2cLoading(false);
    }
  };

  // Simulate B2C Callback in Development / Testing Mode
  const handleSimulateB2CCallback = async () => {
    if (!b2cPayout || !b2cSuccess) return;
    try {
      setB2cLoading(true);
      const randReceipt = `NLX${Math.floor(100000 + Math.random() * 900000)}KL`;
      const callbackPayload = {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          OriginatorConversationID: b2cSuccess.originatorConversationId,
          ConversationID: b2cSuccess.conversationId,
          TransactionID: randReceipt,
          ResultParameters: {
            ResultParameter: [
              { Key: 'TransactionAmount', Value: b2cSuccess.amountKes },
              { Key: 'TransactionReceipt', Value: randReceipt },
              { Key: 'ReceiverPartyPublicName', Value: `${b2cSuccess.recipientPhone} - Organizer Recipient` },
              { Key: 'TransactionCompletedDateTime', Value: new Date().toISOString() }
            ]
          }
        }
      };

      await apiClient.post('/webhooks/mpesa/b2c-result', callbackPayload);

      await fetchPayouts();
      setB2cPayout(null);
      setB2cSuccess(null);
    } catch (err: any) {
      setB2cError(err?.message || 'Error occurred while simulating B2C callback.');
    } finally {
      setB2cLoading(false);
    }
  };

  // Open Audit Log
  const handleOpenAudit = async (payout: OrganizerPayout) => {
    setAuditPayout(payout);
    setLoadingAudit(true);
    try {
      const res = await apiClient.get<any>(`/payouts/${payout.id}`);
      if (res.success && res.data?.auditLogs) {
        setAuditLogs(res.data.auditLogs);
      } else {
        setAuditLogs([
          {
            id: 'log-1',
            payoutId: payout.id,
            organizationId: payout.organizationId,
            performedBy: payout.requestedBy,
            action: 'PAYOUT_REQUESTED',
            toStatus: PayoutStatus.REQUESTED,
            notes: 'Two-phase reservation established.',
            createdAt: payout.createdAt
          }
        ]);
      }
    } catch {
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Filtered Payouts
  const filtered = payouts.filter((p) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') {
      return [PayoutStatus.REQUESTED, PayoutStatus.RESERVED, PayoutStatus.UNDER_REVIEW].includes(p.status);
    }
    if (filter === 'APPROVED') {
      return [PayoutStatus.APPROVED, PayoutStatus.PROCESSING].includes(p.status);
    }
    if (filter === 'PAID') return p.status === PayoutStatus.PAID;
    if (filter === 'REJECTED') {
      return [PayoutStatus.REJECTED, PayoutStatus.FAILED].includes(p.status);
    }
    return true;
  });

  // KPI Calculations
  const pendingRequests = payouts.filter((p) =>
    [PayoutStatus.REQUESTED, PayoutStatus.RESERVED, PayoutStatus.UNDER_REVIEW].includes(p.status)
  );
  const pendingVolume = pendingRequests.reduce((acc, p) => acc + p.amountCents, 0);

  const approvedRequests = payouts.filter((p) =>
    [PayoutStatus.APPROVED, PayoutStatus.PROCESSING].includes(p.status)
  );
  const approvedVolume = approvedRequests.reduce((acc, p) => acc + p.netAmountCents, 0);

  const paidRequests = payouts.filter((p) => p.status === PayoutStatus.PAID);
  const paidVolume = paidRequests.reduce((acc, p) => acc + p.netAmountCents, 0);

  return (
    <div className="space-y-6">
      {/* Platform Administration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Withdrawal Queue & Disbursement Operations
            </h2>
            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
              Separation of Duties Enforced
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review organizer requests, verify two-phase reservations, execute disbursements, and record tamper-evident settlement proof.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPayouts}
          className="h-8 gap-1 text-xs text-muted-foreground self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Review */}
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-amber-600 uppercase">Awaiting Admin Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600">${(pendingVolume / 100).toFixed(2)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pendingRequests.length} request(s) awaiting approval
            </p>
          </CardContent>
        </Card>

        {/* Approved / Ready for Settlement */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-blue-600 uppercase">Ready for Settlement</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">${(approvedVolume / 100).toFixed(2)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {approvedRequests.length} approved payout(s) to disburse
            </p>
          </CardContent>
        </Card>

        {/* Settled & Paid */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-semibold text-emerald-600 uppercase">Settled Volume</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">${(paidVolume / 100).toFixed(2)}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {paidRequests.length} verified settlement disbursements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        {[
          { id: 'ALL', label: `All Requests (${payouts.length})` },
          { id: 'PENDING', label: `Pending Review (${pendingRequests.length})` },
          { id: 'APPROVED', label: `Ready to Settle (${approvedRequests.length})` },
          { id: 'PAID', label: `Settled (${paidRequests.length})` },
          {
            id: 'REJECTED',
            label: `Rejected / Failed (${
              payouts.filter((p) => [PayoutStatus.REJECTED, PayoutStatus.FAILED].includes(p.status)).length
            })`
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payouts Queue Table */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No withdrawal requests found matching this filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((payout) => {
            const dest = payout.destinationDetails as Record<string, string>;
            const isSelfRequest = payout.requestedBy === currentAdminUserId;

            return (
              <Card key={payout.id} className="p-4 hover:border-primary/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Organization & Request Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{payout.id}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {payout.organizationId}
                      </Badge>
                      <Badge
                        variant={
                          payout.status === PayoutStatus.PAID
                            ? 'success'
                            : payout.status === PayoutStatus.REJECTED || payout.status === PayoutStatus.FAILED
                            ? 'destructive'
                            : 'outline'
                        }
                        className="text-[10px] font-bold"
                      >
                        {payout.status}
                      </Badge>
                      {isSelfRequest && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 font-bold">
                          Your Request (Duty Isolated)
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-lg font-black text-foreground">
                        ${(payout.amountCents / 100).toFixed(2)} {payout.currency}
                      </span>
                      <span className="text-muted-foreground">
                        Fee: ${(payout.feeCents / 100).toFixed(2)} → Net:{' '}
                        <strong className="text-emerald-600">${(payout.netAmountCents / 100).toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {payout.method === PayoutMethod.MPESA_B2C ? (
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-emerald-600" />
                          M-Pesa: {dest?.phoneNumber} ({dest?.accountName})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Landmark className="h-3 w-3 text-primary" />
                          Bank: {dest?.bankName} • Acct #{dest?.accountNumber} ({dest?.accountName})
                        </span>
                      )}
                      <span>•</span>
                      <span>Requested by: <strong className="font-mono">{payout.requestedBy}</strong></span>
                      <span>•</span>
                      <span>{new Date(payout.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Settlement Evidence Display */}
                    {payout.settlementEvidence && (
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          <strong>Settlement Evidence Verified:</strong> Ref #{payout.settlementEvidence} (Disbursed by{' '}
                          {payout.reviewedBy || 'Admin'})
                        </span>
                      </div>
                    )}

                    {payout.rejectionReason && (
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[11px] flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          <strong>Rejection Reason:</strong> {payout.rejectionReason} (Reservation released)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Admin Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAudit(payout)}
                      className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <History className="h-3.5 w-3.5" /> Audit
                    </Button>

                    {/* Review Button (for REQUESTED or UNDER_REVIEW) */}
                    {[PayoutStatus.REQUESTED, PayoutStatus.RESERVED, PayoutStatus.UNDER_REVIEW].includes(payout.status) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setReviewPayout(payout);
                          setShowRejectInput(false);
                          setRejectionReason('');
                          setReviewError(null);
                        }}
                        className="h-8 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
                      >
                        Review Request
                      </Button>
                    )}

                    {/* Automated M-Pesa B2C Direct Transfer */}
                    {payout.method === PayoutMethod.MPESA_B2C &&
                      [PayoutStatus.APPROVED, PayoutStatus.PROCESSING].includes(payout.status) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setB2cPayout(payout);
                            setB2cSuccess(null);
                            setB2cError(null);
                          }}
                          className="h-8 text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-sm"
                        >
                          <Zap className="h-3.5 w-3.5" /> Disburse B2C
                        </Button>
                      )}

                    {/* Manual Settlement Record Button (for APPROVED or PROCESSING) */}
                    {[PayoutStatus.APPROVED, PayoutStatus.PROCESSING].includes(payout.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSettlePayout(payout);
                          setSettlementEvidence('');
                          setProviderReference('');
                          setSettleNotes('');
                          setSettleError(null);
                        }}
                        className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground font-semibold"
                      >
                        <FileCheck className="h-3.5 w-3.5" /> Record Proof
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog Modal */}
      {reviewPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-card border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/20">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" /> Review Organiser Withdrawal
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{reviewPayout.id}</p>
              </div>
              <button
                onClick={() => setReviewPayout(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {reviewError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Separation of Duties Warning */}
              {reviewPayout.requestedBy === currentAdminUserId && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-bold">Separation of Duties Policy Enforced</strong>
                    <span>
                      You requested this withdrawal. Platform policy strictly prohibits an administrator from reviewing or approving their own payout. Another administrator must review this request.
                    </span>
                  </div>
                </div>
              )}

              {/* Details Overview */}
              <div className="p-3 rounded-xl bg-muted/30 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="font-bold text-foreground">{reviewPayout.organizationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested Amount:</span>
                  <span className="font-bold text-foreground">
                    ${(reviewPayout.amountCents / 100).toFixed(2)} {reviewPayout.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disbursement Fee:</span>
                  <span className="font-semibold text-muted-foreground">
                    -${(reviewPayout.feeCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="font-bold text-foreground">Net Payout to Disburse:</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    ${(reviewPayout.netAmountCents / 100).toFixed(2)} {reviewPayout.currency}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">Destination:</span>
                  <span className="font-medium text-foreground text-right">
                    {reviewPayout.method === PayoutMethod.MPESA_B2C
                      ? `M-Pesa ${(reviewPayout.destinationDetails as any).phoneNumber}`
                      : `${(reviewPayout.destinationDetails as any).bankName} - Acct ${(reviewPayout.destinationDetails as any).accountNumber}`}
                  </span>
                </div>
              </div>

              {/* Rejection input */}
              {showRejectInput && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="font-bold text-destructive">Rejection Reason (Mandatory):</label>
                  <Input
                    type="text"
                    placeholder="e.g. Invalid account details or compliance flag"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Rejecting will immediately release the ${(reviewPayout.amountCents / 100).toFixed(2)} reservation back to the organizer's available treasury.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setReviewPayout(null)}>
                  Cancel
                </Button>

                {!showRejectInput ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectInput(true)}
                      disabled={reviewLoading || reviewPayout.requestedBy === currentAdminUserId}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Reject Request...
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReviewAction('APPROVE')}
                      disabled={reviewLoading || reviewPayout.requestedBy === currentAdminUserId}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve Payout
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleReviewAction('REJECT')}
                    disabled={reviewLoading || !rejectionReason.trim()}
                    className="bg-destructive hover:bg-destructive/90 text-white font-semibold gap-1"
                  >
                    Confirm Rejection & Release Funds
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Record Settlement Dialog Modal */}
      {settlePayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-card border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/20">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" /> Record Disbursement Settlement Evidence
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{settlePayout.id}</p>
              </div>
              <button
                onClick={() => setSettlePayout(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {settleError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{settleError}</span>
                </div>
              )}

              {/* Payout Summary */}
              <div className="p-3 rounded-xl bg-muted/30 border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Payout to Disburse:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    ${(settlePayout.netAmountCents / 100).toFixed(2)} {settlePayout.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold text-foreground">
                    {settlePayout.method === PayoutMethod.MPESA_B2C ? 'M-Pesa B2C Transfer' : 'Bank Wire / ACH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-mono text-foreground">
                    {(settlePayout.destinationDetails as any).phoneNumber ||
                      (settlePayout.destinationDetails as any).accountNumber}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSettleAction} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">
                    Settlement Evidence / Receipt Ref <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. WIRE-2026-9810 or M-Pesa B2C Receipt NLX88921KL"
                    value={settlementEvidence}
                    onChange={(e) => setSettlementEvidence(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Mandatory verifiable proof of external funds transmission. Cannot be settled without evidence.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Provider Reference (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Safaricom ConversationID or Bank Transaction UUID"
                    value={providerReference}
                    onChange={(e) => setProviderReference(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Settlement Notes (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Cleared via Standard Chartered Treasury Desk"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                  />
                </div>

                {/* Ledger posting notice */}
                <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px]">
                  <strong>Ledger Settlement Impact:</strong> Marking this payout PAID will clear the reserved treasury balance, record the settlement evidence permanently, and write balanced double-entry ledger entries.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSettlePayout(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={settleLoading || !settlementEvidence.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                  >
                    {settleLoading ? 'Posting Settlement...' : 'Confirm & Mark PAID'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automated M-Pesa B2C Execution Modal */}
      {b2cPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-card border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-emerald-600" /> Safaricom Daraja M-Pesa B2C Direct Disbursement
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{b2cPayout.id}</p>
              </div>
              <button
                onClick={() => {
                  setB2cPayout(null);
                  setB2cSuccess(null);
                  setB2cError(null);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {b2cError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{b2cError}</span>
                </div>
              )}

              {/* Separation of Duties Warning */}
              {b2cPayout.requestedBy === currentAdminUserId && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-bold">Separation of Duties Policy Enforced</strong>
                    <span>
                      You requested this withdrawal. Platform policy strictly prohibits an administrator from executing their own disbursement. Another administrator must dispatch this payment.
                    </span>
                  </div>
                </div>
              )}

              {/* Success Result / Simulation Box */}
              {b2cSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" /> B2C Disbursement Request Dispatched Successfully
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>ConversationID: <span className="font-bold">{b2cSuccess.conversationId}</span></div>
                    <div>OriginatorConvID: <span className="font-bold">{b2cSuccess.originatorConversationId}</span></div>
                    <div>Recipient MSISDN: <span className="font-bold">{b2cSuccess.recipientPhone}</span></div>
                    <div>Amount Dispatched: <span className="font-bold text-emerald-600">KES {b2cSuccess.amountKes.toLocaleString()}</span></div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-emerald-500/20">
                    Status moved to <strong>PROCESSING</strong>. Awaiting asynchronous result callback from Safaricom Daraja to finalize settlement.
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSimulateB2CCallback}
                      disabled={b2cLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow"
                    >
                      <Zap className="h-3.5 w-3.5" /> Simulate Successful Callback & Settle
                    </Button>
                  </div>
                </div>
              )}

              {/* Disbursement Parameters Breakdown */}
              <div className="p-3 rounded-xl bg-muted/30 border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient Mobile Number:</span>
                  <span className="font-mono font-bold text-foreground">
                    {(b2cPayout.destinationDetails as any).phoneNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered Recipient Name:</span>
                  <span className="font-semibold text-foreground">
                    {(b2cPayout.destinationDetails as any).accountName || 'Customer'}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">Net Payout (USD):</span>
                  <span className="font-mono font-bold text-foreground">
                    ${(b2cPayout.netAmountCents / 100).toFixed(2)} {b2cPayout.currency}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5 bg-emerald-500/5 p-2 rounded-lg">
                  <span className="font-bold text-foreground">Estimated KES Mobile Disbursement:</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    KES {Math.round((b2cPayout.netAmountCents / 100) * 130).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CommandID Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Safaricom Daraja CommandID:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'BusinessPayment', label: 'BusinessPayment (Default Earnings)' },
                    { id: 'SalaryPayment', label: 'SalaryPayment' }
                  ].map((cmd) => (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => setB2cCommandId(cmd.id as any)}
                      className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                        b2cCommandId === cmd.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-border hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px]">
                <strong>Automated Two-Phase Protocol:</strong> Dispatching sends funds directly from your Safaricom Utility float. Once Safaricom confirms delivery, the payout will be automatically verified and marked PAID. If the network or subscriber rejects the transfer, the reservation will be automatically released back to the organizer's available balance.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setB2cPayout(null);
                    setB2cSuccess(null);
                    setB2cError(null);
                  }}
                >
                  Close
                </Button>
                {!b2cSuccess && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={b2cLoading || b2cPayout.requestedBy === currentAdminUserId}
                    onClick={handleExecuteB2C}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {b2cLoading ? 'Dispatching to Safaricom...' : 'Dispatch B2C Mobile Transfer'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Logs Dialog Modal */}
      {auditPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-card border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/20">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" /> Payout Lifecycle Audit Log
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{auditPayout.id}</p>
              </div>
              <button
                onClick={() => setAuditPayout(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {loadingAudit ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Loading audit records...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">No audit logs recorded.</div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {log.toStatus}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        By <span className="font-mono">{log.performedBy}</span> on{' '}
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      {log.notes && (
                        <div className="p-2 mt-1 rounded bg-muted/40 border text-[11px] text-foreground">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setAuditPayout(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
