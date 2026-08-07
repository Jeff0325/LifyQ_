import type * as React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** Defaults to "N%". Pass `null` to render no center content. */
  label?: React.ReactNode | null;
}

/**
 * Circular progress — the primary chart-adjacent primitive for Goal
 * completion and Habit targets (docs/11_Component_Library.md §4). Single
 * sequential hue (brand-600); a lone series needs no legend. Respects
 * `prefers-reduced-motion` by not animating the stroke sweep on mount.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  label,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-border-subtle"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="duration-slow ease-standard fill-none stroke-brand-600 transition-[stroke-dashoffset] motion-reduce:transition-none"
        />
      </svg>
      {label !== null && (
        <span className="font-semibold absolute text-caption text-foreground tabular-nums">
          {label ?? `${Math.round(clamped)}%`}
        </span>
      )}
    </div>
  );
}
