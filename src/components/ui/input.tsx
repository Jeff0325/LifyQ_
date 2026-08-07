import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Tier 1 text input. `aria-invalid` (set by the consuming form, e.g. React
 * Hook Form + Zod per docs/14_State_Management_Strategy.md §4) drives the
 * error styling — no separate `invalid` prop to keep a single source of
 * truth for validity state.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-10 px-3 flex w-full rounded-md border border-border bg-surface text-body-sm text-foreground',
          'placeholder:text-foreground-tertiary',
          'duration-base ease-standard transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger',
          'file:font-medium file:border-0 file:bg-transparent file:text-body-sm file:text-foreground',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
