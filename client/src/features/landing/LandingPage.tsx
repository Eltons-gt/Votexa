import { useState } from 'react';
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
  Layers
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
            <a href="#mpesa" className="hover:text-foreground transition-colors">M-Pesa Finance</a>
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
          2. HERO SECTION
      ===================================================================== */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide backdrop-blur-sm animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Safaricom M-Pesa Integrated • Automated Instant Payouts
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
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
                className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 gap-2"
              >
                Create Free Workspace <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCastBallot}
                className="w-full sm:w-auto h-12 px-6 border-border bg-card hover:bg-muted text-foreground font-bold text-sm gap-2"
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

            {/* Key Trust Signals */}
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
              HERO MOCKUP PREVIEW
          =================================================================== */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-3 sm:p-5 shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">app.votexa.io/workspaces/metropolitan-uni</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                RLS Scoped: org-metro-uni
              </Badge>
            </div>

            {/* Split Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Institutional Ballot */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                    INSTITUTIONAL
                  </Badge>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">1 Voter = 1 Vote</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Dean of Faculty Senate</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Faculty Senate Executive Election 2026</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 rounded border border-primary/40 bg-primary/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Prof. Katherine Johnson</span>
                    <Badge variant="success" className="text-[10px]">Selected</Badge>
                  </div>
                  <div className="p-2 rounded border border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Prof. Alan Turing</span>
                    <span className="text-[10px]">Option 2</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-3 w-3 text-primary" />
                  <span>Receipt: SHA256-VOTEXA-9f2e...</span>
                </div>
              </div>

              {/* Card 2: Paid Competition & M-Pesa STK */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px]">
                    PAID COMPETITION
                  </Badge>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">M-Pesa STK Push</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Talent Showcase 2026</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">National Collegiate Arts Festival</p>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-muted/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-medium">Fan Pack (50 Credits)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">KES 5,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>3,420 votes cast</span>
                    <span>1,580 remaining</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Callback Verified</span>
                  <span>Credits Scoped</span>
                </div>
              </div>

              {/* Card 3: Organizer Treasury & Payouts */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    ORGANIZER TREASURY
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">Live Balance</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Verified Ticket Earnings</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Instant M-Pesa Disbursements</p>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50 border border-border">
                    <span className="text-muted-foreground">Total Ticket Sales</span>
                    <span className="font-mono font-bold text-foreground">KES 100,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Available for Payout</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">KES 60,000</span>
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
                  <span>Status: Ready for Withdrawal</span>
                  <span className="text-primary font-medium">Instant M-Pesa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. THREE ELECTION CATEGORIES SHOWCASE
      ===================================================================== */}
      <section id="categories" className="py-20 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
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

          {/* Interactive Category Selector Tabs */}
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

          {/* Tab Content Display */}
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
                  <h3 className="text-2xl font-bold text-foreground">Monetized Voting with M-Pesa STK Push</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Allow audiences and fans to purchase bundles of voting credits via Safaricom Daraja STK push.
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
        </div>
      </section>

      {/* =====================================================================
          4. CORE PLATFORM ENGINE FEATURES (GRID)
      ===================================================================== */}
      <section id="features" className="py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
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
          5. ROLE-BASED DEMO SANDBOX BANNER
      ===================================================================== */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
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
        </div>
      </section>

      {/* =====================================================================
          6. PLATFORM FOOTER
      ===================================================================== */}
      <footer className="border-t border-border bg-card/60 py-12 text-muted-foreground text-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-base text-foreground">VOTEXA</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enterprise Multi-Tenant Voting & Elections Platform. Powered by Supabase Auth and Safaricom Daraja APIs.
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
                <li>Direct M-Pesa Checkout</li>
                <li>Automated Mobile Disbursements</li>
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
