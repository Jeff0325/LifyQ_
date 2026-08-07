import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';

import { MODULE_ACCENT, type ModuleId } from '@/constants/moduleColors';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Typically a single primary <Button>. */
  action?: React.ReactNode;
  className?: string;
  /** Tints the icon tile — 'brand' for onboarding/first-run moments, 'neutral' for routine "nothing here yet" states. Ignored when `module` is set. */
  tone?: 'brand' | 'neutral';
  /** Tints the icon tile with this module's own accent color (docs/09
   * Brand Guidelines module color system) — the primary "nothing here
   * yet" empty state for a domain should use this instead of `tone`. */
  module?: ModuleId;
}

/**
 * The designed "nothing here yet" moment every domain gets — never a bare
 * "No items" string. See docs/05_User_Journeys.md Journey F and
 * docs/11_Component_Library.md §4.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  tone = 'neutral',
  module,
}: EmptyStateProps) {
  const accent = module ? MODULE_ACCENT[module] : null;
  const tinted = accent !== null || tone === 'brand';

  return (
    <div
      className={cn(
        'gap-4 py-16 mx-auto flex max-w-[420px] flex-col items-center text-center',
        className,
      )}
    >
      <div
        className={cn(
          'size-14 flex items-center justify-center rounded-2xl',
          accent
            ? accent.iconBg
            : tinted
              ? 'bg-brand-50 dark:bg-brand-950'
              : 'bg-surface-raised',
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            'size-7',
            accent
              ? accent.icon
              : tinted
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-foreground-tertiary',
          )}
        />
      </div>
      <div className="gap-1.5 flex flex-col">
        <h3 className="font-semibold text-h3 text-foreground">{title}</h3>
        {description && (
          <p className="text-body-sm text-foreground-secondary">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
