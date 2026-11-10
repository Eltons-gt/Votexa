import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Coins
} from 'lucide-react';
import {
  VotingPackage,
  MpesaInitiatePaymentResponse,
  MpesaPaymentStatusResponse,
  PaymentTransactionStatus
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface MpesaCheckoutModalProps {
  electionId: string;
  voterCode: string;
  selectedPackage?: VotingPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (creditsAdded: number, receiptNumber: string) => void;
}

type CheckoutStep = 'INPUT' | 'PENDING' | 'SUCCESS' | 'FAILED';

export function MpesaCheckoutModal({
  electionId,
  voterCode,
  selectedPackage: initialPackage,
  isOpen,
  onClose,
  onPaymentSuccess
}: MpesaCheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('INPUT');
  const [packages, setPackages] = useState<VotingPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<VotingPackage | null>(initialPackage || null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Polling State
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<MpesaPaymentStatusResponse | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Fetch packages if not pre-selected
  useEffect(() => {
    if (!isOpen) return;

    if (initialPackage) {
      setSelectedPackage(initialPackage);
    }

    const fetchPackages = async () => {
      try {
        const res = await apiClient.get<VotingPackage[]>(`/voting/packages/${electionId}`);
        if (res.data && res.data.length > 0) {
          setPackages(res.data);
          if (!initialPackage) {
            setSelectedPackage(res.data[0] || null);
          }
        }
      } catch {
        // Fallback default
      }
    };

    fetchPackages();
    setStep('INPUT');
    setErrorMessage(null);
    setPhoneError(null);
  }, [isOpen, electionId, initialPackage]);

  // Phone number validator
  const validateKenyanPhone = (input: string): boolean => {
    const cleaned = input.replace(/[\s\-\+\(\)]/g, '');
    let normalized = cleaned;
    if (cleaned.startsWith('0')) {
      normalized = '254' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      normalized = '254' + cleaned;
    }
    const kenyaMsisdnRegex = /^254(7|1)\d{8}$/;
    return kenyaMsisdnRegex.test(normalized);
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    if (phoneError) setPhoneError(null);
  };

  // Convert USD / KES cents to display KES
  const calculateKes = (priceCents: number, currency: string) => {
    if (currency.toUpperCase() === 'KES') {
      return Math.round(priceCents / 100);
    }
    return Math.round((priceCents / 100) * 130);
  };

  // 1. Submit STK Push Request
  const handleInitiateSTK = async () => {
    if (!selectedPackage) {
      setErrorMessage('Please select a voting package first.');
      return;
    }

    if (!phoneNumber.trim()) {
      setPhoneError('Please enter your Safaricom M-Pesa phone number.');
      return;
    }

    if (!validateKenyanPhone(phoneNumber)) {
      setPhoneError('Invalid phone number. Format: 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post<MpesaInitiatePaymentResponse>('/payments/initiate', {
        electionId,
        packageId: selectedPackage.id,
        voterCode,
        phoneNumber: phoneNumber.trim()
      });

      if (res.data?.paymentId) {
        setActivePaymentId(res.data.paymentId);
        setStep('PENDING');
        setCountdown(60);
      } else {
        throw new Error(res.error?.message || 'Failed to initiate M-Pesa STK Push');
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to initiate M-Pesa payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Poll payment status when in PENDING step
  useEffect(() => {
    if (step !== 'PENDING' || !activePaymentId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get<MpesaPaymentStatusResponse>(`/payments/${activePaymentId}`);
        if (!isSubscribed) return;

        if (res.data) {
          setPollStatus(res.data);

          if (res.data.status === PaymentTransactionStatus.SUCCESS) {
            clearInterval(interval);
            setStep('SUCCESS');
            if (onPaymentSuccess) {
              onPaymentSuccess(res.data.credits, res.data.mpesaReceiptNumber || 'MPESA-OK');
            }
          } else if (res.data.status === PaymentTransactionStatus.FAILED) {
            clearInterval(interval);
            setStep('FAILED');
            setErrorMessage(res.data.resultDesc || 'Payment was cancelled or rejected.');
          }
        }
      } catch {
        // Polling retry
      }
    }, 2500);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(timer);
          setStep('FAILED');
          setErrorMessage('Payment request timed out. Please verify your phone has signal and try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [step, activePaymentId, onPaymentSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] tracking-wide uppercase px-2 py-0.5">
                M-Pesa Express
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Daraja API
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mt-1">
              <Smartphone className="h-5 w-5 text-emerald-600" /> Pay with Safaricom M-Pesa
            </h3>
            <p className="text-xs text-muted-foreground">
              Official instant mobile money top-up for election voting credits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && step !== 'FAILED' && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: INPUT PHONE & SELECT PACKAGE */}
        {step === 'INPUT' && (
          <div className="space-y-5">
            {/* Package Selector */}
            {packages.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Select Voting Package</label>
                <div className="space-y-2">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const kesAmount = calculateKes(pkg.priceCents, pkg.currency);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-600'
                            : 'border-border hover:border-muted-foreground/30 bg-muted/20'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-foreground">{pkg.name}</span>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-black text-emerald-600 text-sm">{pkg.credits}</span> Credits
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-foreground">
                            KES {kesAmount.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            (${ (pkg.priceCents / 100).toFixed(2) } {pkg.currency})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Safaricom Phone Number (Registered for M-Pesa)
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="e.g. 0712 345 678 or 2547XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`pl-9 font-mono ${phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {phoneError}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  A payment prompt will automatically appear on this phone.
                </p>
              )}
            </div>

            {/* Authoritative Price Review */}
            {selectedPackage && (
              <div className="p-3 rounded-xl bg-muted/40 border text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Voting Credits to Receive:</span>
                  <span className="font-bold text-foreground">+{selectedPackage.credits} Credits</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Election Scope:</span>
                  <span className="font-mono text-foreground">{electionId.substring(0, 14)}...</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-bold text-foreground">
                  <span>Total Amount (M-Pesa):</span>
                  <span className="text-emerald-600 font-black text-sm">
                    KES {calculateKes(selectedPackage.priceCents, selectedPackage.currency).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="w-1/3">
                Cancel
              </Button>
              <Button
                onClick={handleInitiateSTK}
                disabled={isSubmitting || !selectedPackage}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending STK Push...
                  </>
                ) : (
                  <>
                    Send M-Pesa Prompt <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PENDING / USSD PIN ENTRY */}
        {step === 'PENDING' && (
          <div className="py-6 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="rounded-full bg-emerald-500/10 p-5 border border-emerald-500/30">
                <Smartphone className="h-10 w-10 text-emerald-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-foreground">Check Your Phone</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                An M-Pesa STK payment prompt has been sent to{' '}
                <span className="font-bold text-foreground font-mono">{phoneNumber}</span>.
                Enter your M-Pesa PIN on your phone to complete the transaction.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border text-xs flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Awaiting confirmation...
              </span>
              <span className="font-mono font-bold text-foreground">{countdown}s</span>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Direct Safaricom Daraja secure payment channel
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESSFUL PAYMENT */}
        {step === 'SUCCESS' && (
          <div className="py-4 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
                Payment Verified
              </Badge>
              <h4 className="text-lg font-black text-foreground">Credits Added to Wallet!</h4>
              <p className="text-xs text-muted-foreground">
                Your M-Pesa transaction was verified and voting credits were issued immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">M-Pesa Receipt:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {pollStatus?.mpesaReceiptNumber || 'MPESA-VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Credited:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" /> +{pollStatus?.credits || selectedPackage?.credits} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-mono text-foreground font-bold">
                  KES {selectedPackage ? calculateKes(selectedPackage.priceCents, selectedPackage.currency).toLocaleString() : '---'}
                </span>
              </div>
              <div className="flex justify-between border-t border-emerald-500/20 pt-2">
                <span className="text-muted-foreground">Voter Wallet:</span>
                <span className="font-mono text-foreground font-bold">{voterCode}</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Continue to Voting Ballot
            </Button>
          </div>
        )}

        {/* STEP 4: PAYMENT FAILED */}
        {step === 'FAILED' && (
          <div className="py-4 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-1">
              <Badge variant="destructive" className="text-xs font-bold uppercase tracking-wider">
                Payment Incomplete
              </Badge>
              <h4 className="text-base font-bold text-foreground">M-Pesa Transaction Failed</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {errorMessage || 'The payment could not be completed. No credits have been deducted.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border text-xs text-left space-y-1">
              <span className="font-semibold text-foreground">Common reasons:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                <li>Prompt was cancelled or dismissed on your phone</li>
                <li>Incorrect M-Pesa PIN entered</li>
                <li>Insufficient M-Pesa balance</li>
                <li>Safaricom SIM toolkit timeout</li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="w-1/2">
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep('INPUT');
                  setErrorMessage(null);
                }}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
