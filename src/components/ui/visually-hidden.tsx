import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Screen-reader-only text. Used for accessible names on icon-only controls
 * (e.g. the sidebar collapse toggle) per docs/19_Accessibility_Guidelines.md §5.
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'absolute h-px w-px overflow-hidden whitespace-nowrap',
      '[clip:rect(0,0,0,0)]',
      className,
    )}
    {...props}
  />
));
VisuallyHidden.displayName = 'VisuallyHidden';
