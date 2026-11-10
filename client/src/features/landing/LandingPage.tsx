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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* =====================================================================
          1. NAVIGATION HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">VOTEXA</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  v1.0-RC
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">Enterprise Multi-Tenant Voting SaaS</p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#categories" className="hover:text-blue-400 transition-colors">Election Types</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Core Engine</a>
            <a href="#security" className="hover:text-blue-400 transition-colors">Security & RLS</a>
            <a href="#mpesa" className="hover:text-blue-400 transition-colors">M-Pesa Finance</a>
            <a href="#reports" className="hover:text-blue-400 transition-colors">Audit & Reports</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToAuth('login')}
              className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigateToAuth('register')}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 text-xs sm:text-sm font-semibold gap-1.5"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLaunchApp('elections')}
              className="hidden lg:flex border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION
      ===================================================================== */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-sm animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Safaricom Daraja B2C & Supabase Auth Live • Strict 40/60 Split
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              The High-Integrity Voting Platform for{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Modern Institutions & Paid Competitions
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Empowering universities, corporate SACCOs, and national talent competitions with
              verifiable cryptographic ballots, isolated tenant workspaces, and instant M-Pesa automated payouts.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 gap-2"
              >
                Create Free Workspace <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCastBallot}
                className="w-full sm:w-auto h-12 px-6 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm gap-2"
              >
                <Vote className="h-4 w-4 text-emerald-400" /> Cast Official Ballot
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onLaunchApp('admin')}
                className="w-full sm:w-auto h-12 px-5 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold gap-1.5"
              >
                <BarChart3 className="h-4 w-4" /> View Super Admin
              </Button>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>PostgreSQL Row-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Double-Entry Minor Currency Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Anti-Self-Approval Payout Rule</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Sub-200ms Authorization Latency</span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              HERO MOCKUP PREVIEW
          =================================================================== */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-3 sm:p-5 shadow-2xl shadow-blue-950/40">
            {/* Window Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">app.votexa.io/workspaces/metropolitan-uni</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/30 text-[10px]">
                RLS Scoped: org-metro-uni
              </Badge>
            </div>

            {/* Split Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Institutional Ballot */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                    INSTITUTIONAL
                  </Badge>
                  <span className="text-[11px] text-emerald-400 font-mono">1 Voter = 1 Vote</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Dean of Faculty Senate</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Faculty Senate Executive Election 2026</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 rounded border border-blue-500/40 bg-blue-950/20 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Prof. Katherine Johnson</span>
                    <Badge variant="success" className="text-[10px]">Selected</Badge>
                  </div>
                  <div className="p-2 rounded border border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
                    <span>Prof. Alan Turing</span>
                    <span className="text-[10px]">Option 2</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Receipt className="h-3 w-3 text-blue-400" />
                  <span>Receipt: SHA256-VOTEXA-9f2e...</span>
                </div>
              </div>

              {/* Card 2: Paid Competition & M-Pesa STK */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                    PAID COMPETITION
                  </Badge>
                  <span className="text-[11px] text-emerald-400 font-mono">M-Pesa STK Push</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Talent Showcase 2026</h4>
                  <p className="text-xs text-slate-400 mt-0.5">National Collegiate Arts Festival</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Fan Pack (50 Credits)</span>
                    <span className="font-bold text-emerald-400 font-mono">KES 5,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>3,420 votes cast</span>
                    <span>1,580 remaining</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400">● Callback Verified</span>
                  <span>Credits Scoped</span>
                </div>
              </div>

              {/* Card 3: 40/60 Revenue Treasury */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    FINANCIAL LEDGER
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">Double-Entry</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Commercial Split</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Immutable Minor Currency (Cents)</p>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400">Platform Share (40%)</span>
                    <span className="font-mono font-bold text-blue-400">KES 40,000</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400">Organiser Earnings (60%)</span>
                    <span className="font-mono font-bold text-emerald-400">KES 60,000</span>
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Balance: KES 0 discrepancy</span>
                  <span className="text-blue-400">B2C Automated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. THREE ELECTION CATEGORIES SHOWCASE
      ===================================================================== */}
      <section id="categories" className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-950/20 text-xs">
              Built for Every Democratic Context
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Specialized Election Architectures
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Votexa strictly differentiates institutional elections, paid public competitions, and opinion polls at the database schema level.
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveCategoryTab('institutional')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeCategoryTab === 'institutional'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Institutional Elections
              </button>
              <button
                onClick={() => setActiveCategoryTab('paid')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeCategoryTab === 'paid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Paid Competitions
              </button>
              <button
                onClick={() => setActiveCategoryTab('poll')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeCategoryTab === 'poll'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Public Opinion Polls
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur">
            {activeCategoryTab === 'institutional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-mono font-semibold">
                    <Building2 className="h-4 w-4" /> UNIVERSITIES • SOWS • SACCOS • CORPORATE BOARDS
                  </div>
                  <h3 className="text-2xl font-bold text-white">One Eligible Voter, One Vote per Position</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Designed for governance structures where absolute democratic fairness is non-negotiable.
                    Voting credits and purchase endpoints are blocked at the controller layer.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Strict backend voter register eligibility verification (CSV or API import).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Zero paid voting: purchase requests rejected with HTTP 400.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Detached cryptographic receipts guarantee total ballot secrecy.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
                  >
                    Configure Institutional Election
                  </Button>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 border-b border-slate-800 pb-2">
                    // Institutional Rule Enforcement
                  </div>
                  <div className="text-emerald-400">✓ Max votes per voter = 1 (enforced)</div>
                  <div className="text-emerald-400">✓ IsPaidVoting = false (immutable)</div>
                  <div className="text-emerald-400">✓ Single-Use Authorization Token generated</div>
                  <div className="text-slate-500 pt-2 text-[11px]">
                    "Double voting attempt triggers HTTP 409 CONFLICT with audit trail timestamp."
                  </div>
                </div>
              </div>
            )}

            {activeCategoryTab === 'paid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
                    <Award className="h-4 w-4" /> TALENT SHOWS • FAN VOTING • AUDIENCE AWARDS
                  </div>
                  <h3 className="text-2xl font-bold text-white">Monetized Voting with M-Pesa STK Push</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Allow audiences and fans to purchase bundles of voting credits via Safaricom Daraja STK push.
                    Credits are strictly scoped to the specific election and cannot cross tenant or contest boundaries.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Authoritative package price retrieval (never trusts client price).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Idempotent webhook callbacks with replay prevention.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Automatic 40% platform / 60% organiser split recorded instantly in ledger.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-amber-600 hover:bg-amber-500 text-xs font-semibold"
                  >
                    Launch Paid Competition
                  </Button>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 border-b border-slate-800 pb-2">
                    // Paid Voting & Wallet Isolation
                  </div>
                  <div className="text-amber-400">✓ STK Push initiated: AccountRef = VTX-ELECP1</div>
                  <div className="text-amber-400">✓ Credit Issuance: Exactly-Once per CheckoutRequestID</div>
                  <div className="text-amber-400">✓ Cross-Election Token Transfer: BLOCKED (403)</div>
                  <div className="text-slate-500 pt-2 text-[11px]">
                    "Automated B2C disbursement delivers 60% organiser share upon admin approval."
                  </div>
                </div>
              </div>
            )}

            {activeCategoryTab === 'poll' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
                    <Globe2 className="h-4 w-4" /> COMMUNITY FEEDBACK • PUBLIC OPINION • REFERENDUMS
                  </div>
                  <h3 className="text-2xl font-bold text-white">Configurable Public Surveys & Referendums</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Engage broad audiences with customizable verification rules, real-time live tallies,
                    and flexible results visibility policies (Live vs. After Close).
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Configurable self-registration and domain filtering.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Live results tallying with randomized candidate ballot order.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Full audit event logging on poll transitions and closures.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => onLaunchApp('elections')}
                    className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold"
                  >
                    Create Public Poll
                  </Button>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 border-b border-slate-800 pb-2">
                    // Public Poll Config
                  </div>
                  <div className="text-cyan-400">✓ ResultsVisibility: LIVE / AFTER_CLOSE</div>
                  <div className="text-cyan-400">✓ Candidate Shuffle: ENABLED</div>
                  <div className="text-cyan-400">✓ Real-time WebSocket Tally Engine Active</div>
                  <div className="text-slate-500 pt-2 text-[11px]">
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
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/70">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-950/20 text-xs">
              Architectural Foundations
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Infrastructure You Can Trust
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Engineered with zero compromises on security, accounting accuracy, or tenant isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">PostgreSQL Row-Level Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transactions automatically execute with <code>SET LOCAL app.current_organization_id</code>.
                Cross-tenant data leakage is physically barred by database kernel policies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Safaricom Daraja STK & B2C</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless C2B STK push for voters to buy credits, paired with automated B2C disbursement
                straight to organiser M-Pesa mobile wallets upon admin approval.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">40/60 Double-Entry Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform commission is fixed at 40%, organiser share at 60%. Integer minor-currency
                accounting eliminates floating-point rounding bugs and maintains zero ledger variance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Cryptographic Ballot Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Voters receive tamper-evident cryptographic receipt hashes. Identities are decoupled
                from ballots, preventing voter coercion while providing inclusion proofs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Anti-Self-Approval Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict segregation of duties prevents platform administrators from approving their own
                payout requests. Permanent deductions only occur upon verified settlement.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">9 Enterprise Reports & Audits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
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
      <section className="py-16 border-t border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-8 sm:p-12 relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Instant Sandbox Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Test Drive Votexa Right Now
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Launch into the fully configured test environment. Switch between Super Admin,
              University Dean (Org Owner), and Eligible Voter with zero friction.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => onLaunchApp('admin')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold gap-1.5"
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
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-base text-white">VOTEXA</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enterprise Multi-Tenant Voting & Elections Platform. Powered by Supabase Auth and Safaricom Daraja APIs.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200">Election Types</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>Institutional Elections</li>
                <li>Paid Competitions</li>
                <li>Public Opinion Polls</li>
                <li>Ballot Verification</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200">Financial Ledger</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>40/60 Revenue Split</li>
                <li>Daraja STK Push</li>
                <li>Automated B2C Payouts</li>
                <li>Anti-Self-Approval Rule</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200">Compliance & Security</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>PostgreSQL RLS Policies</li>
                <li>Double-Entry Ledger</li>
                <li>Immutable Audit Logs</li>
                <li>KDPA & GDPR Data Privacy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 Votexa Inc. All rights reserved. Registered SaaS Platform.</p>
            <div className="flex gap-4">
              <button onClick={() => onNavigateToAuth('login')} className="hover:text-slate-300">Sign In</button>
              <button onClick={() => onNavigateToAuth('register')} className="hover:text-slate-300">Register</button>
              <button onClick={() => onLaunchApp('voting')} className="hover:text-slate-300">Voting Engine</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
