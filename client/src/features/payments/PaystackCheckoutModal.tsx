import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Coins,
  Lock,
  Globe2
} from 'lucide-react';
import {
  VotingPackage,
  PaystackInitiatePaymentResponse,
  PaystackVerifyPaymentResponse,
  PaymentTransactionStatus
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface PaystackCheckoutModalProps {
  electionId: string;
  voterCode: string;
  selectedPackage?: VotingPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (creditsAdded: number, receiptNumber: string) => void;
}

type CheckoutStep = 'INPUT' | 'INITIALIZING' | 'CHECKOUT_OPEN' | 'VERIFYING' | 'SUCCESS' | 'FAILED';

export function PaystackCheckoutModal({
  electionId,
  voterCode,
  selectedPackage: initialPackage,
  isOpen,
  onClose,
  onPaymentSuccess
}: PaystackCheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('INPUT');
  const [packages, setPackages] = useState<VotingPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<VotingPackage | null>(initialPackage || null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Paystack Session State
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<PaystackVerifyPaymentResponse | null>(null);
  const [pollCountdown, setPollCountdown] = useState<number>(60);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize modal state on open
  useEffect(() => {
    if (!isOpen) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

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
        // Fallback handled
      }
    };

    fetchPackages();
    setStep('INPUT');
    setErrorMessage(null);
    setEmailError(null);
    setActiveReference(null);
    setAuthUrl(null);
    setVerifyResult(null);
  }, [isOpen, electionId, initialPackage]);

  // Clean up polling timer
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const formatPrice = (pkg: VotingPackage) => {
    if (pkg.currency.toUpperCase() === 'KES') {
      return `KES ${(pkg.priceCents / 100).toLocaleString()}`;
    }
    return `$${(pkg.priceCents / 100).toFixed(2)} ${pkg.currency}`;
  };

  /**
   * 1. Initiate Paystack Checkout
   */
  const handleInitiate = async () => {
    if (!selectedPackage) {
      setErrorMessage('Please select a voting credit package.');
      return;
    }

    if (email.trim() && !email.includes('@')) {
      setEmailError('Please enter a valid email address for receipt delivery.');
      return;
    }

    try {
      setStep('INITIALIZING');
      setErrorMessage(null);

      const res = await apiClient.post<PaystackInitiatePaymentResponse>('/payments/paystack/initiate', {
        electionId,
        packageId: selectedPackage.id,
        voterCode,
        email: email.trim() || undefined,
        currency: selectedPackage.currency
      });

      if (res.data) {
        setActiveReference(res.data.reference);
        setAuthUrl(res.data.authorizationUrl);
        setStep('CHECKOUT_OPEN');

        // Automatically open Paystack checkout window
        const popup = window.open(
          res.data.authorizationUrl,
          'PaystackCheckout',
          'width=500,height=680,menubar=no,toolbar=no,location=no,status=no'
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // Popup blocker triggered; user will use explicit button
        }

        // Start polling for verification
        startPolling(res.data.reference);
      } else {
        throw new Error('Invalid response from payment gateway.');
      }
    } catch (err: unknown) {
      setStep('FAILED');
      setErrorMessage((err as Error).message || 'Failed to initialize Paystack checkout. Please try again.');
    }
  };

  /**
   * 2. Poll for Verification
   */
  const startPolling = (reference: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setPollCountdown(60);

    let attempts = 0;
    pollTimerRef.current = setInterval(async () => {
      attempts++;
      setPollCountdown((prev) => Math.max(0, prev - 2));

      try {
        const res = await apiClient.get<PaystackVerifyPaymentResponse>(`/payments/paystack/verify/${reference}`);
        if (res.data && res.data.status === PaymentTransactionStatus.SUCCESS) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setVerifyResult(res.data);
          setStep('SUCCESS');
          if (onPaymentSuccess && selectedPackage) {
            onPaymentSuccess(selectedPackage.credits, res.data.reference);
          }
        } else if (attempts >= 30) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      } catch {
        // Retry silently on network jitter
      }
    }, 2500);
  };

  /**
   * 3. Manual Verification Trigger
   */
  const handleManualVerify = async () => {
    if (!activeReference) return;
    try {
      setStep('VERIFYING');
      const res = await apiClient.get<PaystackVerifyPaymentResponse>(`/payments/paystack/verify/${activeReference}`);
      if (res.data && res.data.status === PaymentTransactionStatus.SUCCESS) {
        setVerifyResult(res.data);
        setStep('SUCCESS');
        if (onPaymentSuccess && selectedPackage) {
          onPaymentSuccess(selectedPackage.credits, res.data.reference);
        }
      } else {
        setStep('CHECKOUT_OPEN');
        setErrorMessage('Payment has not been completed yet. Please complete checkout or try again.');
      }
    } catch (err: unknown) {
      setStep('CHECKOUT_OPEN');
      setErrorMessage((err as Error).message || 'Unable to verify payment at this time.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 px-2 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> SECURE CHECKOUT
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Cards • Mobile Money • Bank
              </Badge>
            </div>
            <h3 className="font-extrabold text-lg text-foreground mt-1.5">Purchase Voting Credits</h3>
            <p className="text-xs text-muted-foreground">
              Instant credit top-up for your contest ballot
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: INPUT / PACKAGE SELECTION */}
        {step === 'INPUT' && (
          <div className="space-y-4">
            {/* Package Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Select Package Tier:</span>
                {selectedPackage && (
                  <span className="font-mono text-primary font-bold">
                    {selectedPackage.credits} Votes = {formatPrice(selectedPackage)}
                  </span>
                )}
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(packages.length > 0 ? packages : (selectedPackage ? [selectedPackage] : [])).map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedPackage?.id === pkg.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-muted/30 hover:bg-muted/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-foreground">{pkg.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Coins className="h-3 w-3 text-amber-500" />
                        <span>{pkg.credits} Voting Credits</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-foreground">{formatPrice(pkg)}</div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Instant Credit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Input for Receipt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Receipt Email (Optional):</span>
                <span className="text-[10px] text-muted-foreground font-mono">Official e-Receipt</span>
              </label>
              <Input
                type="email"
                placeholder="voter@example.com (or leave blank)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="text-xs bg-muted/30 border-border"
              />
              {emailError && <p className="text-[11px] text-destructive">{emailError}</p>}
            </div>

            {/* Security Callout */}
            <div className="p-3 rounded-xl border border-border bg-muted/40 text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
              <p>
                Payments are securely processed via encrypted checkout. Your financial details never touch Votexa servers.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <Lock className="h-3 w-3 text-primary" />
                <span>Target Ballot Wallet: {voterCode}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="w-1/3 text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleInitiate}
                disabled={!selectedPackage}
                className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20"
              >
                <CreditCard className="h-4 w-4" />
                Pay {selectedPackage ? formatPrice(selectedPackage) : ''}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: INITIALIZING */}
        {step === 'INITIALIZING' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <div className="font-bold text-sm text-foreground">Connecting to Secure Checkout...</div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Preparing your encrypted session for {selectedPackage?.credits} votes.
            </p>
          </div>
        )}

        {/* STEP 3: CHECKOUT WINDOW OPEN / AWAITING PAYMENT */}
        {step === 'CHECKOUT_OPEN' && (
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Globe2 className="h-6 w-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-foreground">Complete Your Payment</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A secure checkout window was opened. If it didn't open automatically, click the button below.
              </p>
            </div>

            {authUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(authUrl, 'PaystackCheckout', 'width=500,height=680')}
                className="w-full text-xs gap-1.5 border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
              >
                <ExternalLink className="h-4 w-4" /> Open Payment Window
              </Button>
            )}

            <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary font-mono text-[11px] font-semibold">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Checking payment status ({pollCountdown}s remaining)...</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Once payment is confirmed, voting credits will be issued immediately to your ballot wallet.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive text-left">
                {errorMessage}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} className="w-1/2 text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleManualVerify}
                className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> I Have Paid
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFYING */}
        {step === 'VERIFYING' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <div className="font-bold text-sm text-foreground">Confirming Payment...</div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Confirming transaction and issuing election credits...
            </p>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="space-y-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h4 className="font-extrabold text-lg text-foreground">Payment Successful!</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {selectedPackage?.credits || verifyResult?.creditsAdded || 0} Voting Credits Added to Your Wallet
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs font-mono text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-bold text-foreground">{verifyResult?.reference || activeReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel:</span>
                <span className="uppercase font-semibold text-foreground">{verifyResult?.channel || 'Online Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">
                  {selectedPackage ? formatPrice(selectedPackage) : `KES ${((verifyResult?.amountCents || 0) / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5">
                <span className="text-muted-foreground">Voter Wallet:</span>
                <span className="text-primary font-bold">{voterCode}</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 shadow-lg shadow-emerald-500/20"
            >
              Continue to Cast Ballot
            </Button>
          </div>
        )}

        {/* STEP 6: FAILED */}
        {step === 'FAILED' && (
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto">
              <XCircle className="h-6 w-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-foreground">Payment Failed or Cancelled</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {errorMessage || 'The payment could not be completed. Your account was not charged.'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="w-1/2 text-xs">
                Close
              </Button>
              <Button
                onClick={() => setStep('INPUT')}
                className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

