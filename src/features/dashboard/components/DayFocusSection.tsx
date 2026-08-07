import { CalendarCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_ACCENT } from '@/constants/moduleColors';
import { useEvents } from '@/features/calendar';
import { DayItemRow } from '@/features/dashboard/components/DayItemRow';
import { buildDayAgenda, FEED_DOMAIN_MODULE } from '@/features/dashboard/utils';
import { cn } from '@/lib/utils';
import { healthEventsRepository } from '@/features/health/repository';
import { useReminders, useToggleReminderCompleted } from '@/features/reminders';
import { useTasks, useToggleTaskStatus } from '@/features/tasks';

export interface DaySectionProps {
  date: string;
  dateLabel: string;
}

/**
 * "What's happening on this date?" — driven entirely by the Home screen's
 * week strip selection, not always "today". Calendar events, tasks/
 * reminders due, and health appointments landing on the selected date.
 * Tasks/reminders swipe left to mark done right from here.
 */
export function DayFocusSection({ date, dateLabel }: DaySectionProps) {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: healthEvents, isLoading: healthLoading } = useQuery({
    queryKey: ['health', 'events'],
    queryFn: () => healthEventsRepository.list(),
  });
  const isLoading =
    eventsLoading || tasksLoading || remindersLoading || healthLoading;

  const toggleTaskStatus = useToggleTaskStatus();
  const toggleReminderCompleted = useToggleReminderCompleted();

  const agenda = buildDayAgenda(date, {
    events: events ?? [],
    tasks: tasks ?? [],
    reminders: reminders ?? [],
    healthEvents: healthEvents ?? [],
    bills: [],
    medicines: [],
    lifeRecords: [],
    subscriptions: [],
  });

  return (
    <section className="gap-4 flex flex-col">
      <h2 className="font-semibold tracking-tight text-h3 text-foreground">
        {agenda.isToday ? "Today's Focus" : `${dateLabel} Focus`}
      </h2>

      {isLoading ? (
        <div className="gap-3 flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : agenda.focus.length === 0 ? (
        <div className="gap-3 py-10 flex flex-col items-center rounded-2xl border border-border/60 bg-surface text-center">
          <span className="size-11 flex items-center justify-center rounded-full bg-success-subtle">
            <CalendarCheck aria-hidden="true" className="size-5 text-success" />
          </span>
          <p className="text-body-sm text-foreground-secondary">
            {agenda.isToday
              ? 'Nothing on the books for today — a clear day ahead.'
              : `Nothing planned for ${dateLabel} yet.`}
          </p>
        </div>
      ) : (
        <StaggerList className="gap-2.5 flex flex-col">
          {agenda.focus.map((item) => {
            let onSettle: (() => void) | undefined;
            if (item.domain === 'Task' && item.entityId) {
              const task = tasks?.find((t) => t.id === item.entityId);
              if (task) onSettle = () => toggleTaskStatus.mutate({ task });
            } else if (item.domain === 'Reminder' && item.entityId) {
              const reminder = reminders?.find((r) => r.id === item.entityId);
              if (reminder)
                onSettle = () => toggleReminderCompleted.mutate({ reminder });
            }

            const accent = MODULE_ACCENT[FEED_DOMAIN_MODULE[item.domain]!];

            return (
              <StaggerItem key={item.id}>
                <DayItemRow
                  item={item}
                  iconWrapClassName={cn(accent.iconBg, accent.icon)}
                  onSettle={onSettle}
                  settleLabel="Done"
                />
              </StaggerItem>
            );
          })}
        </StaggerList>
      )}
    </section>
  );
}
