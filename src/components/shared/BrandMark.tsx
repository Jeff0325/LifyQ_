import { cn } from '@/lib/utils';

export interface BrandMarkProps {
  className?: string;
}

/**
 * The LifyQ mark — same geometry as public/favicon.svg, as real tokens
 * instead of a static asset so it themes correctly wherever it's placed
 * (Sidebar, Splash, ...). Placeholder mark per docs/09_Brand_Guidelines.md
 * §4; a commissioned final logo is a separate, non-blocking workstream.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('size-8 shrink-0', className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" className="fill-brand-600" />
      <path
        d="M16 14a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14a4 4 0 0 0 4 4h4a2 2 0 1 1 0 4h-4a8 8 0 0 1-8-8V18h-2a2 2 0 0 1-2-2z"
        className="fill-foreground-on-brand"
      />
      <circle cx="33.5" cy="33.5" r="3.5" className="fill-accent-500" />
    </svg>
  );
}
