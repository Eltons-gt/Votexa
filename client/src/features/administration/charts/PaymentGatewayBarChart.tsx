import { useState } from 'react';
import { Smartphone } from 'lucide-react';

interface DayComparison {
  day: string;
  mpesaAmount: number; // in cents
  mpesaCount: number;
  paystackAmount: number; // in cents
  paystackCount: number;
}

export function PaymentGatewayBarChart() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days: DayComparison[] = [
    { day: 'Mon', mpesaAmount: 320000, mpesaCount: 420, paystackAmount: 180000, paystackCount: 160 },
    { day: 'Tue', mpesaAmount: 410000, mpesaCount: 510, paystackAmount: 210000, paystackCount: 190 },
    { day: 'Wed', mpesaAmount: 560000, mpesaCount: 710, paystackAmount: 280000, paystackCount: 240 },
    { day: 'Thu', mpesaAmount: 480000, mpesaCount: 600, paystackAmount: 240000, paystackCount: 210 },
    { day: 'Fri', mpesaAmount: 720000, mpesaCount: 890, paystackAmount: 360000, paystackCount: 310 },
    { day: 'Sat', mpesaAmount: 940000, mpesaCount: 1180, paystackAmount: 460000, paystackCount: 410 },
    { day: 'Sun', mpesaAmount: 810000, mpesaCount: 1020, paystackAmount: 390000, paystackCount: 340 }
  ];

  const maxVal = Math.max(...days.flatMap((d) => [d.mpesaAmount, d.paystackAmount])) * 1.15;

  const formatKes = (cents: number) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const totalMpesa = days.reduce((acc, d) => acc + d.mpesaAmount, 0);
  const totalPaystack = days.reduce((acc, d) => acc + d.paystackAmount, 0);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            Payment Gateway Ingestion (M-Pesa vs. Paystack)
          </h3>
          <p className="text-[11px] text-slate-400">
            7-day transaction volumes and gateway health distribution.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
            <span className="text-slate-300 font-medium">M-Pesa STK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]"></span>
            <span className="text-slate-300 font-medium">Paystack</span>
          </div>
        </div>
      </div>

      {/* Bar Columns Container */}
      <div className="relative pt-6 pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end">
          {days.map((item, idx) => {
            const mpesaHeight = (item.mpesaAmount / maxVal) * 100;
            const paystackHeight = (item.paystackAmount / maxVal) * 100;
            const isHovered = hoveredDay === idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-30 bg-slate-900 border border-slate-700/80 rounded-lg p-2 shadow-2xl text-[10px] font-mono whitespace-nowrap min-w-[140px] pointer-events-none">
                    <p className="font-bold text-slate-200 border-b border-slate-800 pb-0.5 mb-1">
                      {item.day} Summary
                    </p>
                    <p className="text-emerald-400 flex justify-between">
                      <span>M-Pesa:</span>
                      <span className="font-bold">{formatKes(item.mpesaAmount)}</span>
                    </p>
                    <p className="text-blue-400 flex justify-between">
                      <span>Paystack:</span>
                      <span className="font-bold">{formatKes(item.paystackAmount)}</span>
                    </p>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-full">
                  {/* M-Pesa Bar */}
                  <div className="w-1/2 max-w-[18px] bg-slate-800/80 rounded-t-md relative flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_#10B981]'
                          : 'bg-gradient-to-t from-emerald-600/80 to-emerald-400/90'
                      }`}
                      style={{ height: `${mpesaHeight}%` }}
                    />
                  </div>

                  {/* Paystack Bar */}
                  <div className="w-1/2 max-w-[18px] bg-slate-800/80 rounded-t-md relative flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_12px_#3B82F6]'
                          : 'bg-gradient-to-t from-blue-600/80 to-cyan-400/90'
                      }`}
                      style={{ height: `${paystackHeight}%` }}
                    />
                  </div>
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Bottom Stats */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400">M-Pesa 7-Day Total</p>
            <p className="font-mono font-bold text-slate-100">{formatKes(totalMpesa)}</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">
            99.6% Success
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-400">Paystack 7-Day Total</p>
            <p className="font-mono font-bold text-slate-100">{formatKes(totalPaystack)}</p>
          </div>
          <span className="text-[10px] font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/20">
            99.1% Success
          </span>
        </div>
      </div>
    </div>
  );
}
