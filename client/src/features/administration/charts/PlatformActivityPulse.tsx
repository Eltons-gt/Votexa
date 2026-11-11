import { Activity, ShieldCheck, Zap, Layers } from 'lucide-react';

export function PlatformActivityPulse() {
  const contestTypes = [
    { label: 'Institutional Governance', count: 14, percentage: 44, color: '#8B5CF6' },
    { label: 'Paid Award Contests', count: 12, percentage: 38, color: '#F59E0B' },
    { label: 'Public Opinion Polls', count: 6, percentage: 18, color: '#06B6D4' }
  ];

  const tenantTiers = [
    { tier: 'Enterprise Tier', count: 18, percentage: 38, color: '#F59E0B' },
    { tier: 'Standard Tier', count: 24, percentage: 50, color: '#38BDF8' },
    { tier: 'Community / Trial', count: 6, percentage: 12, color: '#94A3B8' }
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Contest Distribution & Telemetry Radar
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time multi-tenant workload and consensus engine throughput.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
          Consensus Live
        </span>
      </div>

      {/* Contest Category Distribution Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span>Active Contests by Category</span>
          <span className="text-[11px] font-mono text-slate-400">32 Total Contests</span>
        </div>

        {/* Multi-Segment Stacked Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {contestTypes.map((c) => (
            <div
              key={c.label}
              className="h-full rounded-sm transition-all duration-300"
              style={{
                width: `${c.percentage}%`,
                backgroundColor: c.color,
                boxShadow: `0 0 8px ${c.color}66`
              }}
              title={`${c.label}: ${c.count} (${c.percentage}%)`}
            />
          ))}
        </div>

        {/* Contest Legend Chips */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          {contestTypes.map((c) => (
            <div key={c.label} className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-300 truncate font-medium">{c.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 pl-3.5">
                {c.count} ({c.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Plan Tiers Breakdown */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span>Tenant Subscriptions by Tier</span>
          <span className="text-[11px] font-mono text-slate-400">48 Active Tenants</span>
        </div>

        {/* Segmented Tier Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {tenantTiers.map((t) => (
            <div
              key={t.tier}
              className="h-full rounded-sm transition-all duration-300"
              style={{
                width: `${t.percentage}%`,
                backgroundColor: t.color
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          {tenantTiers.map((t) => (
            <div key={t.tier} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <span>{t.tier}: <strong className="text-slate-200 font-mono">{t.count}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Processing Speeds */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Peak Load
          </p>
          <p className="font-mono font-bold text-amber-300 text-sm mt-0.5">148 / sec</p>
          <p className="text-[9px] text-slate-500">Ballot Ingestion</p>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Latency
          </p>
          <p className="font-mono font-bold text-emerald-300 text-sm mt-0.5">62 ms</p>
          <p className="text-[9px] text-slate-500">Hashing Consensus</p>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Layers className="h-3 w-3 text-cyan-400" /> Integrity
          </p>
          <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5">100.0%</p>
          <p className="text-[9px] text-slate-500">Cryptographic Trail</p>
        </div>
      </div>
    </div>
  );
}
