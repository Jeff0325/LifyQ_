import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useBills, useToggleBillPaid } from '@/features/bills';
import { DayItemRow } from '@/features/dashboard/components/DayItemRow';
import { buildDayAgenda } from '@/features/dashboard/utils';
import { medicinesRepository } from '@/features/health/repository';
import { useLifeRecords } from '@/features/life-records';
import { useReminders, useToggleReminderCompleted } from '@/features/reminders';
import {
  useSubscriptions,
  useUpdateSubscription,
} from '@/features/subscriptions';
import { useTasks, useToggleTaskStatus } from '@/features/tasks';
import { toIsoDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { DaySectionProps } from '@/features/dashboard/components/DayFocusSection';

/** Advances a renewal date one billing cycle forward from itself — a
 * "swipe to mark renewed" always moves the *next* renewal date on, it never
 * just clears today's flag. */
function nextRenewalDate(fromIso: string, cycle: 'monthly' | 'yearly'): string {
  const d = new Date(`${fromIso}T00:00:00`);
  if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return toIsoDate(d);
}

/**
 * "Needs Attention" — for today, the full forward-looking view (Overdue /
 * Due Soon / Expiring Soon); for any other date on the week strip, a
 * narrower same-day preview (see `buildDayAgenda`). Bills swipe left to
 * mark paid, subscriptions to mark renewed — each settling per its own
 * purpose, never a generic "dismiss".
 */
export function DayAttentionSection({ date, dateLabel }: DaySectionProps) {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: reminders, isLoading: remindersLoading } = useReminders();
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: lifeRecords, isLoading: recordsLoading } = useLifeRecords();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();
  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['health', 'medicines'],
    queryFn: () => medicinesRepository.list(),
  });

  const isLoading =
    tasksLoading ||
    remindersLoading ||
    billsLoading ||
    recordsLoading ||
    subsLoading ||
    medicinesLoading;

  const toggleBillPaid = useToggleBillPaid();
  const updateSubscription = useUpdateSubscription();
  const toggleTaskStatus = useToggleTaskStatus();
  const toggleReminderCompleted = useToggleReminderCompleted();

  const agenda = buildDayAgenda(date, {
    tasks: tasks ?? [],
    events: [],
    reminders: reminders ?? [],
    healthEvents: [],
    bills: bills ?? [],
    medicines: medicines ?? [],
    lifeRecords: lifeRecords ?? [],
    subscriptions: subscriptions ?? [],
  });

  const groups = [
    agenda.overdue.length > 0 && {
      key: 'overdue',
      label: 'Overdue',
      dotClass: 'bg-danger',
      badgeClass: 'bg-danger-subtle text-danger',
      items: agenda.overdue,
    },
    agenda.dueSoon.length > 0 && {
      key: 'due-soon',
      label: 'Due Soon',
      dotClass: 'bg-warning',
      badgeClass: 'bg-warning-subtle text-warning',
      items: agenda.dueSoon,
    },
    agenda.expiringSoon.length > 0 && {
      key: 'expiring-soon',
      label: 'Expiring Soon',
      dotClass: 'bg-info',
      badgeClass: 'bg-info-subtle text-info',
      items: agenda.expiringSoon,
    },
    agenda.dueOnDate.length > 0 && {
      key: 'due-on-date',
      label: `Due ${dateLabel}`,
      dotClass: 'bg-warning',
      badgeClass: 'bg-warning-subtle text-warning',
      items: agenda.dueOnDate,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    dotClass: string;
    badgeClass: string;
    items: typeof agenda.overdue;
  }[];

  return (
    <section className="gap-4 flex flex-col">
      <h2 className="font-semibold tracking-tight text-h3 text-foreground">
        Needs Attention
      </h2>

      {isLoading ? (
        <div className="gap-3 flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="gap-3 py-10 flex flex-col items-center rounded-2xl border border-border/60 bg-surface text-center">
          <span className="size-11 flex items-center justify-center rounded-full bg-success-subtle">
            <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
          </span>
          <p className="text-body-sm text-foreground-secondary">
            {agenda.isToday
              ? "Nothing needs your attention right now — you're all caught up."
              : `Nothing needs attention on ${dateLabel}.`}
          </p>
        </div>
      ) : (
        <div className="gap-5 flex flex-col">
          {groups.map((group) => (
            <div key={group.key} className="gap-2.5 flex flex-col">
              <span className="gap-1.5 pl-1 font-medium tracking-wider flex items-center text-caption text-foreground-tertiary uppercase">
                <span
                  aria-hidden="true"
                  className={cn('size-1.5 rounded-full', group.dotClass)}
                />
                {group.label}
              </span>
              <StaggerList className="gap-2.5 flex flex-col">
                {group.items.map((item) => {
                  let onSettle: (() => void) | undefined;
                  let settleLabel: string | undefined;
                  if (item.domain === 'Task' && item.entityId) {
                    const task = tasks?.find((t) => t.id === item.entityId);
                    if (task) {
                      onSettle = () => toggleTaskStatus.mutate({ task });
                      settleLabel = 'Done';
                    }
                  } else if (item.domain === 'Reminder' && item.entityId) {
                    const reminder = reminders?.find(
                      (r) => r.id === item.entityId,
                    );
                    if (reminder) {
                      onSettle = () =>
                        toggleReminderCompleted.mutate({ reminder });
                      settleLabel = 'Done';
                    }
                  } else if (item.domain === 'Bill' && item.entityId) {
                    const bill = bills?.find((b) => b.id === item.entityId);
                    if (bill) {
                      onSettle = () => toggleBillPaid.mutate({ bill });
                      settleLabel = 'Paid';
                    }
                  } else if (item.domain === 'Subscription' && item.entityId) {
                    const sub = subscriptions?.find(
                      (s) => s.id === item.entityId,
                    );
                    if (sub) {
                      onSettle = () =>
                        updateSubscription.mutate({
                          id: sub.id,
                          input: {
                            nextRenewalAt: nextRenewalDate(
                              sub.nextRenewalAt,
                              sub.billingCycle,
                            ),
                          },
                        });
                      settleLabel = 'Renewed';
                    }
                  }

                  return (
                    <StaggerItem key={item.id}>
                      <DayItemRow
                        item={item}
                        iconWrapClassName={group.badgeClass}
                        onSettle={onSettle}
                        settleLabel={settleLabel}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerList>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
