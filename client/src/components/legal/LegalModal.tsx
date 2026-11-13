import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Shield,
  ShieldCheck,
  Scale,
  Printer,
  Search,
  X,
  Lock
} from 'lucide-react';

export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export function LegalModal({
  isOpen,
  onClose,
  initialTab = 'terms'
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <Card className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col border border-border shadow-2xl bg-card overflow-hidden">
        {/* Modal Top Header */}
        <CardHeader className="p-4 sm:p-6 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                {activeTab === 'terms' ? (
                  <Scale className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {activeTab === 'terms' ? 'Votexa Terms of Service' : 'Votexa Privacy Policy'}
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span>Last Updated: November 13, 2026</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    KDPA & GDPR Compliant
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="hidden sm:flex text-xs h-8 gap-1.5 border-border"
                title="Print Document"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tab Switcher & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-2">
            <div className="inline-flex rounded-xl bg-muted p-1 border border-border shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'terms'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'privacy'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Privacy Policy
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search legal sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-card"
              />
            </div>
          </div>
        </CardHeader>

        {/* Modal Scrollable Content Area */}
        <CardContent className="p-4 sm:p-8 overflow-y-auto space-y-6 text-xs text-muted-foreground leading-relaxed">
          {activeTab === 'terms' ? (
            /* =========================================================
               TERMS OF SERVICE CONTENT
            ========================================================= */
            <div className="space-y-6 text-foreground">
              {/* Highlight Overview Callout */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                  <Scale className="h-4 w-4 text-primary" /> Key Principles of Votexa Terms
                </div>
                <p className="text-muted-foreground">
                  By using Votexa, you agree to fair, transparent voting. Institutional governance elections are strictly 100% free and one-person-one-vote. Paid audience competitions allow vote packages via verified payment gateways (M-Pesa and Paystack) with transparent 40/60 commercial revenue splits and strict anti-botting integrity protections.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">1</span>
                  Eligibility & Organization Accounts
                </h3>
                <p className="text-muted-foreground">
                  To register an organizer workspace or configure paid voting competitions on Votexa, you must be at least 18 years of age or possess legal corporate authority. Organizers registering on behalf of educational institutions, professional unions, corporations, or media producers represent that they have binding authorization. You are responsible for safeguarding your credentials and session tokens.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">2</span>
                  Election Categories & Universal Voting Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
                    <div className="font-bold text-foreground text-xs">Institutional Elections</div>
                    <p className="text-[11px] text-muted-foreground">Strict One Person, One Vote. Zero voter fees. Permitted domain access controls (e.g. @university.edu). Secret ballot isolation.</p>
                  </div>
                  <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
                    <div className="font-bold text-foreground text-xs">Paid Competitions</div>
                    <p className="text-[11px] text-muted-foreground">Audience talent showcases & pageants. Multiple voting allowed up to organizer cap. Packages powered by M-Pesa & Paystack.</p>
                  </div>
                  <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
                    <div className="font-bold text-foreground text-xs">Public Polls</div>
                    <p className="text-[11px] text-muted-foreground">Open audience participation with automatic rate limiting, bot mitigation, and public link/QR code distribution.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">3</span>
                  Payments, Commercial Revenue Share & Payouts
                </h3>
                <p className="text-muted-foreground">
                  Paid voting packages are processed via licensed payment service providers (Paystack and Safaricom M-Pesa). Votexa never stores raw card details or personal mobile money PINs.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><strong>Standard Commercial Split:</strong> In paid voting contests, net revenue is apportioned 60% to the verified Organizer Treasury and 40% to Votexa Platform Infrastructure & Security.</li>
                  <li><strong>Credit Wallets:</strong> Voting credits purchased for a contest apply solely to that specific event and have no independent cash surrender value.</li>
                  <li><strong>Disbursements & Payouts:</strong> Organizers may withdraw settled balances via automated mobile money (M-Pesa B2C) or electronic bank transfer. Votexa may impose a routine anti-fraud verification period of up to 72 hours before disbursement.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">4</span>
                  Electoral Integrity & Prohibited Conduct
                </h3>
                <p className="text-muted-foreground">
                  Votexa enforces zero tolerance for electoral fraud and abuse. The following activities are strictly prohibited:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Using automated scripts, bots, headless browsers, or click farms to inflate vote tallies.</li>
                  <li>Purchasing, selling, or coercing voter authorization tokens or institutional logins.</li>
                  <li>Operating paid contests as an unlicensed lottery, raffle, or illegal gambling scheme.</li>
                  <li>Uploading candidate materials containing defamation, hate speech, obscenity, or copyright infringement.</li>
                  <li>Attempting to probe, decompile, or compromise Votexa’s APIs or cryptographic tally validation.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">5</span>
                  Secret Ballot Guarantee & Receipts
                </h3>
                <p className="text-muted-foreground">
                  When casting a vote, voter identity is decoupled from candidate selection through cryptographic single-use authorization tokens. Every voter receives a tamper-evident cryptographic receipt code confirming their ballot was cast without disclosing their choice to any third party.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">6</span>
                  Liability, Dispute Resolution & Governing Law
                </h3>
                <p className="text-muted-foreground">
                  Votexa is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, Votexa’s liability is limited to the fees collected from the organizer account in the preceding 3 months. These Terms are governed by the laws of the Republic of Kenya. Any unresolved disputes shall be settled through binding arbitration under the Nairobi Centre for International Arbitration (NCIA) rules.
                </p>
              </div>
            </div>
          ) : (
            /* =========================================================
               PRIVACY POLICY CONTENT
            ========================================================= */
            <div className="space-y-6 text-foreground">
              {/* Highlight Callout */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                  <Lock className="h-4 w-4 text-emerald-500" /> Fundamental Secret Ballot Principle
                </div>
                <p className="text-muted-foreground">
                  At Votexa, your vote is secret. We use single-use cryptographic authorization tokens to decouple your personal identity, email address, and phone number from your ballot selections. No organizer, employer, or administrator can ever see who you voted for.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">1</span>
                  Information We Collect
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><strong>Organizers & Admins:</strong> Full name, verified email, organization title, password hash, and payout credentials (M-Pesa disbursement number or verified bank account).</li>
                  <li><strong>Candidates:</strong> Name, photograph, position, and bio/manifesto submitted by the organizing committee.</li>
                  <li><strong>Voters:</strong> Voter email address or ID code strictly for eligibility verification; security telemetry (IP address and timestamp) strictly for bot and DDoS mitigation.</li>
                  <li><strong>Payments:</strong> Transaction amount, currency, and gateway transaction reference. <em>We never receive or store raw card numbers, CVVs, or M-Pesa PINs.</em></li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">2</span>
                  How We Use Your Personal Data
                </h3>
                <p className="text-muted-foreground">
                  We process personal data under lawful bases recognized by the <strong>Kenya Data Protection Act, 2019 (KDPA)</strong> and the <strong>GDPR</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Validating voter eligibility and preventing duplicate voting attempts.</li>
                  <li>Processing paid voting packages and crediting organizer earnings.</li>
                  <li>Providing tamper-evident audit trails and official contest summaries.</li>
                  <li>Detecting unauthorized bot attacks and credential stuffing attempts.</li>
                </ul>
                <p className="text-muted-foreground font-semibold pt-1">
                  We never sell, rent, or trade your personal data or voter records to advertising networks or third-party data brokers.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">3</span>
                  Security & Data Encryption
                </h3>
                <p className="text-muted-foreground">
                  All communication between your device and Votexa is secured with modern <strong>TLS 1.3</strong> transport encryption. Database records and credentials are encrypted at rest using <strong>AES-256</strong>. Password verification relies on salted one-way HMAC-SHA256 cryptographic hashing.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">4</span>
                  Your Privacy Rights & Account Deletion
                </h3>
                <p className="text-muted-foreground">
                  Under the KDPA 2019 and GDPR, you have the right to access your personal data, rectify inaccuracies, request data portability, and permanently delete your account. You can permanently delete your account at any time via <strong>Settings &gt; Delete Account</strong>.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono">5</span>
                  Data Protection Officer & Inquiries
                </h3>
                <p className="text-muted-foreground">
                  If you have inquiries or wish to exercise your data subject rights, please contact our Data Protection Team at <a href="mailto:privacy@votexa.io" className="text-primary hover:underline font-semibold">privacy@votexa.io</a> or write to Votexa Inc., Data Protection Office, Nairobi, Kenya.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-muted-foreground">
            © 2026 Votexa Inc. Enterprise Multi-Tenant Voting & Elections Platform.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
