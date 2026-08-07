import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Tier 1 primitive per docs/11_Component_Library.md §3. Themed exclusively
 * through semantic design tokens (docs/08_Design_System.md) — never raw
 * Tailwind palette utilities, so re-theming never touches this file.
 *
 * `buttonVariants` is also exported so non-<button> elements (e.g. a
 * react-router `<Link>`) can be styled identically — see
 * src/pages/NotFound.tsx for the pattern, or pass `asChild`.
 */
// eslint-disable-next-line react-refresh/only-export-components -- intentional: shared with Link-as-button usage
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-body-sm font-medium',
    'transition-colors duration-base ease-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-foreground-on-brand hover:bg-brand-700',
        secondary:
          'bg-surface-raised text-foreground border border-border hover:bg-surface',
        ghost: 'text-foreground hover:bg-surface-raised',
        destructive: 'bg-danger text-foreground-on-brand hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-caption [&_svg]:size-4',
        md: 'h-10 px-4 [&_svg]:size-5',
        lg: 'h-12 px-6 text-body [&_svg]:size-5',
        icon: 'size-10 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the single child element (e.g. a router `<Link>`) instead of a `<button>`, merging props/className via Radix Slot. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', asChild, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        />
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
