import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * The base card surface used across every domain (task rows, note cards,
 * goal cards compose this). Encodes elevation/radius/padding once — see
 * docs/11_Component_Library.md §4 (AppCard).
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-surface shadow-elevation-1',
      'duration-base ease-standard transition-shadow',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('gap-1.5 p-5 flex flex-col', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-h3 text-foreground', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-sm text-foreground-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('gap-2 p-5 pt-0 flex items-center', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

/** Interactive variant — hover/press feedback for cards that navigate or open something. */
export const InteractiveCard = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'min-w-0 w-full rounded-lg border border-border bg-surface text-left shadow-elevation-1',
      'duration-base ease-standard transition-all',
      'hover:border-border hover:shadow-elevation-2',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
      'active:scale-[0.99]',
      className,
    )}
    {...props}
  />
));
InteractiveCard.displayName = 'InteractiveCard';
