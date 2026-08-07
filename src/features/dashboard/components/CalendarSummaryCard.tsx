import { ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { formatTimeRange, useEvents } from '@/features/calendar';
import { todayIso } from '@/lib/date';

export function CalendarSummaryCard() {
  const { data: events, isLoading, isError } = useEvents();
  const today = todayIso();

  const todayEvents = (events ?? [])
    .filter((e) => e.date === today)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    .slice(0, 4);

  return (
    <Card className="min-w-0 gap-3 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <CardTitle>Today&apos;s schedule</CardTitle>
        <Link
          to={ROUTES.calendar}
          className="font-medium inline-flex items-center text-body-sm text-brand-600 hover:text-brand-700"
        >
          View calendar
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : isError ? (
        <p className="text-body-sm text-foreground-tertiary">
          Couldn&apos;t load your calendar.
        </p>
      ) : todayEvents.length === 0 ? (
        <p className="text-body-sm text-foreground-secondary">
          Nothing scheduled today.
        </p>
      ) : (
        <ul className="gap-2.5 flex flex-col">
          {todayEvents.map((event) => (
            <li key={event.id} className="gap-2 flex items-center text-body-sm">
              <Clock
                aria-hidden="true"
                className="size-3.5 shrink-0 text-foreground-tertiary"
              />
              <span className="shrink-0 text-foreground-tertiary tabular-nums">
                {formatTimeRange(event)}
              </span>
              <span className="min-w-0 truncate text-foreground">
                {event.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
