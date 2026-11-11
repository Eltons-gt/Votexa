import { useState, useEffect, useRef, ReactNode } from 'react';
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
  CreditCard,
  Receipt,
  Layers,
  Check,
  RefreshCw,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ThemeToggle } from '../../lib/theme';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
  onLaunchApp: (tab?: string) => void;
  onCastBallot: () => void;
}

/**
 * RevealOnScroll Component:
 * Observes element entry into the viewport and smoothly reveals content
 * with customizable direction, staggered delay, and easing as the user scrolls down.
 */
interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
}

function RevealOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 700
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const currentElem = ref.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  const getAnimationClasses = () => {
    if (isVisible) {
      return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    }
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-10 scale-[0.98]';
      case 'down':
        return 'opacity-0 -translate-y-10 scale-[0.98]';
      case 'left':
        return 'opacity-0 translate-x-10';
      case 'right':
        return 'opacity-0 -translate-x-10';
      case 'none':
        return 'opacity-0 scale-95';
      default:
        return 'opacity-0 translate-y-10';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
      className={`transition-all ease-out transform will-change-transform ${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

export function LandingPage({
  onNavigateToAuth,
  onLaunchApp,
  onCastBallot
}: LandingPageProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'institutional' | 'paid' | 'poll'>('institutional');

  // Creative Interactive Hero Showcase State
  const [heroMode, setHeroMode] = useState<'ballot' | 'mpesa'>('ballot');
  const [selectedCandidate, setSelectedCandidate] = useState<'amina' | 'david' | 'elena'>('amina');
  const [hasVoted, setHasVoted] = useState(false);
  const [receiptHash, setReceiptHash] = useState<string | null>(null);
  const [candidateVotes, setCandidateVotes] = useState({
    amina: 2184,
    david: 952,
    elena: 272
  });

  // M-Pesa Interactive Simulation State
  const [selectedPackage, setSelectedPackage] = useState<{ votes: number; kes: number }>({ votes: 50, kes: 450 });
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'confirmed'>('idle');

  const handleSimulateVote = () => {
    if (hasVoted) return;
    setHasVoted(true);
    setReceiptHash(`VTX-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}`);
    setCandidateVotes(prev => ({
      ...prev,
      [selectedCandidate]: prev[selectedCandidate] + 1
    }));
  };

  const handleResetVote = () => {
    setHasVoted(false);
    setReceiptHash(null);
  };

  const handleTriggerStk = () => {
    setStkStatus('sending');
    setTimeout(() => {
      setStkStatus('confirmed');
    }, 1200);
  };

  const handleResetStk = () => {
    setStkStatus('idle');
  };

  const totalHeroVotes = candidateVotes.amina + candidateVotes.david + candidateVotes.elena;
  const aminaPct = Math.round((candidateVotes.amina / totalHeroVotes) * 100);
  const davidPct = Math.round((candidateVotes.david / totalHeroVotes) * 100);
  const elenaPct = Math.max(0, 100 - aminaPct - davidPct);

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
            <a href="#features" className="hover:text-foreground transition-colors">Key Features</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security & Privacy</a>
            <a href="#payouts" className="hover:text-foreground transition-colors">Contests & Payouts</a>
            <a href="#reports" className="hover:text-foreground transition-colors">Audit & Reports</a>
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
          2. HERO SECTION WITH GRADUAL SCROLL REVEAL (SPLIT 2-COLUMN LAYOUT)
      ===================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/4 w-[450px] h-[380px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-12 items-center">
            
            {/* ===============================================================
                LEFT COLUMN: WORDS PUSHED TO THE LEFT SIDE
            =============================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
              
              {/* Live Trust Pill */}
              <RevealOnScroll direction="down" delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Verified Digital Balloting • Instant Voter Checkout & Payouts
                </div>
              </RevealOnScroll>

              {/* Main Headline */}
              <RevealOnScroll direction="up" delay={100}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] xl:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
                  The High-Integrity Voting Platform for{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
                    Modern Institutions & Paid Competitions
                  </span>
                </h1>
              </RevealOnScroll>

              {/* Sub-headline */}
              <RevealOnScroll direction="up" delay={200}>
                <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
                  Empowering universities, professional associations, and national talent competitions with
                  tamper-proof secret ballots, private organization workspaces, and instant revenue payouts.
                </p>
              </RevealOnScroll>

              {/* Hero Action Buttons */}
              <RevealOnScroll direction="up" delay={300}>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => onNavigateToAuth('register')}
                    className="h-12 px-7 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    Create Free Workspace <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onCastBallot}
                    className="h-12 px-6 border-border bg-card hover:bg-muted text-foreground font-bold text-sm gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <Vote className="h-4 w-4 text-emerald-500" /> Cast Official Ballot
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => onLaunchApp('admin')}
                    className="hidden sm:inline-flex h-12 px-4 text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-semibold gap-1.5"
                  >
                    <BarChart3 className="h-4 w-4" /> Platform Admin
                  </Button>
                </div>
              </RevealOnScroll>

              {/* Key Trust Signals */}
              <RevealOnScroll direction="up" delay={400}>
                <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Private & Isolated Workspaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Instant Organizer Payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Dual-Approval Payout Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Instant Ballot Processing</span>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: SOMETHING CREATIVE - INTERACTIVE LIVE ELECTION NEXUS
            =============================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 relative">
              <RevealOnScroll direction="left" delay={200} duration={800}>
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  
                  {/* Floating Creative Badge: Top-Right (Cryptographic Secrecy) */}
                  <div className="absolute -top-4 -right-2 sm:-top-5 sm:-right-4 z-20 hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl text-xs transition-transform hover:scale-105">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-[11px] leading-tight flex items-center gap-1">
                        100% Secret Ballot <Lock className="h-3 w-3 text-emerald-500" />
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">Zero-Knowledge Sealed</div>
                    </div>
                  </div>

                  {/* Floating Creative Badge: Bottom-Left (Earnings Settlement) */}
                  <div className="absolute -bottom-5 -left-2 sm:-bottom-5 sm:-left-4 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl text-xs transition-transform hover:scale-105">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-[11px] leading-tight">Instant Earnings Payouts</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">KES 42,500 Disbursed Live</div>
                    </div>
                  </div>

                  {/* Ambient Card Back-Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

                  {/* The Creative Interactive Showcase Card */}
                  <div className="relative rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all">
                    
                    {/* Card Top Bar: Mode Switcher & Live Status */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                      {/* Segmented Mode Selector */}
                      <div className="inline-flex p-1 rounded-lg bg-muted border border-border text-xs">
                        <button
                          type="button"
                          onClick={() => setHeroMode('ballot')}
                          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                            heroMode === 'ballot'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Vote className="h-3.5 w-3.5" />
                          <span>Live Ballot</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroMode('mpesa')}
                          className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                            heroMode === 'mpesa'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Quick Checkout</span>
                        </button>
                      </div>

                      {/* Live Tally Beacon */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>LIVE TALLY</span>
                      </div>
                    </div>

                    {/* =========================================================
                        PANEL 1: INTERACTIVE LIVE BALLOT
                    ========================================================= */}
                    {heroMode === 'ballot' && (
                      <div className="space-y-4">
                        {/* Election Title & Meta */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              Institutional Council Ballot
                            </span>
                            <h3 className="font-extrabold text-base sm:text-lg text-foreground mt-1.5">
                              Dean of Faculty Senate 2026
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Metropolitan University • Select 1 Candidate
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase">Total Votes</div>
                            <div className="text-sm font-bold font-mono text-foreground flex items-center gap-1 justify-end">
                              <Users className="h-3.5 w-3.5 text-primary" /> {totalHeroVotes.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Candidate Options */}
                        <div className="space-y-2.5 pt-1">
                          {/* Candidate 1 */}
                          <div
                            onClick={() => !hasVoted && setSelectedCandidate('amina')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              selectedCandidate === 'amina'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-card/60 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  selectedCandidate === 'amina'
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-muted-foreground/40'
                                }`}>
                                  {selectedCandidate === 'amina' && <Check className="h-2.5 w-2.5" />}
                                </div>
                                <span className="font-bold text-foreground">Dr. Amina Mwangi</span>
                                <span className="hidden sm:inline text-[11px] text-muted-foreground">• Biomedical Eng.</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-muted-foreground text-[11px]">{candidateVotes.amina.toLocaleString()} votes</span>
                                <span className="font-bold text-primary">{aminaPct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${aminaPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Candidate 2 */}
                          <div
                            onClick={() => !hasVoted && setSelectedCandidate('david')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              selectedCandidate === 'david'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-card/60 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  selectedCandidate === 'david'
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-muted-foreground/40'
                                }`}>
                                  {selectedCandidate === 'david' && <Check className="h-2.5 w-2.5" />}
                                </div>
                                <span className="font-bold text-foreground">Prof. David Ochieng</span>
                                <span className="hidden sm:inline text-[11px] text-muted-foreground">• Computer Science</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-muted-foreground text-[11px]">{candidateVotes.david.toLocaleString()} votes</span>
                                <span className="font-bold text-foreground">{davidPct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-muted-foreground/40 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${davidPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Candidate 3 */}
                          <div
                            onClick={() => !hasVoted && setSelectedCandidate('elena')}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              selectedCandidate === 'elena'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-card/60 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  selectedCandidate === 'elena'
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-muted-foreground/40'
                                }`}>
                                  {selectedCandidate === 'elena' && <Check className="h-2.5 w-2.5" />}
                                </div>
                                <span className="font-bold text-foreground">Dr. Elena Vance</span>
                                <span className="hidden sm:inline text-[11px] text-muted-foreground">• Economics</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-muted-foreground text-[11px]">{candidateVotes.elena.toLocaleString()} votes</span>
                                <span className="font-bold text-foreground">{elenaPct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-muted-foreground/30 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${elenaPct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interactive Action Area */}
                        {!hasVoted ? (
                          <div className="pt-2">
                            <Button
                              type="button"
                              onClick={handleSimulateVote}
                              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-lg shadow-primary/20"
                            >
                              <Vote className="h-4 w-4" /> Cast Cryptographic Ballot
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground mt-2">
                              Simulates instant client-side sealing & zero-knowledge ballot verification
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" /> Ballot Sealed & Counted!
                              </div>
                              <button
                                type="button"
                                onClick={handleResetVote}
                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                              >
                                <RefreshCw className="h-3 w-3" /> Vote again (demo)
                              </button>
                            </div>
                            <div className="p-2 rounded bg-background/80 border border-border text-[11px] font-mono flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Receipt className="h-3.5 w-3.5 text-primary" />
                                Receipt:
                              </span>
                              <span className="font-bold text-foreground">{receiptHash}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* =========================================================
                        PANEL 2: INTERACTIVE QUICK CHECKOUT & CREDITS
                    ========================================================= */}
                    {heroMode === 'mpesa' && (
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Paid Competition • Instant Voter Checkout
                          </span>
                          <h3 className="font-extrabold text-base sm:text-lg text-foreground mt-1.5">
                            National Collegiate Arts Award
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Audience Choice • Purchase Voting Credit Bundles
                          </p>
                        </div>

                        {/* Package Selection */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { votes: 10, kes: 100 },
                            { votes: 50, kes: 450, popular: true },
                            { votes: 100, kes: 800 }
                          ].map(pkg => (
                            <button
                              key={pkg.votes}
                              type="button"
                              onClick={() => {
                                setSelectedPackage({ votes: pkg.votes, kes: pkg.kes });
                                setStkStatus('idle');
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                selectedPackage.votes === pkg.votes
                                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                  : 'border-border bg-card/60 hover:bg-muted/50'
                              }`}
                            >
                              <div className="text-[11px] font-bold text-foreground">
                                {pkg.votes} Votes
                              </div>
                              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                KES {pkg.kes}
                              </div>
                              {pkg.popular && (
                                <span className="inline-block text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-1 rounded mt-1">
                                  Popular
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Checkout Simulation State */}
                        <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Voter Mobile Number:</span>
                            <span className="font-mono font-bold text-foreground">🇰🇪 +254 712 ••• 890</span>
                          </div>

                          {stkStatus === 'idle' && (
                            <Button
                              type="button"
                              onClick={handleTriggerStk}
                              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/20"
                            >
                              <CreditCard className="h-4 w-4" /> Simulate Quick Checkout (KES {selectedPackage.kes})
                            </Button>
                          )}

                          {stkStatus === 'sending' && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Payment Prompt Sent!
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Simulating phone authorization: Enter PIN for KES {selectedPackage.kes}...
                              </p>
                            </div>
                          )}

                          {stkStatus === 'confirmed' && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4" /> Payment Confirmed!
                                </div>
                                <button
                                  type="button"
                                  onClick={handleResetStk}
                                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                                >
                                  <RefreshCw className="h-3 w-3" /> Test again
                                </button>
                              </div>
                              <div className="text-[11px] font-mono text-muted-foreground space-y-0.5">
                                <div>• Transaction: <span className="text-foreground font-semibold">TX-729DK8L0</span></div>
                                <div>• Credits Issued: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedPackage.votes} Credits</span></div>
                                <div>• Organiser Balance: <span className="text-foreground font-semibold">+KES {(selectedPackage.kes * 0.75).toFixed(2)}</span> ready</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Security & Isolation Seal */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <span>RLS Tenant Isolated</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        <span>Zero Double-Voting</span>
                      </div>
                    </div>

                  </div>
                </div>
              </RevealOnScroll>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. THREE ELECTION CATEGORIES SHOWCASE (SCROLL REVEAL)
      ===================================================================== */}
      <section id="categories" className="py-20 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <RevealOnScroll direction="up" delay={0}>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
                Built for Every Democratic Context
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Three Specialized Election Architectures
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Votexa strictly differentiates institutional elections, paid public competitions, and opinion polls at the database schema level.
              </p>
            </div>
          </RevealOnScroll>

          {/* Interactive Category Selector Tabs */}
          <RevealOnScroll direction="up" delay={150}>
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border">
                <button
                  onClick={() => setActiveCategoryTab('institutional')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeCategoryTab === 'institutional'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  1. Institutional Elections
                </button>
                <button
                  onClick={() => setActiveCategoryTab('paid')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeCategoryTab === 'paid'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  2. Paid Competitions
                </button>
                <button
                  onClick={() => setActiveCategoryTab('poll')}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeCategoryTab === 'poll'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  3. Public Opinion Polls
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Tab Content Display */}
          <RevealOnScroll direction="up" delay={250}>
            <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8 backdrop-blur shadow-sm">
              {activeCategoryTab === 'institutional' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-primary text-xs font-mono font-semibold">
                      <Building2 className="h-4 w-4" /> UNIVERSITIES • SOWS • SACCOS • CORPORATE BOARDS
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
                  <div className="bg-muted/50 rounded-xl border border-border p-5 space-y-3 font-mono text-xs">
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
                    <h3 className="text-2xl font-bold text-foreground">Monetized Voting & Contest Credit Bundles</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Allow audiences and fans to purchase bundles of voting credits seamlessly via mobile money or debit card.
                      Credits are strictly scoped to the specific election and cannot cross tenant or contest boundaries.
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
                  <div className="bg-muted/50 rounded-xl border border-border p-5 space-y-3 font-mono text-xs">
                    <div className="text-muted-foreground border-b border-border pb-2">
                      // Paid Voting & Wallet Isolation
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ Checkout Session: AccountRef = VTX-ELECP1</div>
                    <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ Credit Issuance: Exactly-Once per Verified Reference</div>
                    <div className="text-amber-600 dark:text-amber-400 font-semibold">✓ Cross-Election Token Transfer: BLOCKED (403)</div>
                    <div className="text-muted-foreground pt-2 text-[11px]">
                      "Automated disbursement delivers organizer earnings directly upon approval."
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
                  <div className="bg-muted/50 rounded-xl border border-border p-5 space-y-3 font-mono text-xs">
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
          </RevealOnScroll>
        </div>
      </section>

      {/* =====================================================================
          4. CORE PLATFORM ENGINE FEATURES (STAGGERED SCROLL REVEAL)
      ===================================================================== */}
      <section id="features" className="py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <RevealOnScroll direction="up" delay={0}>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 text-xs">
                Architectural Foundations
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Enterprise Infrastructure You Can Trust
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Engineered with zero compromises on security, accounting accuracy, or tenant isolation.
              </p>
            </div>
          </RevealOnScroll>

          {/* Staggered Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <RevealOnScroll direction="up" delay={50}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Private Organization Workspaces</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every organization's data, elections, voters, and financials are strictly separated.
                  Your data is private and accessible only to your authorized team members.
                </p>
              </div>
            </RevealOnScroll>

            {/* Feature 2 */}
            <RevealOnScroll direction="up" delay={150}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Seamless Mobile & Card Payments</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Frictionless checkout for voters purchasing credit packages, paired with fast automated payouts
                  straight to organizer accounts upon administrative approval.
                </p>
              </div>
            </RevealOnScroll>

            {/* Feature 3 */}
            <RevealOnScroll direction="up" delay={250}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Transparent Financial Records</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every transaction and fee is recorded with penny-accurate precision. Organizers have
                  full visibility into gross sales, processing fees, and net available earnings.
                </p>
              </div>
            </RevealOnScroll>

            {/* Feature 4 */}
            <RevealOnScroll direction="up" delay={100}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Guaranteed Secret Ballot</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Voters receive an official digital receipt. Voter identity is strictly separated from choices
                  to guarantee complete ballot confidentiality without coercion.
                </p>
              </div>
            </RevealOnScroll>

            {/* Feature 5 */}
            <RevealOnScroll direction="up" delay={200}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Secure Dual-Approval Payouts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built-in financial safeguards prevent unauthorized payouts. Funds are safely reserved
                  before settlement, protecting both organizers and platform security.
                </p>
              </div>
            </RevealOnScroll>

            {/* Feature 6 */}
            <RevealOnScroll direction="up" delay={300}>
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:border-primary/50 transition-colors shadow-sm h-full">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Comprehensive Audit & Reporting</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant generation of participation, turnout, commission, and financial reconciliation
                  reports in RFC 4180 CSV and JSON with automatic credential scrubbing.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. ROLE-BASED DEMO SANDBOX BANNER (SCROLL REVEAL)
      ===================================================================== */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <RevealOnScroll direction="up" delay={100}>
            <div className="rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 relative overflow-hidden text-center max-w-4xl mx-auto space-y-6 shadow-md">
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
                  onClick={() => onLaunchApp('elections')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold gap-1.5"
                >
                  🏛️ Test as Org Owner (Dean)
                </Button>
                <Button
                  onClick={onCastBallot}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold gap-1.5"
                >
                  🗳️ Test as Eligible Voter
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* =====================================================================
          6. PLATFORM FOOTER (SCROLL REVEAL)
      ===================================================================== */}
      <footer className="border-t border-border bg-card/60 py-12 text-muted-foreground text-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <RevealOnScroll direction="up" delay={50}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-base text-foreground">VOTEXA</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enterprise Multi-Tenant Voting & Elections Platform. Designed for governance institutions and modern talent competitions.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Election Types</h4>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  <li>Institutional Elections</li>
                  <li>Paid Competitions</li>
                  <li>Public Opinion Polls</li>
                  <li>Ballot Verification</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Treasury & Payouts</h4>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  <li>Instant Organizer Earnings</li>
                  <li>Instant Mobile Checkout</li>
                  <li>Automated Revenue Disbursements</li>
                  <li>Protected Payout Authorization</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Compliance & Security</h4>
                <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                  <li>Private Isolated Workspaces</li>
                  <li>Secret Anonymous Ballots</li>
                  <li>Comprehensive Audit History</li>
                  <li>KDPA & GDPR Data Privacy</li>
                </ul>
              </div>
            </div>
          </RevealOnScroll>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <p>© 2026 Votexa Inc. All rights reserved. Secure Voting Platform.</p>
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
