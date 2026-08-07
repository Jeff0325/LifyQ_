import { AlertTriangle, RotateCw } from 'lucide-react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Overrides the default Retry button with custom content. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Inline, section-scoped error — for a card or panel whose data failed to
 * load (e.g. a Dashboard summary tile), as opposed to `ErrorPage`, which
 * handles a whole-route failure via React Router's `errorElement`. Never a
 * silent failure. See docs/11_Component_Library.md §6.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = "This section couldn't load. Please try again.",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'gap-4 py-12 mx-auto flex max-w-[420px] flex-col items-center text-center',
        className,
      )}
    >
      <div className="size-12 flex items-center justify-center rounded-2xl bg-danger-subtle">
        <AlertTriangle aria-hidden="true" className="size-6 text-danger" />
      </div>
      <div className="gap-1 flex flex-col">
        <h3 className="font-semibold text-h3 text-foreground">{title}</h3>
        <p className="text-body-sm text-foreground-secondary">{description}</p>
      </div>
      {action ??
        (onRetry && (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Try again
          </Button>
        ))}
    </div>
  );
}
