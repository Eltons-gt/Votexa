import { useState, useId } from 'react';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

interface DataPoint {
  label: string;
  grossVolume: number; // in cents
  platformRevenue: number; // in cents (40%)
  organiserShare: number; // in cents (60%)
  ballots: number;
}

export function RevenueSplineChart() {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '12M'>('30D');
  const [activeMetric, setActiveMetric] = useState<'all' | 'platform' | 'gross' | 'ballots'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const gradientIdPlatform = useId();
  const gradientIdGross = useId();

  // Dataset presets for timeframes
  const data7D: DataPoint[] = [
    { label: 'Mon', grossVolume: 420000, platformRevenue: 168000, organiserShare: 252000, ballots: 2100 },
    { label: 'Tue', grossVolume: 510000, platformRevenue: 204000, organiserShare: 306000, ballots: 2650 },
    { label: 'Wed', grossVolume: 680000, platformRevenue: 272000, organiserShare: 408000, ballots: 3400 },
    { label: 'Thu', grossVolume: 590000, platformRevenue: 236000, organiserShare: 354000, ballots: 2950 },
    { label: 'Fri', grossVolume: 840000, platformRevenue: 336000, organiserShare: 504000, ballots: 4200 },
    { label: 'Sat', grossVolume: 1120000, platformRevenue: 448000, organiserShare: 672000, ballots: 5800 },
    { label: 'Sun', grossVolume: 960000, platformRevenue: 384000, organiserShare: 576000, ballots: 4900 }
  ];

  const data30D: DataPoint[] = [
    { label: 'Oct 12', grossVolume: 320000, platformRevenue: 128000, organiserShare: 192000, ballots: 1600 },
    { label: 'Oct 15', grossVolume: 410000, platformRevenue: 164000, organiserShare: 246000, ballots: 2050 },
    { label: 'Oct 18', grossVolume: 540000, platformRevenue: 216000, organiserShare: 324000, ballots: 2700 },
    { label: 'Oct 21', grossVolume: 480000, platformRevenue: 192000, organiserShare: 288000, ballots: 2400 },
    { label: 'Oct 24', grossVolume: 620000, platformRevenue: 248000, organiserShare: 372000, ballots: 3100 },
    { label: 'Oct 27', grossVolume: 790000, platformRevenue: 316000, organiserShare: 474000, ballots: 3950 },
    { label: 'Oct 30', grossVolume: 850000, platformRevenue: 340000, organiserShare: 510000, ballots: 4250 },
    { label: 'Nov 02', grossVolume: 920000, platformRevenue: 368000, organiserShare: 552000, ballots: 4600 },
    { label: 'Nov 05', grossVolume: 1050000, platformRevenue: 420000, organiserShare: 630000, ballots: 5250 },
    { label: 'Nov 08', grossVolume: 1180000, platformRevenue: 472000, organiserShare: 708000, ballots: 5900 },
    { label: 'Nov 11', grossVolume: 1340000, platformRevenue: 536000, organiserShare: 804000, ballots: 6700 }
  ];

  const data12M: DataPoint[] = [
    { label: 'Jan', grossVolume: 1400000, platformRevenue: 560000, organiserShare: 840000, ballots: 7200 },
    { label: 'Feb', grossVolume: 1850000, platformRevenue: 740000, organiserShare: 1110000, ballots: 9300 },
    { label: 'Mar', grossVolume: 2200000, platformRevenue: 880000, organiserShare: 1320000, ballots: 11100 },
    { label: 'Apr', grossVolume: 2600000, platformRevenue: 1040000, organiserShare: 1560000, ballots: 13200 },
    { label: 'May', grossVolume: 3100000, platformRevenue: 1240000, organiserShare: 1860000, ballots: 15800 },
    { label: 'Jun', grossVolume: 2900000, platformRevenue: 1160000, organiserShare: 1740000, ballots: 14700 },
    { label: 'Jul', grossVolume: 3400000, platformRevenue: 1360000, organiserShare: 2040000, ballots: 17200 },
    { label: 'Aug', grossVolume: 3800000, platformRevenue: 1520000, organiserShare: 2280000, ballots: 19400 },
    { label: 'Sep', grossVolume: 4100000, platformRevenue: 1640000, organiserShare: 2460000, ballots: 20800 },
    { label: 'Oct', grossVolume: 4600000, platformRevenue: 1840000, organiserShare: 2760000, ballots: 23100 },
    { label: 'Nov', grossVolume: 5120000, platformRevenue: 2048000, organiserShare: 3072000, ballots: 25900 }
  ];

  const activeData = timeframe === '7D' ? data7D : timeframe === '30D' ? data30D : data12M;

  // Chart coordinates
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 58;
  const padRight = 28;
  const padTop = 20;
  const padBottom = 30;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Find max value
  const maxGross = Math.max(...activeData.map((d) => d.grossVolume)) * 1.15;

  // Map to points
  const grossPoints = activeData.map((d, i) => ({
    x: padLeft + (i / (activeData.length - 1)) * chartW,
    y: padTop + chartH - (d.grossVolume / maxGross) * chartH
  }));

  const platformPoints = activeData.map((d, i) => ({
    x: padLeft + (i / (activeData.length - 1)) * chartW,
    y: padTop + chartH - (d.platformRevenue / maxGross) * chartH
  }));

  function generateSpline(points: { x: number; y: number }[]): string {
    if (points.length < 2 || !points[0]) return '';
    const firstP = points[0];
    const lastP = points[points.length - 1] || firstP;
    let d = `M ${firstP.x} ${firstP.y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1] ?? firstP;
      const p1 = points[i] ?? firstP;
      const p2 = points[i + 1] ?? lastP;
      const p3 = points[i + 2] ?? p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  const grossSpline = generateSpline(grossPoints);
  const platformSpline = generateSpline(platformPoints);

  const firstGross = grossPoints[0] || { x: padLeft, y: padTop + chartH };
  const lastGross = grossPoints[grossPoints.length - 1] || firstGross;
  const grossArea = `${grossSpline} L ${lastGross.x} ${padTop + chartH} L ${firstGross.x} ${padTop + chartH} Z`;

  const firstPlatform = platformPoints[0] || { x: padLeft, y: padTop + chartH };
  const lastPlatform = platformPoints[platformPoints.length - 1] || firstPlatform;
  const platformArea = `${platformSpline} L ${lastPlatform.x} ${padTop + chartH} L ${firstPlatform.x} ${padTop + chartH} Z`;

  // Grid lines (4 horizontal)
  const gridY = [0.25, 0.5, 0.75, 1.0].map((pct) => ({
    y: padTop + chartH * (1 - pct),
    val: Math.round(maxGross * pct)
  }));

  const activeHoverData = hoverIndex !== null ? activeData[hoverIndex] : null;
  const activeHoverX = hoverIndex !== null && grossPoints[hoverIndex] ? grossPoints[hoverIndex].x : null;

  const formatCurrency = (cents: number) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Platform Gross Volume & Revenue Growth
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +24.8%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial trends and verified ballot submissions.
          </p>
        </div>

        {/* Timeframe & Series Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Series Filter */}
          <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-[11px]">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeMetric === 'all'
                  ? 'bg-slate-700 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Series
            </button>
            <button
              onClick={() => setActiveMetric('platform')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeMetric === 'platform'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Platform 40%
            </button>
            <button
              onClick={() => setActiveMetric('gross')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeMetric === 'gross'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gross
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-[11px]">
            {(['7D', '30D', '12M'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  setHoverIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeframe === t
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none" style={{ minHeight: '250px' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto drop-shadow-sm"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Platform 40% Emerald Gradient */}
            <linearGradient id={gradientIdPlatform} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#10B981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Gross Volume Cyan Gradient */}
            <linearGradient id={gradientIdGross} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.30" />
              <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {gridY.map((g, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={g.y}
                x2={svgWidth - padRight}
                y2={g.y}
                stroke="#1E293B"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={g.y + 3}
                fill="#64748B"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                ${(g.val / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </text>
            </g>
          ))}

          {/* Area Fills */}
          {(activeMetric === 'all' || activeMetric === 'gross') && (
            <path d={grossArea} fill={`url(#${gradientIdGross})`} />
          )}

          {(activeMetric === 'all' || activeMetric === 'platform') && (
            <path d={platformArea} fill={`url(#${gradientIdPlatform})`} />
          )}

          {/* Line Strokes */}
          {(activeMetric === 'all' || activeMetric === 'gross') && (
            <path
              d={grossSpline}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            />
          )}

          {(activeMetric === 'all' || activeMetric === 'platform') && (
            <path
              d={platformSpline}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
            />
          )}

          {/* Interactive Hover Hitboxes and Points */}
          {activeData.map((d, i) => {
            const pGross = grossPoints[i] || firstGross;
            const pPlatform = platformPoints[i] || firstPlatform;
            const isHovered = hoverIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                className="cursor-pointer"
              >
                {/* Transparent Hit Column */}
                <rect
                  x={pGross.x - chartW / (activeData.length * 2)}
                  y={padTop}
                  width={chartW / activeData.length}
                  height={chartH}
                  fill="transparent"
                />

                {/* X Axis Label */}
                <text
                  x={pGross.x}
                  y={svgHeight - 10}
                  fill={isHovered ? '#F8FAFC' : '#64748B'}
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {d.label}
                </text>

                {/* Dots on hover */}
                {isHovered && (
                  <>
                    <circle
                      cx={pGross.x}
                      cy={pGross.y}
                      r={5}
                      fill="#06B6D4"
                      stroke="#0F172A"
                      strokeWidth={2}
                      className="drop-shadow-[0_0_6px_#06B6D4]"
                    />
                    <circle
                      cx={pPlatform.x}
                      cy={pPlatform.y}
                      r={5}
                      fill="#10B981"
                      stroke="#0F172A"
                      strokeWidth={2}
                      className="drop-shadow-[0_0_6px_#10B981]"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Vertical Crosshair Line */}
          {activeHoverX !== null && (
            <line
              x1={activeHoverX}
              y1={padTop}
              x2={activeHoverX}
              y2={padTop + chartH}
              stroke="#E2E8F0"
              strokeOpacity="0.4"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {activeHoverData && activeHoverX !== null && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl space-y-1.5"
            style={{
              left: `${(activeHoverX / svgWidth) * 100}%`,
              top: '10px',
              minWidth: '190px'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" />
                {activeHoverData.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeHoverData.ballots.toLocaleString()} Votes
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#06B6D4]"></span>
                  Gross:
                </span>
                <span className="font-bold">{formatCurrency(activeHoverData.grossVolume)}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#10B981]"></span>
                  Platform 40%:
                </span>
                <span className="font-bold">{formatCurrency(activeHoverData.platformRevenue)}</span>
              </div>

              <div className="flex items-center justify-between text-indigo-400">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block"></span>
                  Organisers 60%:
                </span>
                <span className="font-bold">{formatCurrency(activeHoverData.organiserShare)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Aggregate Stat Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]"></span>
            <span className="font-medium text-slate-300">Gross Processed Volume</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
            <span className="font-medium text-slate-300">Platform Treasury (40%)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400"></span>
            <span className="font-medium text-slate-400">Organiser Payout Liabilities (60%)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          <span>Status: </span>
          <span className="text-emerald-400 font-semibold">100% Real-Time Synchronized</span>
        </div>
      </div>
    </div>
  );
}
