import type * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Loading placeholder that reserves real layout space (minimizes CLS) and
 * mirrors the shape of the content it stands in for — never a bare spinner
 * for primary content. See docs/18_Performance_Strategy.md §6.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-raised', className)}
      {...props}
    />
  );
}
