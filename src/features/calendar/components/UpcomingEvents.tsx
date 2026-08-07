import type { CalendarEvent } from '@/features/calendar/types';
import {
  formatFriendlyDate,
  formatTimeRange,
  todayIso,
} from '@/features/calendar/utils';
import { toIsoDate } from '@/lib/date';

export interface UpcomingEventsProps {
  events: CalendarEvent[];
  /** How many days ahead (exclusive of today) to include. */
  daysAhead?: number;
  limit?: number;
}

/** A compact, read-only look-ahead — separate from the selected day's agenda. */
export function UpcomingEvents({
  events,
  daysAhead = 13,
  limit = 6,
}: UpcomingEventsProps) {
  const today = todayIso();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);
  const cutoffIso = toIsoDate(cutoff);

  const upcoming = events
    .filter((event) => event.date > today && event.date <= cutoffIso)
    .sort((a, b) =>
      a.date === b.date
        ? (a.startTime ?? '').localeCompare(b.startTime ?? '')
        : a.date < b.date
          ? -1
          : 1,
    )
    .slice(0, limit);

  if (upcoming.length === 0) {
    return (
      <p className="text-body-sm text-foreground-tertiary">
        Nothing else on the horizon yet.
      </p>
    );
  }

  return (
    <ul className="gap-2.5 flex flex-col">
      {upcoming.map((event) => (
        <li
          key={event.id}
          className="gap-3 flex items-center justify-between text-body-sm"
        >
          <span className="min-w-0 truncate text-foreground">
            {event.title}
          </span>
          <span className="shrink-0 text-caption text-foreground-tertiary">
            {formatFriendlyDate(event.date)} · {formatTimeRange(event)}
          </span>
        </li>
      ))}
    </ul>
  );
}
