import { cn } from '@/lib/utils';

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  className?: string;
  /** Accessible summary — e.g. "Spending by category, last 30 days". Required since the SVG conveys no text. */
  label: string;
  /** Formats the value shown above each bar. Defaults to the raw number. */
  formatValue?: (value: number) => string;
}

const BAR_FILL_CLASSES = [
  'fill-chart-1',
  'fill-chart-2',
  'fill-chart-3',
  'fill-chart-4',
  'fill-chart-5',
  'fill-chart-6',
  'fill-chart-7',
  'fill-chart-8',
];

/**
 * A minimal categorical bar chart — the second chart-adjacent primitive
 * alongside Sparkline (docs/11_Component_Library.md §4), built when the
 * Analytics domain shipped (docs/07_Feature_Roadmap.md). Each bar cycles
 * through the fixed 8-hue CVD-safe --color-chart-N palette (tokens.css) in
 * category order — never reassigned per-render, so a given position always
 * reads the same hue. No axes/legend/tooltips: value and label are printed
 * directly above/below each bar, matching Sparkline's "no chrome for a
 * small, self-contained series" approach rather than pulling in a charting
 * library.
 */
export function BarChart({
  data,
  width = 320,
  height = 180,
  className,
  label,
  formatValue = (value) => `${value}`,
}: BarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  const gap = 12;
  const barWidth = (width - gap * (data.length - 1)) / data.length;
  const labelSpace = 36;
  const valueSpace = 18;
  const plotHeight = height - labelSpace - valueSpace;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className={cn('h-auto max-w-full', className)}
    >
      {data.map((d, i) => {
        const barHeight = (d.value / max) * plotHeight;
        const x = i * (barWidth + gap);
        const y = valueSpace + (plotHeight - barHeight);
        return (
          <g key={d.label}>
            <text
              x={x + barWidth / 2}
              y={valueSpace - 4}
              textAnchor="middle"
              className="fill-foreground-tertiary text-[10px] tabular-nums"
            >
              {formatValue(d.value)}
            </text>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={4}
              className={BAR_FILL_CLASSES[i % BAR_FILL_CLASSES.length]}
            />
            <text
              x={x + barWidth / 2}
              y={height - labelSpace + 16}
              textAnchor="middle"
              className="fill-foreground-tertiary text-[10px]"
            >
              {d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
