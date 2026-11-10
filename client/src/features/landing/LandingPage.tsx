import { useState } from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Award,
  BarChart3,
  Globe2,
  Smartphone,
  LogIn,
  Rocket,
  CreditCard,
  MessageSquare,
  TrendingUp,
  ArrowUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ThemeToggle } from '../../lib/theme';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register', targetRole?: 'organizer' | 'voter') => void;
  onLaunchApp: (tab?: string) => void;
  onCastBallot: () => void;
}

interface PollVoteCounts {
  amara: number;
  kofi: number;
  zara: number;
}

export function LandingPage({
  onNavigateToAuth,
  onLaunchApp,
  onCastBallot
}: LandingPageProps) {
  // Interactive Live Poll Simulator State (inspired by screenshot)
  const [pollVotes, setPollVotes] = useState<PollVoteCounts>({
    amara: 62294,
    kofi: 45979,
    zara: 40047
  });
  const [userVotedCandidate, setUserVotedCandidate] = useState<string | null>(null);

  const totalPollVotes = pollVotes.amara + pollVotes.kofi + pollVotes.zara;
  const amaraPercent = Math.round((pollVotes.amara / totalPollVotes) * 100);
  const kofiPercent = Math.round((pollVotes.kofi / totalPollVotes) * 100);
  const zaraPercent = 100 - amaraPercent - kofiPercent;

  const handleSimulatedVote = (candidateKey: keyof PollVoteCounts) => {
    setPollVotes((prev) => ({
      ...prev,
      [candidateKey]: prev[candidateKey] + 1
    }));
    setUserVotedCandidate(candidateKey);
    setTimeout(() => setUserVotedCandidate(null), 1200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white transition-colors duration-200 relative">
      {/* =====================================================================
          1. NAVIGATION HEADER (Evopolls Inspo)
      ===================================================================== */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md transition-colors">
        <div className="container mx-auto px-4 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo with 3-bar chart icon */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
            <div className="flex items-end gap-1 h-9 w-9 rounded-xl bg-slate-900 dark:bg-blue-600 p-2 justify-center shadow-md shadow-slate-900/20">
              <span className="w-1.5 h-3 bg-amber-400 rounded-sm" />
              <span className="w-1.5 h-5 bg-amber-500 rounded-sm" />
              <span className="w-1.5 h-3.5 bg-amber-300 rounded-sm" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-foreground">VOTEXA</span>
              <p className="hidden sm:block text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Digital Voting & Contests
              </p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
            <a href="#hero" className="hover:text-foreground transition-colors">Home</a>
            <button
              onClick={() => onNavigateToAuth('register', 'organizer')}
              className="hover:text-amber-500 transition-colors font-bold text-foreground"
            >
              Host Your Event
            </button>
            <a href="#paid-voting" className="hover:text-foreground transition-colors">Tickets & Paid Voting</a>
            <a href="#features" className="hover:text-foreground transition-colors">Why Votexa</a>
            <a href="#live-results" className="hover:text-foreground transition-colors">Success Stories</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>

          {/* Action CTAs: Organiser Login button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLaunchApp('elections')}
              className="hidden xl:flex text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Demo Workspace
            </Button>
            <Button
              onClick={() => onNavigateToAuth('login')}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md gap-2"
            >
              <LogIn className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Event Organiser Login</span>
              <span className="sm:hidden">Login</span>
            </Button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION (Evopolls Inspo Layout)
      ===================================================================== */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Soft Warm/Blue Ambient Background Glows */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[350px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-[450px] h-[350px] bg-blue-600/10 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headlines, CTAs & Channels */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide backdrop-blur-sm shadow-sm">
                <span className="text-amber-500">★</span>
                <span>AFRICA'S #1 VOTING PLATFORM SINCE 2020</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
                Powering <span className="text-amber-500">Trusted</span> Online Voting Across Africa
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-2xl">
                Run secure, scalable, and engaging digital votes for awards, contests, pageants, elections, and audience choice campaigns — across web, SMS, USSD, WhatsApp, and Telegram.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Button
                  size="lg"
                  onClick={() => onNavigateToAuth('register', 'organizer')}
                  className="h-13 px-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-extrabold text-sm sm:text-base shadow-xl rounded-xl gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  <Rocket className="h-5 w-5 text-amber-400" />
                  Start Your Voting Event
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigateToAuth('login')}
                  className="h-13 px-7 border-2 border-slate-900 dark:border-slate-700 bg-card hover:bg-muted text-slate-900 dark:text-white font-bold text-sm sm:text-base rounded-xl gap-2 transition-all"
                >
                  <LogIn className="h-4 w-4 text-slate-900 dark:text-white" />
                  Organiser Login
                </Button>
              </div>

              {/* Feature Pills under CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Website Voting</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                  <span>SMS / USSD</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <span>WhatsApp & Telegram</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-border bg-card shadow-sm text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Paid Voting & M-Pesa</span>
                </div>
              </div>
            </div>

            {/* Right Column: Exact Live Poll Card from Screenshot */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Floating Pill Top Left: Secure & Transparent */}
              <div className="absolute -top-3 left-4 sm:-left-3 z-20 px-3.5 py-1.5 rounded-full border border-border bg-card shadow-lg text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                <span>Secure & Transparent</span>
              </div>

              {/* Main Live Poll Card */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl relative space-y-5">
                {/* Poll Card Header */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                    LIVE POLL
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Poll Title */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    Best Artist of the Year 2025
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click a candidate to cast a live simulated vote!
                  </p>
                </div>

                {/* Contestants Progress Bars */}
                <div className="space-y-4 pt-1">
                  {/* Candidate 1: Amara Diallo */}
                  <div
                    onClick={() => handleSimulatedVote('amara')}
                    className="group cursor-pointer p-2.5 rounded-xl transition-all hover:bg-muted/50 border border-transparent hover:border-amber-500/20"
                  >
                    <div className="flex items-center justify-between text-sm font-bold mb-1.5">
                      <span className="text-foreground group-hover:text-amber-500 transition-colors">
                        Amara Diallo
                      </span>
                      <span className="text-amber-500 font-black">{amaraPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3.5 overflow-hidden p-0.5">
                      <div
                        className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${amaraPercent}%` }}
                      />
                    </div>
                    {userVotedCandidate === 'amara' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-bounce block mt-1">
                        +1 Vote Recorded!
                      </span>
                    )}
                  </div>

                  {/* Candidate 2: Kofi Mensah */}
                  <div
                    onClick={() => handleSimulatedVote('kofi')}
                    className="group cursor-pointer p-2.5 rounded-xl transition-all hover:bg-muted/50 border border-transparent hover:border-blue-500/20"
                  >
                    <div className="flex items-center justify-between text-sm font-bold mb-1.5">
                      <span className="text-foreground group-hover:text-blue-500 transition-colors">
                        Kofi Mensah
                      </span>
                      <span className="text-foreground font-black">{kofiPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3.5 overflow-hidden p-0.5">
                      <div
                        className="bg-slate-900 dark:bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${kofiPercent}%` }}
                      />
                    </div>
                    {userVotedCandidate === 'kofi' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-bounce block mt-1">
                        +1 Vote Recorded!
                      </span>
                    )}
                  </div>

                  {/* Candidate 3: Zara Osei */}
                  <div
                    onClick={() => handleSimulatedVote('zara')}
                    className="group cursor-pointer p-2.5 rounded-xl transition-all hover:bg-muted/50 border border-transparent hover:border-blue-500/20"
                  >
                    <div className="flex items-center justify-between text-sm font-bold mb-1.5">
                      <span className="text-foreground group-hover:text-blue-500 transition-colors">
                        Zara Osei
                      </span>
                      <span className="text-foreground font-black">{zaraPercent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3.5 overflow-hidden p-0.5">
                      <div
                        className="bg-slate-900 dark:bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${zaraPercent}%` }}
                      />
                    </div>
                    {userVotedCandidate === 'zara' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-bounce block mt-1">
                        +1 Vote Recorded!
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground font-mono">
                    {totalPollVotes.toLocaleString()} votes cast
                  </span>

                  {/* Floating Pill Bottom Right: Real-Time Results */}
                  <div className="px-3 py-1.5 rounded-full border border-border bg-card shadow-md text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    <span>Real-Time Results</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CATEGORIES & FORMATS
      ===================================================================== */}
      <section id="categories" className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-foreground">Tailored for Every Voting Event</h2>
            <p className="text-sm text-muted-foreground">
              From high-volume paid entertainment awards to university senate ballots, Votexa delivers verified outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Awards & Talent Contests</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empower fans to purchase multi-vote bundles via M-Pesa. Track real-time leaderboards and receive automated 75% organiser disbursements.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToAuth('register', 'organizer')}
                className="w-full text-xs font-bold gap-1"
              >
                Launch Paid Contest <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Campus & Institutional Ballots</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strict 1-voter-1-vote secret ballots with cryptographic receipt issuance. Private student and faculty rosters with role-based access.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToAuth('register', 'organizer')}
                className="w-full text-xs font-bold gap-1"
              >
                Host Institutional Vote <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Public Polls & Opinion Surveys</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engage broad public audiences across social and mobile channels. Prevent bot fraud with device fingerprinting and IP rate limiting.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToAuth('register', 'organizer')}
                className="w-full text-xs font-bold gap-1"
              >
                Create Public Poll <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. INSTANT M-PESA PAYOUTS & MONETIZATION
      ===================================================================== */}
      <section id="paid-voting" className="py-20 border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold">
                  Instant M-Pesa Disbursals
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Monetize Your Voting Events with Automated Mobile Payouts
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Fans vote with M-Pesa Express STK Push. Your earnings are calculated and available for instant withdrawal straight to your mobile wallet upon administrative review.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 75% Organiser Earnings
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 0% Chargeback Risk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> B2C Daraja Transfers
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Competition Sales</span>
                  <span className="text-lg font-black text-white font-mono">KES 240,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Processing Fees (2.5%)</span>
                  <span className="text-sm font-semibold text-rose-300 font-mono">- KES 6,000</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-amber-300 font-bold">Organiser Payout Balance</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono">KES 175,500</p>
                  </div>
                  <Button
                    onClick={() => onNavigateToAuth('register', 'organizer')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl"
                  >
                    Start Earning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FOOTER
      ===================================================================== */}
      <footer id="contact" className="border-t border-border bg-card/60 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1 h-6 w-6 rounded bg-slate-900 dark:bg-blue-600 p-1 justify-center">
                  <span className="w-1 h-2 bg-amber-400 rounded-sm" />
                  <span className="w-1 h-3.5 bg-amber-500 rounded-sm" />
                  <span className="w-1 h-2.5 bg-amber-300 rounded-sm" />
                </div>
                <span className="font-black text-lg text-foreground">VOTEXA</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Africa's premier digital voting and audience choice infrastructure. Powering trusted awards and elections.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground">For Organisers</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><button onClick={() => onNavigateToAuth('register', 'organizer')} className="hover:text-foreground">Host Your Event</button></li>
                <li><button onClick={() => onNavigateToAuth('login')} className="hover:text-foreground">Organiser Login</button></li>
                <li><a href="#paid-voting" className="hover:text-foreground">Pricing & Payouts</a></li>
                <li><a href="#hero" className="hover:text-foreground">Live Polls</a></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Channels</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>Website Voting Portal</li>
                <li>M-Pesa STK Express</li>
                <li>SMS / USSD Shortcodes</li>
                <li>WhatsApp Voting Bot</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Direct Support</h4>
              <p className="text-muted-foreground">
                Need help organizing your event? Our support team is online 24/7.
              </p>
              <div className="pt-1">
                <a
                  href="https://wa.me/254700000000?text=Hello%20Votexa%20Support%2C%20I%20want%20to%20host%20a%20voting%20event"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Chat on WhatsApp Support
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <p>© 2026 Votexa Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => onNavigateToAuth('login')} className="hover:text-foreground">Organiser Login</button>
              <button onClick={() => onNavigateToAuth('register', 'organizer')} className="hover:text-foreground">Host Event</button>
              <button onClick={onCastBallot} className="hover:text-foreground">Cast Ballot</button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          6. FLOATING ACTION CONTROLS (WhatsApp & Scroll to Top from Screenshot)
      ===================================================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {/* WhatsApp Floating Contact Bubble */}
        <a
          href="https://wa.me/254700000000?text=Hello%20Votexa%20Support%2C%20I%20want%20to%20host%20an%20event"
          target="_blank"
          rel="noreferrer"
          title="Chat with Event Support on WhatsApp"
          className="h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white dark:border-slate-800 cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 text-emerald-400" />
        </a>

        {/* Scroll To Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          title="Back to Top"
          className="h-10 w-10 rounded-full bg-card hover:bg-muted text-foreground border-2 border-amber-500/60 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        >
          <ArrowUp className="h-4 w-4 text-amber-500" />
        </button>
      </div>
    </div>
  );
}
