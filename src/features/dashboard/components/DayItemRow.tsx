import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Swipeable } from '@/components/shared/Swipeable';
import type { FeedItem } from '@/features/dashboard/utils';
import { cn } from '@/lib/utils';

export interface DayItemRowProps {
  item: FeedItem;
  iconWrapClassName: string;
  /** Present only for domains with one unambiguous "settle" action
   * (Task → done, Reminder → done, Bill → paid, Subscription → renewed).
   * Undefined means the row isn't swipeable — Calendar/Health/Medicine/
   * Life Record items still need their real edit form for a new date. */
  onSettle?: () => void;
  settleLabel?: string;
}

/** One Home-screen agenda row — a swipe-left-to-settle gesture layered on
 * top when the item's domain has one, per its own purpose (mark a task
 * done, a bill paid, a subscription renewed). */
export function DayItemRow({
  item,
  iconWrapClassName,
  onSettle,
  settleLabel,
}: DayItemRowProps) {
  const row = (
    <Link
      to={item.href}
      className="gap-3.5 px-4 py-3.5 duration-base ease-standard flex items-center rounded-2xl border border-border/60 bg-surface shadow-elevation-1 transition-all hover:border-border hover:shadow-elevation-2 active:scale-[0.99]"
    >
      <span
        className={cn(
          'size-9 flex shrink-0 items-center justify-center rounded-full',
          iconWrapClassName,
        )}
      >
        <item.icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 font-medium flex-1 truncate text-body-sm text-foreground">
        {item.title}
      </span>
      <span className="font-medium shrink-0 text-caption text-foreground-tertiary">
        {item.subtitle}
      </span>
    </Link>
  );

  if (!onSettle) return row;

  return (
    <Swipeable
      className="rounded-2xl"
      onSwipeLeft={onSettle}
      rightAction={
        <span className="min-w-20 px-4 gap-1.5 font-medium flex h-full items-center justify-center rounded-2xl bg-success text-body-sm text-foreground-on-brand">
          <Check aria-hidden="true" className="size-4" />
          {settleLabel}
        </span>
      }
    >
      {row}
    </Swipeable>
  );
}
