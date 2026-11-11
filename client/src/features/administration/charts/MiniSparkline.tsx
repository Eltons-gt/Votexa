interface MiniSparklineProps {
  data: number[];
  color?: string; // hex or tailwind-compatible color
  fillGradientId: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function MiniSparkline({
  data,
  color = '#10B981',
  fillGradientId,
  width = 120,
  height = 36,
  strokeWidth = 2
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const paddingX = 4;
  const paddingY = 4;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * usableWidth;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  if (points.length < 2 || !points[0]) return null;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1] || firstPoint;

  // Calculate smooth Bezier line
  let linePath = `M ${firstPoint.x} ${firstPoint.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1] ?? firstPoint;
    const p1 = points[i] ?? firstPoint;
    const p2 = points[i + 1] ?? lastPoint;
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area */}
      <path d={areaPath} fill={`url(#${fillGradientId})`} />
      {/* Stroke Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glowing End Dot */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={3}
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}
