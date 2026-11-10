import { useState, type FormEvent } from 'react';
import { PayoutMethod, CreateWithdrawalRequest, OrganizerPayout } from '@votexa/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  X,
  Smartphone,
  Landmark,
  ArrowRight,
  AlertCircle,
  Lock
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceCents: number;
  currency?: string;
  onSuccess: (payout: OrganizerPayout) => void;
}

export function WithdrawalRequestModal({
  isOpen,
  onClose,
  availableBalanceCents,
  currency = 'USD',
  onSuccess
}: WithdrawalRequestModalProps) {
  const [method, setMethod] = useState<PayoutMethod>(PayoutMethod.MPESA_B2C);
  const [amountStr, setAmountStr] = useState<string>('50.00');

  // M-Pesa details
  const [phone, setPhone] = useState<string>('254712345678');
  const [phoneAccountName, setPhoneAccountName] = useState<string>('Dean Alexander Vance');

  // Bank details
  const [bankName, setBankName] = useState<string>('Standard Chartered');
  const [accountName, setAccountName] = useState<string>('Metropolitan University Treasury');
  const [accountNumber, setAccountNumber] = useState<string>('0102938475600');
  const [swiftCode, setSwiftCode] = useState<string>('SCBLKENX');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const amountDollars = parseFloat(amountStr) || 0;
  const amountCents = Math.round(amountDollars * 100);

  // Flat fees in cents
  const feeCents = method === PayoutMethod.MPESA_B2C ? 50 : 150;
  const netAmountCents = Math.max(0, amountCents - feeCents);

  const minWithdrawalCents = 1000; // $10.00
  const isAmountValid = amountCents >= minWithdrawalCents && amountCents <= availableBalanceCents;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amountCents < minWithdrawalCents) {
      setError('Minimum withdrawal amount is $10.00.');
      return;
    }

    if (amountCents > availableBalanceCents) {
      setError(
        `Requested amount ($${(amountCents / 100).toFixed(2)}) exceeds available treasury balance ($${(
          availableBalanceCents / 100
        ).toFixed(2)}).`
      );
      return;
    }

    // Build payload
    const payload: CreateWithdrawalRequest = {
      amountCents,
      method,
      currency,
      destinationDetails:
        method === PayoutMethod.MPESA_B2C
          ? {
              phoneNumber: phone.trim(),
              accountName: phoneAccountName.trim()
            }
          : {
              bankName: bankName.trim(),
              accountName: accountName.trim(),
              accountNumber: accountNumber.trim(),
              swiftCode: swiftCode.trim() || undefined
            }
    };

    try {
      setLoading(true);
      const res = await apiClient.post<OrganizerPayout>('/payouts/request', payload);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to submit withdrawal request.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while submitting withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl overflow-hidden relative">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/20">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" /> Request Organiser Withdrawal
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Two-phase reservation: Available treasury is held until administrative review and settlement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Treasury Balance Banner */}
          <div className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block font-medium">Available Balance</span>
              <span className="text-lg font-black text-emerald-600">
                ${(availableBalanceCents / 100).toFixed(2)} {currency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block font-medium">Minimum Request</span>
              <span className="font-semibold text-foreground">$10.00 {currency}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Withdrawal Amount ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="10.00"
                  max={(availableBalanceCents / 100).toString()}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="pl-7 font-mono font-bold text-base"
                  placeholder="0.00"
                  required
                />
              </div>
              {!isAmountValid && (
                <p className="text-[11px] text-destructive">
                  Amount must be between $10.00 and ${(availableBalanceCents / 100).toFixed(2)}.
                </p>
              )}
            </div>

            {/* Method selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Disbursement Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod(PayoutMethod.MPESA_B2C)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                    method === PayoutMethod.MPESA_B2C
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <Smartphone
                    className={`h-4 w-4 mt-0.5 ${
                      method === PayoutMethod.MPESA_B2C ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs">M-Pesa B2C</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Kenyan Mobile Wallet ($0.50 Fee)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod(PayoutMethod.BANK_TRANSFER)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors ${
                    method === PayoutMethod.BANK_TRANSFER
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <Landmark
                    className={`h-4 w-4 mt-0.5 ${
                      method === PayoutMethod.BANK_TRANSFER ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs">Bank Wire Transfer</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Direct ACH / Wire ($1.50 Fee)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Destination fields */}
            {method === PayoutMethod.MPESA_B2C ? (
              <div className="space-y-3 p-3 rounded-xl bg-muted/20 border text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">M-Pesa Phone Number (MSISDN)</label>
                  <Input
                    type="text"
                    placeholder="254712345678 or 0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Formats supported: 2547XXXXXXXX or 07XXXXXXXX</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Registered Recipient Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Dean Alexander Vance"
                    value={phoneAccountName}
                    onChange={(e) => setPhoneAccountName(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl bg-muted/20 border text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Bank Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Standard Chartered"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">SWIFT / BIC Code</label>
                    <Input
                      type="text"
                      placeholder="e.g. SCBLKENX"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Account Holder Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Metropolitan University Student Council"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Bank Account Number / IBAN</label>
                  <Input
                    type="text"
                    placeholder="e.g. 0102938475600"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="p-3 rounded-xl bg-card border divide-y text-xs space-y-1.5">
              <div className="flex justify-between text-muted-foreground pb-1">
                <span>Gross Requested:</span>
                <span className="font-mono font-semibold">${(amountCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground py-1">
                <span>Disbursement Processing Fee:</span>
                <span className="font-mono font-semibold">-${(feeCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1.5 text-foreground">
                <span>Net Estimated Disbursement:</span>
                <span className="font-mono text-emerald-600 text-sm">
                  ${(netAmountCents / 100).toFixed(2)} {currency}
                </span>
              </div>
            </div>

            {/* Two-Phase Guarantee Callout */}
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-start gap-2 text-[11px]">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Two-Phase Reservation Guarantee:</strong> Funds will be reserved from your available balance immediately and held safely. If the request is rejected or cancelled, funds are returned immediately to your available balance.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !isAmountValid || amountCents <= 0}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? 'Reserving Funds...' : 'Submit Withdrawal Request'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
