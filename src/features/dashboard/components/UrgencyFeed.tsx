import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBills } from '@/features/bills';
import { useEvents } from '@/features/calendar';
import { buildUrgencyFeed } from '@/features/dashboard/utils';
import { medicinesRepository } from '@/features/health/repository';
import { useLifeRecords } from '@/features/life-records';
import { useReminders } from '@/features/reminders';
import { useSubscriptions } from '@/features/subscriptions';
import { useTasks } from '@/features/tasks';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const SEVERITY_CLASS: Record<'overdue' | 'today' | 'upcoming', string> = {
  overdue: 'text-danger',
  today: 'text-warning',
  upcoming: 'text-foreground-tertiary',
};

/**
 * The redesigned Dashboard's headline content — one urgency-sorted feed
 * replacing the separate stat rows + "Needs attention" lists
 * `LifeAdminOverview`/`PlanningOverview` used to render on their own
 * (docs/37_Dashboard_Design_Philosophy.md §3–4). Reads the same domain
 * hooks those components already used — no new data layer, a presentation
 * change (see `buildUrgencyFeed`).
 */
export function UrgencyFeed() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: lifeRecords, isLoading: recordsLoading } = useLifeRecords();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();
  // Health's medicines hook isn't re-exported from the feature barrel
  // (only the tabbed section component is) — reading the repository
  // directly here is the same sanctioned Dashboard cross-feature-read
  // every other card on this page already relies on (docs/12 §5).
  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['health', 'medicines'],
    queryFn: () => medicinesRepository.list(),
  });

  const isLoading =
    tasksLoading ||
    eventsLoading ||
    remindersLoading ||
    billsLoading ||
    recordsLoading ||
    subsLoading ||
    medicinesLoading;

  const feed = buildUrgencyFeed({
    tasks: tasks ?? [],
    events: events ?? [],
    reminders: reminders ?? [],
    bills: bills ?? [],
    medicines: medicines ?? [],
    lifeRecords: lifeRecords ?? [],
    subscriptions: subscriptions ?? [],
  });

  return (
    <Card className="min-w-0 gap-3 p-5 flex flex-col">
      <CardTitle>What needs your attention</CardTitle>

      {isLoading ? (
        <div className="gap-3 flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="gap-2 py-6 flex flex-col items-center text-center">
          <CheckCircle2 aria-hidden="true" className="size-6 text-success" />
          <p className="text-body-sm text-foreground-secondary">
            Nothing urgent right now — you&apos;re all caught up.
          </p>
        </div>
      ) : (
        <ul className="gap-2.5 flex flex-col">
          {feed.slice(0, 8).map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="gap-2.5 -mx-1 px-1 py-1 flex items-center rounded-md hover:bg-surface-raised"
              >
                <item.icon
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0',
                    SEVERITY_CLASS[item.severity],
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">
                  {item.title}
                </span>
                <span
                  className={cn(
                    'font-medium shrink-0 text-caption',
                    SEVERITY_CLASS[item.severity],
                  )}
                >
                  {item.subtitle}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
