import type * as React from 'react';

import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  /** Single-column reading/forms — docs/08_Design_System.md §4. */
  sm: 'max-w-[640px]',
  /** Dashboard/collection grids — docs/08_Design_System.md §4. */
  lg: 'max-w-[1120px]',
  /** Full width of whatever ancestor sets the edge padding (e.g. AppShell's <main>). */
  full: 'max-w-none',
} as const;

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof SIZE_CLASSES;
}

/**
 * The mobile-first content wrapper every page renders through: centers and
 * caps content width on larger viewports while staying edge-to-edge (modulo
 * the shell's own padding) on phones. Used both inside AppShell (app
 * routes) and standalone (Splash/Onboarding), so the reading measure stays
 * consistent everywhere. See docs/28_Mobile_First_Architecture.md.
 */
export function PageContainer({
  size = 'lg',
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full', SIZE_CLASSES[size], className)}
      {...props}
    />
  );
}
