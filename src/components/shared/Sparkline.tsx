import { cn } from '@/lib/utils';

export interface SparklineProps {
  /** Chronological series, oldest first. */
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  /** Accessible summary — e.g. "Steps, last 7 days, trending up". Required since the SVG conveys no text. */
  label: string;
}

/**
 * Minimal inline trend line — the foundation-level chart primitive for
 * stat tiles and habit/goal cards (docs/11_Component_Library.md §4). A
 * lone series needs no legend/axes; per the dataviz method, 2px line,
 * rounded end anchored to the last value, single sequential hue (brand).
 * Full multi-series/interactive charts (tooltips, legends, filters) are
 * built when the Analytics domain ships — see docs/07_Feature_Roadmap.md.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  label,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`)
    .join(' ');
  const last = points[points.length - 1]!;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={cn('h-auto max-w-full', className)}
    >
      <path
        d={path}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand-600"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} className="fill-brand-600" />
    </svg>
  );
}
