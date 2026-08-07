import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Programmatically-associated form label — never placeholder-as-label. See
 * docs/19_Accessibility_Guidelines.md §5.
 */
export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'font-medium text-body-sm text-foreground',
      'peer-disabled:cursor-not-allowed peer-disabled:text-foreground-disabled',
      className,
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
