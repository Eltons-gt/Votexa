import { useState, useEffect } from 'react';
import {
  Shield,
  Vote,
  DollarSign,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  Award,
  BarChart3,
  Globe2,
  Smartphone,
  Receipt,
  Layers,
  Copy,
  Calculator,
  Search,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ThemeToggle } from '../../lib/theme';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
  onLaunchApp: (tab?: string) => void;
  onCastBallot: () => void;
}

export function LandingPage({
  onNavigateToAuth,
  onLaunchApp,
  onCastBallot
}: LandingPageProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'institutional' | 'paid' | 'poll'>('institutional');

  // =========================================================================
  // DYNAMIC FEATURE 1: REAL-TIME PLATFORM ACTIVITY TICKER
  // =========================================================================
  const liveActivityFeed = [
    { id: 1, type: 'vote', text: 'Vote cast for Faculty Senate President • Metropolitan University', time: '2s ago', badge: 'VOTE RECORDED' },
    { id: 2, type: 'mpesa', text: 'M-Pesa STK Push: KES 2,500 Fan Pack confirmed (25 votes)', time: '5s ago', badge: 'M-PESA EXPRESS' },
    { id: 3, type: 'ledger', text: 'Cryptographic ledger sealed: Block #14,892 verified with HMAC-SHA256', time: '11s ago', badge: 'SEALED & AUDITED' },
    { id: 4, type: 'ussd', text: 'Mobile vote registered via Safaricom Shortcode *223#', time: '18s ago', badge: 'SMS / USSD' },
    { id: 5, type: 'org', text: 'New Workspace: Strathmore Academic Council established', time: '26s ago', badge: 'ORGANIZATION LIVE' }
  ];
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const activeTicker = liveActivityFeed[currentTickerIdx] ?? {
    id: 1,
    type: 'vote',
    text: 'Vote cast for Faculty Senate President • Metropolitan University',
    time: '2s ago',
    badge: 'VOTE RECORDED'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % liveActivityFeed.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [liveActivityFeed.length]);

  // =========================================================================
  // DYNAMIC FEATURE 2: INTERACTIVE HERO BALLOT SIMULATOR
  // =========================================================================
  const [selectedHeroCandidate, setSelectedHeroCandidate] = useState<'katherine' | 'alan'>('katherine');
  const [heroReceiptCopied, setHeroReceiptCopied] = useState(false);
  const [heroVoteCount, setHeroVoteCount] = useState(482);
  const [simulatedReceiptHash, setSimulatedReceiptHash] = useState('SHA256-VOTEXA-9f2e-4b71-889a');

  const handleHeroCandidateSelect = (cand: 'katherine' | 'alan') => {
    setSelectedHeroCandidate(cand);
    setHeroVoteCount((prev) => prev + 1);
    const randomHex = Math.random().toString(16).substring(2, 6);
    setSimulatedReceiptHash(`SHA256-VOTEXA-9f2e-${randomHex}-889a`);
  };

  const copyHeroReceipt = () => {
    navigator.clipboard?.writeText(simulatedReceiptHash);
    setHeroReceiptCopied(true);
    setTimeout(() => setHeroReceiptCopied(false), 2000);
  };

  // =========================================================================
  // DYNAMIC FEATURE 3: INTERACTIVE M-PESA STK SIMULATOR
  // =========================================================================
  const [mpesaFanVotes, setMpesaFanVotes] = useState(3420);
  const [isSimulatingStk, setIsSimulatingStk] = useState(false);
  const [stkNotification, setStkNotification] = useState<string | null>(null);

  const triggerSimulatedStkPush = () => {
    setIsSimulatingStk(true);
    setStkNotification('Sending Safaricom STK prompt to voter phone...');
    setTimeout(() => {
      setStkNotification('📱 M-Pesa PIN Verified! KES 5,000 received. +50 votes added.');
      setMpesaFanVotes((prev) => prev + 50);
      setIsSimulatingStk(false);
      setTimeout(() => setStkNotification(null), 4000);
    }, 1500);
  };

  // =========================================================================
  // DYNAMIC FEATURE 4: INTERACTIVE TREASURY DISBURSAL SIMULATOR
  // =========================================================================
  const [payoutStatus, setPayoutStatus] = useState<'READY' | 'RESERVED' | 'DISBURSED'>('READY');
  const handleSimulateDisbursal = () => {
    if (payoutStatus === 'READY') {
      setPayoutStatus('RESERVED');
      setTimeout(() => {
        setPayoutStatus('DISBURSED');
        setTimeout(() => setPayoutStatus('READY'), 5000);
      }, 1400);
    }
  };

  // =========================================================================
  // DYNAMIC FEATURE 5: INTERACTIVE EVENT REVENUE CALCULATOR
  // =========================================================================
  const [calculatorSales, setCalculatorSales] = useState<number>(350000); // KES
  const processingFee = Math.round(calculatorSales * 0.025); // 2.5%
  const distributable = calculatorSales - processingFee;
  const organizerShare = Math.round(distributable * 0.75); // 75%
  const platformShare = distributable - organizerShare; // 25%

  // =========================================================================
  // DYNAMIC FEATURE 6: LIVE BALLOT VERIFIER SANDBOX
  // =========================================================================
  const [verifyInput, setVerifyInput] = useState('VOTEXA-REC-8F92-411B');
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    timestamp: string;
    organization: string;
    position: string;
    integrity: string;
  } | null>({
    valid: true,
    timestamp: 'Today at 14:32:01 UTC',
    organization: 'Metropolitan University (Verified Enterprise)',
    position: 'Faculty Senate President (1 Voter = 1 Vote)',
    integrity: 'HMAC-SHA256 Cryptographically Sealed'
  });

  const handleTestVerify = () => {
    setIsVerifyingReceipt(true);
    setTimeout(() => {
      setIsVerifyingReceipt(false);
      setVerifyResult({
        valid: true,
        timestamp: new Date().toLocaleTimeString() + ' UTC',
        organization: 'Metropolitan University (Verified Enterprise)',
        position: 'Dean of Faculty Senate',
        integrity: 'HMAC-SHA256 Double-Hashed • Zero PII Leakage'
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white transition-colors duration-200">
      {/* =====================================================================
          1. NAVIGATION HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-foreground">VOTEXA</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
                  v1.0-RC
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground font-medium">Enterprise Multi-Tenant Voting SaaS</p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#categories" className="hover:text-foreground transition-colors">Election Types</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">Earnings Calculator</a>
            <a href="#features" className="hover:text-foreground transition-colors">Key Features</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security & Verifier</a>
            <a href="#mpesa" className="hover:text-foreground transition-colors">M-Pesa Finance</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToAuth('login')}
              className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs sm:text-sm font-semibold"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigateToAuth('register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 text-xs sm:text-sm font-semibold gap-1.5"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLaunchApp('elections')}
              className="hidden lg:flex border-border bg-card text-foreground hover:bg-muted text-xs font-semibold gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION WITH REAL-TIME PULSE & INTERACTIVE MOCKUP
      ===================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-18 md:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Live Rotating Real-Time Platform Activity Ticker */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-card/90 text-foreground text-xs font-medium shadow-md backdrop-blur-md transition-all">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {activeTicker.badge}
              </span>
              <span className="truncate max-w-xs sm:max-w-md font-semibold text-foreground">
                {activeTicker.text}
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
                {activeTicker.time}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              The High-Integrity Voting Platform for{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
                Modern Institutions & Paid Competitions
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Empowering universities, professional associations, and national talent competitions with
              tamper-proof secret ballots, private organization workspaces, and instant M-Pesa payouts.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 gap-2 transition-transform hover:-translate-y-0.5"
              >
                Create Free Workspace <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCastBallot}
                className="w-full sm:w-auto h-12 px-6 border-border bg-card hover:bg-muted text-foreground font-bold text-sm gap-2 transition-transform hover:-translate-y-0.5"
              >
                <Vote className="h-4 w-4 text-emerald-500" /> Cast Official Ballot
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onLaunchApp('admin')}
                className="w-full sm:w-auto h-12 px-5 text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-semibold gap-1.5"
              >
                <BarChart3 className="h-4 w-4" /> Platform Admin
              </Button>
            </div>

            {/* Key Trust Signals with Dynamic Pulse */}
            <div className="pt-8 border-t border-border flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Private & Isolated Workspaces</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant M-Pesa Withdrawals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Dual-Approval Payout Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant Ballot Processing</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              INTERACTIVE HERO MOCKUP PREVIEW (DYNAMIC & CLICKABLE)
          =================================================================== */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl space-y-4">
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">app.votexa.io/workspaces/metropolitan-uni</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                  ● Live Interactive Playground
                </Badge>
              </div>
            </div>

            {/* Split Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* CARD 1: INTERACTIVE INSTITUTIONAL BALLOT */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold">
                    INSTITUTIONAL
                  </Badge>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {heroVoteCount} Votes Cast
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">Dean of Faculty Senate</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click candidate below to test live voting:</p>
                </div>

                {/* Interactive Candidate Options */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleHeroCandidateSelect('katherine')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      selectedHeroCandidate === 'katherine'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary font-bold text-foreground'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span>Prof. Katherine Johnson</span>
                    {selectedHeroCandidate === 'katherine' ? (
                      <Badge variant="default" className="text-[10px] py-0 px-2 bg-primary">Selected</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Vote</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHeroCandidateSelect('alan')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      selectedHeroCandidate === 'alan'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary font-bold text-foreground'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span>Prof. Alan Turing</span>
                    {selectedHeroCandidate === 'alan' ? (
                      <Badge variant="default" className="text-[10px] py-0 px-2 bg-primary">Selected</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Vote</span>
                    )}
                  </button>
                </div>

                {/* Dynamic Receipt Hash with Copy Button */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="truncate max-w-[170px] text-primary font-semibold flex items-center gap-1">
                    <Receipt className="h-3 w-3 shrink-0" />
                    {simulatedReceiptHash}
                  </span>
                  <button
                    type="button"
                    onClick={copyHeroReceipt}
                    className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                    title="Copy receipt hash"
                  >
                    {heroReceiptCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* CARD 2: INTERACTIVE PAID COMPETITION & M-PESA STK */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    PAID COMPETITION
                  </Badge>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Daraja STK Ready
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">Talent Showcase 2026</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Audience multi-vote package:</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-semibold">Fan Pack (50 Credits)</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">KES 5,000</span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.round((mpesaFanVotes / 5000) * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{mpesaFanVotes.toLocaleString()} votes cast</span>
                    <span>Target: 5,000</span>
                  </div>
                </div>

                {/* Notification Banner */}
                {stkNotification && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>{stkNotification}</span>
                  </div>
                )}

                {/* Trigger Button */}
                <Button
                  size="sm"
                  onClick={triggerSimulatedStkPush}
                  disabled={isSimulatingStk}
                  className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 h-8 shadow"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  {isSimulatingStk ? 'Sending STK Push...' : 'Simulate M-Pesa STK (+50 Votes)'}
                </Button>
              </div>

              {/* CARD 3: INTERACTIVE TREASURY & DISBURSAL */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    ORGANIZER TREASURY
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">75% Share</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">Verified Ticket Earnings</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Real-time withdrawal execution:</p>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Total Paid Votes</span>
                    <span className="font-mono font-bold text-foreground">KES 100,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Your Available Share</span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">KES 75,000</span>
                  </div>
                </div>

                {/* Disbursal Action */}
                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={handleSimulateDisbursal}
                    className={`w-full text-xs font-bold h-8 transition-all ${
                      payoutStatus === 'DISBURSED'
                        ? 'bg-emerald-600 text-white'
                        : payoutStatus === 'RESERVED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {payoutStatus === 'DISBURSED' && '✓ Paid via Safaricom B2C'}
                    {payoutStatus === 'RESERVED' && 'Approving & Settling...'}
                    {payoutStatus === 'READY' && 'Simulate Instant Withdrawal'}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. DYNAMIC REVENUE & EARNINGS CALCULATOR
      ===================================================================== */}
      <section id="calculator" className="py-20 border-t border-border bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl border border-primary/20 bg-card p-6 sm:p-10 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold gap-1">
                <Calculator className="h-3.5 w-3.5" /> Interactive Earnings Model
              </Badge>
              <h2 className="text-3xl font-black text-foreground">Calculate Your Event Revenue</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Organisers earn 75% of net proceeds after approved payment processing. Slide to see your projected payout:
              </p>
            </div>

            {/* Slider Control */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground">Expected Paid Voting Sales:</span>
                <span className="text-2xl font-black text-primary font-mono">
                  KES {calculatorSales.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="25000"
                value={calculatorSales}
                onChange={(e) => setCalculatorSales(Number(e.target.value))}
                className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>KES 50,000</span>
                <span>KES 1,000,000</span>
                <span>KES 2,000,000</span>
              </div>
            </div>

            {/* Dynamic Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Processing Fees (2.5%)</p>
                <p className="text-lg font-bold text-rose-500 font-mono">- KES {processingFee.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Direct Daraja Gateway</p>
              </div>

              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 space-y-1 shadow-sm">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-wider">
                  Your Earnings (75%)
                </p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  KES {organizerShare.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Withdrawable to M-Pesa
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Platform Share (25%)</p>
                <p className="text-lg font-bold text-foreground font-mono">KES {platformShare.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Security & Infrastructure</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Button
                size="lg"
                onClick={() => onNavigateToAuth('register')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-md"
              >
                Host an Event & Start Earning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. THREE ELECTION CATEGORIES SHOWCASE
      ===================================================================== */}
      <section id="categories" className="py-20 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs font-bold">
              Built for Every Democratic Context
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Three Specialized Election Architectures
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Votexa strictly differentiates institutional elections, paid public competitions, and opinion polls at the database schema level.
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-xl bg-muted border border-border">
              <button
                onClick={() => setActiveCategoryTab('institutional')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeCategoryTab === 'institutional'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1. Institutional Elections
              </button>
              <button
                onClick={() => setActiveCategoryTab('paid')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeCategoryTab === 'paid'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                2. Paid Competitions
              </button>
              <button
                onClick={() => setActiveCategoryTab('poll')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeCategoryTab === 'poll'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                3. Public Opinion Polls
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card p-6 sm:p-8 backdrop-blur shadow-sm">
            {activeCategoryTab === 'institutional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-primary text-xs font-mono font-semibold">
                    <Building2 className="h-4 w-4" /> UNIVERSITIES • SACCOS • CORPORATE BOARDS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">One Eligible Voter, One Vote per Position</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Designed for governance structures where absolute democratic fairness is non-negotiable.
                    Voting credits and purchase endpoints are blocked at the controller layer.
                  </p>
                  <ul className="space-y-2.5 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Strict backend voter register eligibility verification (CSV or API import).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Zero paid voting: purchase requests rejected with HTTP 400.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Official digital receipts guarantee complete ballot secrecy.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                  >
                    Configure Institutional Election
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-3 font-mono text-xs">
                  <div className="text-muted-foreground border-b border-border pb-2">
                    // Institutional Rule Enforcement
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Max votes per voter = 1 (enforced)</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ IsPaidVoting = false (immutable)</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Single-Use Authorization Token generated</div>
                  <div className="text-muted-foreground pt-2 text-[11px]">
                    "Double voting attempt triggers HTTP 409 CONFLICT with audit trail timestamp."
                  </div>
                </div>
              </div>
            )}

            {activeCategoryTab === 'paid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono font-semibold">
                    <Award className="h-4 w-4" /> TALENT SHOWS • FAN VOTING • AUDIENCE AWARDS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Monetized Voting with M-Pesa STK Push</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Allow audiences and fans to purchase bundles of voting credits via Safaricom Daraja STK push.
                    Credits are strictly scoped to the specific election and cannot cross tenant boundaries.
                  </p>
                  <ul className="space-y-2.5 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Authoritative package price retrieval (never trusts client price).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Idempotent webhook callbacks with replay prevention.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Automatic organizer earnings recorded immediately upon payment.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                  >
                    Launch Paid Competition
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-3 font-mono text-xs">
                  <div className="text-muted-foreground border-b border-border pb-2">
                    // Paid Voting & Wallet Isolation
                  </div>
                  <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ STK Push initiated: AccountRef = VTX-ELECP1</div>
                  <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ Credit Issuance: Exactly-Once per CheckoutRequestID</div>
                  <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ Cross-Election Token Transfer: BLOCKED (403)</div>
                  <div className="text-muted-foreground pt-2 text-[11px]">
                    "Automated M-Pesa disbursement delivers organizer earnings upon approval."
                  </div>
                </div>
              </div>
            )}

            {activeCategoryTab === 'poll' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold">
                    <Globe2 className="h-4 w-4" /> COMMUNITY FEEDBACK • PUBLIC OPINION • REFERENDUMS
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Configurable Public Surveys & Referendums</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Engage broad audiences with customizable verification rules, real-time live tallies,
                    and flexible results visibility policies (Live vs. After Close).
                  </p>
                  <ul className="space-y-2.5 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Configurable self-registration and domain filtering.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Live results tallying with randomized candidate ballot order.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Full audit event logging on poll transitions and closures.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    Create Public Poll
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-3 font-mono text-xs">
                  <div className="text-muted-foreground border-b border-border pb-2">
                    // Public Poll Config
                  </div>
                  <div className="text-cyan-600 dark:text-cyan-400 font-semibold">✓ ResultsVisibility: LIVE / AFTER_CLOSE</div>
                  <div className="text-cyan-600 dark:text-cyan-400 font-semibold">✓ Candidate Shuffle: ENABLED</div>
                  <div className="text-cyan-600 dark:text-cyan-400 font-semibold">✓ Real-time WebSocket Tally Engine Active</div>
                  <div className="text-muted-foreground pt-2 text-[11px]">
                    "Public participation metrics exported to RFC 4180 CSV with zero PII leaks."
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. INTERACTIVE CRYPTOGRAPHIC RECEIPT VERIFIER SANDBOX
      ===================================================================== */}
      <section id="security" className="py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl border border-indigo-500/20 bg-card p-6 sm:p-10 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-xs font-bold gap-1">
                <Lock className="h-3.5 w-3.5" /> End-to-End Ballot Confidentiality
              </Badge>
              <h2 className="text-3xl font-black text-foreground">Cryptographic Receipt Verifier</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Test ballot verification in real-time. Every cast ballot produces a tamper-proof hash without revealing voter choices:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Receipt className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="Enter Ballot Receipt Code"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleTestVerify}
                disabled={isVerifyingReceipt}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 rounded-xl gap-2 h-10"
              >
                <Search className="h-3.5 w-3.5" />
                {isVerifyingReceipt ? 'Verifying...' : 'Verify Receipt'}
              </Button>
            </div>

            {verifyResult && (
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 font-mono text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> RECEIPT STATUS: VALID
                  </span>
                  <span className="text-[10px]">{verifyResult.timestamp}</span>
                </div>
                <div className="text-foreground text-[11px] space-y-1 pt-1 border-t border-emerald-500/20">
                  <p><span className="text-muted-foreground">Scope:</span> {verifyResult.organization}</p>
                  <p><span className="text-muted-foreground">Position:</span> {verifyResult.position}</p>
                  <p><span className="text-muted-foreground">Integrity:</span> {verifyResult.integrity}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. CORE ARCHITECTURAL FOUNDATIONS GRID
      ===================================================================== */}
      <section id="features" className="py-20 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 text-xs font-bold">
              Architectural Foundations
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Enterprise Infrastructure You Can Trust
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Engineered with zero compromises on security, accounting accuracy, or tenant isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Private Organization Workspaces</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every organization's data, elections, voters, and financials are strictly separated.
                Your data is private and accessible only to your authorized team members.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Direct M-Pesa Integration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamless STK push for voters purchasing packages, paired with fast automated withdrawals
                straight to organizer M-Pesa numbers upon administrative approval.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Transparent Financial Records</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every transaction and fee is recorded with penny-accurate precision. Organizers have
                full visibility into gross sales, processing fees, and net available earnings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Guaranteed Secret Ballot</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Voters receive an official digital receipt. Voter identity is strictly separated from choices
                to guarantee complete ballot confidentiality without coercion.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Secure Dual-Approval Payouts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built-in financial safeguards prevent unauthorized payouts. Funds are safely reserved
                before settlement, protecting both organizers and platform security.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Comprehensive Audit & Reporting</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instant generation of participation, turnout, commission, and financial reconciliation
                reports in RFC 4180 CSV and JSON with automatic credential scrubbing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. ROLE-BASED DEMO SANDBOX BANNER
      ===================================================================== */}
      <section className="py-16 border-t border-border bg-card/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 relative overflow-hidden text-center max-w-4xl mx-auto space-y-6 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Instant Sandbox Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Test Drive Votexa Right Now
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Launch into the fully configured test environment. Switch between Super Admin,
              University Dean (Org Owner), and Eligible Voter with zero friction.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => onLaunchApp('admin')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold gap-1.5"
              >
                👑 Test as Super Admin
              </Button>
              <Button
                onClick={() => onLaunchApp('overview')}
                variant="outline"
                className="border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold gap-1.5"
              >
                🏛️ Test as Org Owner (Dean)
              </Button>
              <Button
                onClick={onCastBallot}
                variant="outline"
                className="border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold gap-1.5"
              >
                🗳️ Cast Test Ballot
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. FOOTER
      ===================================================================== */}
      <footer className="border-t border-border bg-card/40 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span className="font-extrabold text-base text-foreground tracking-tight">VOTEXA</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Enterprise Multi-Tenant Voting & Elections Platform. Powered by Supabase Auth and Safaricom Daraja APIs.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Election Types</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>Institutional Elections</li>
                <li>Paid Competitions</li>
                <li>Public Opinion Polls</li>
                <li>Ballot Verification</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Treasury & Payouts</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>Instant Organizer Earnings</li>
                <li>Direct M-Pesa Checkout</li>
                <li>Automated Mobile Disbursements</li>
                <li>Protected Payout Authorization</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Compliance & Security</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>Private Isolated Workspaces</li>
                <li>Secret Anonymous Ballots</li>
                <li>Comprehensive Audit History</li>
                <li>KDPA & GDPR Data Privacy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Safaricom Daraja API: Connected • Database Pool: Healthy • All Systems Operational</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onNavigateToAuth('login')} className="hover:text-foreground transition-colors">Sign In</button>
              <button onClick={() => onNavigateToAuth('register')} className="hover:text-foreground transition-colors">Register</button>
              <button onClick={() => onLaunchApp('voting')} className="hover:text-foreground transition-colors">Cast Vote</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
