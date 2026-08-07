import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_ACCENT, type ModuleId } from '@/constants/moduleColors';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  loading?: boolean;
  /** A semantic status tone, or a module id to tint this tile with that
   * module's own accent color (e.g. Analytics' per-domain stat cards). */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | ModuleId;
}

const STATUS_TONE_CLASS: Record<
  'brand' | 'success' | 'warning' | 'danger',
  string
> = {
  brand: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950',
  success: 'text-success bg-success-subtle',
  warning: 'text-warning bg-warning-subtle',
  danger: 'text-danger bg-danger-subtle',
};

function resolveToneClass(tone: NonNullable<StatTileProps['tone']>): string {
  if (tone in STATUS_TONE_CLASS) {
    return STATUS_TONE_CLASS[tone as keyof typeof STATUS_TONE_CLASS];
  }
  const accent = MODULE_ACCENT[tone as ModuleId];
  return cn(accent.icon, accent.iconBg);
}

export function StatTile({
  icon: Icon,
  label,
  value,
  loading,
  tone = 'brand',
}: StatTileProps) {
  return (
    <div className="gap-3 p-4 flex items-center rounded-xl border border-border bg-surface">
      <div
        className={cn(
          'size-10 flex shrink-0 items-center justify-center rounded-lg',
          resolveToneClass(tone),
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0 flex flex-col">
        {loading ? (
          <Skeleton className="h-6 w-10" />
        ) : (
          <span className="font-semibold text-h3 text-foreground tabular-nums">
            {value}
          </span>
        )}
        <span className="truncate text-caption text-foreground-tertiary">
          {label}
        </span>
      </div>
    </div>
  );
}
