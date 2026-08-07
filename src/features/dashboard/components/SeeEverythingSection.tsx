import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SeeEverythingSectionProps {
  children: React.ReactNode;
}

/**
 * The progressive-disclosure layer docs/37_Dashboard_Design_Philosophy.md
 * §5 calls for — collapsed by default so the urgency feed above it is what
 * a returning user actually sees first, one predictable tap away from the
 * full module-by-module breakdown. No new primitive: a boolean toggle +
 * conditional render, matching the "show the smallest correct answer
 * first" rule in docs/36_UX_Philosophy.md §2.
 */
export function SeeEverythingSection({ children }: SeeEverythingSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="gap-4 flex flex-col">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-fit"
      >
        {open ? 'Hide the details' : 'See everything'}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'duration-base ease-standard transition-transform',
            open && 'rotate-180',
          )}
        />
      </Button>
      {open && <div className="gap-6 flex flex-col">{children}</div>}
    </div>
  );
}
