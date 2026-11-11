import { useState } from 'react';
import { PieChart, ShieldCheck } from 'lucide-react';

interface DonutSlice {
  id: string;
  label: string;
  percentage: number;
  amountCents: number;
  color: string;
  glowColor: string;
  description: string;
}

export function RevenueSplitDonutChart() {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const totalGrossCents = 4500000; // KES 4,500,000 / $45,000

  const slices: DonutSlice[] = [
    {
      id: 'platform',
      label: 'Platform Treasury (40%)',
      percentage: 40,
      amountCents: 1800000,
      color: '#10B981', // Emerald
      glowColor: 'rgba(16, 185, 129, 0.4)',
      description: 'Platform retained profit & infrastructure margin'
    },
    {
      id: 'organisers',
      label: 'Organisers Net Share (58%)',
      percentage: 58,
      amountCents: 2610000,
      color: '#8B5CF6', // Purple/Violet
      glowColor: 'rgba(139, 92, 246, 0.4)',
      description: 'Organisers claimable pool ready for withdrawal'
    },
    {
      id: 'fees',
      label: 'Gateway Fees & Levies (2%)',
      percentage: 2,
      amountCents: 90000,
      color: '#F59E0B', // Amber
      glowColor: 'rgba(245, 158, 11, 0.4)',
      description: 'Safaricom Daraja & Paystack interchange'
    }
  ];

  // SVG circular dimensions
  const radius = 70;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = slices.map((s) => {
    const strokeDash = (s.percentage / 100) * circumference;
    const offset = currentOffset;
    currentOffset += strokeDash;
    return {
      ...s,
      strokeDash,
      offset: -offset
    };
  });

  const activeSlice = slices.find((s) => s.id === hoveredSlice) || slices[0];

  const formatKes = (cents: number) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-emerald-400" />
            40/60 Commercial Split Ledger
          </h3>
          <p className="text-[11px] text-slate-400">
            Automated double-entry settlement architecture.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Balanced 100%
        </span>
      </div>

      {/* Donut and Center Callout */}
      <div className="flex flex-col items-center justify-center gap-4 py-2 w-full">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0 mx-auto">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
            />

            {/* Render Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredSlice === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${seg.strokeDash} ${circumference}`}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredSlice(seg.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : undefined
                  }}
                />
              );
            })}
          </svg>

          {/* Central KPI */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {hoveredSlice && activeSlice ? activeSlice.label.split(' ')[0] : 'Total Gross'}
            </span>
            <span className="text-base font-black font-mono text-slate-100 tracking-tight">
              {hoveredSlice && activeSlice
                ? `${activeSlice.percentage}%`
                : formatKes(totalGrossCents).replace('KES ', '')}
            </span>
            <span className="text-[9px] text-slate-400">
              {hoveredSlice && activeSlice ? formatKes(activeSlice.amountCents) : 'KES Gross Volume'}
            </span>
          </div>
        </div>

        {/* Breakdown Stat List */}
        <div className="w-full space-y-2">
          {slices.map((slice) => {
            const isHovered = hoveredSlice === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice.id)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-800/90 border-slate-600 shadow-md'
                    : 'bg-slate-800/40 border-slate-800/60 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: slice.color,
                        boxShadow: `0 0 8px ${slice.color}`
                      }}
                    />
                    <span className="text-slate-200 truncate">{slice.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100 shrink-0">
                    {formatKes(slice.amountCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pl-4.5 gap-2">
                  <span className="truncate">{slice.description}</span>
                  <span className="font-bold text-slate-300 font-mono shrink-0">{slice.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Pill */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Double-entry ledger audited</span>
        </span>
        <span className="font-mono text-emerald-400 font-semibold">0.00 Discrepancy</span>
      </div>
    </div>
  );
}
