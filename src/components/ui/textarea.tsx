import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'px-3 py-2 flex w-full rounded-md border border-border bg-surface text-body-sm text-foreground',
          'placeholder:text-foreground-tertiary',
          'duration-base ease-standard transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger',
          'resize-y',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
