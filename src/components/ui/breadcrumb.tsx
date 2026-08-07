import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Wayfinding trail for entity detail views (e.g. "Project: Marathon
 * Training" above a Task title) — docs/10_Navigation_Architecture.md §7.
 * Composable like the rest of the primitives: `Breadcrumb` >
 * `BreadcrumbList` > `BreadcrumbItem` (+ `BreadcrumbSeparator` between).
 */
export function Breadcrumb(props: React.ComponentPropsWithoutRef<'nav'>) {
  return <nav aria-label="Breadcrumb" {...props} />;
}

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'gap-1.5 flex flex-wrap items-center text-body-sm text-foreground-tertiary',
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('gap-1.5 inline-flex items-center', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      'duration-base ease-standard rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      className,
    )}
    {...props}
  >
    {children}
  </a>
));
BreadcrumbLink.displayName = 'BreadcrumbLink';

export function BreadcrumbPage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'li'>) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn('size-6 flex items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
