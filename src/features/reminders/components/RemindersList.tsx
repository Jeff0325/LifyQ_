import { BellRing } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { ReminderFormDialog } from '@/features/reminders/components/ReminderFormDialog';
import { ReminderRow } from '@/features/reminders/components/ReminderRow';
import { RemindersSkeleton } from '@/features/reminders/components/RemindersSkeleton';
import { useReminders } from '@/features/reminders/hooks/useReminders';
import type { Reminder, ReminderFilters } from '@/features/reminders/types';

function matchesFilters(reminder: Reminder, filters: ReminderFilters): boolean {
  if (filters.status === 'upcoming' && reminder.completed) return false;
  if (filters.status === 'completed' && !reminder.completed) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!reminder.title.toLowerCase().includes(needle)) return false;
  }
  return true;
}

export interface RemindersListProps {
  filters: ReminderFilters;
  onCreate: () => void;
}

export function RemindersList({ filters, onCreate }: RemindersListProps) {
  const { data: reminders, isLoading, isError, refetch } = useReminders();
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(
    undefined,
  );

  const visible = useMemo(() => {
    if (!reminders) return [];
    return [...reminders]
      .filter((reminder) => matchesFilters(reminder, filters))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.remindAt.localeCompare(b.remindAt);
      });
  }, [reminders, filters]);

  if (isLoading) return <RemindersSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your reminders"
        onRetry={() => void refetch()}
      />
    );
  }

  if (reminders && reminders.length === 0) {
    return (
      <EmptyState
        icon={BellRing}
        title="No reminders yet"
        description="A lightweight nudge for anything that doesn't belong to a task or habit."
        module="reminders"
        action={<Button onClick={onCreate}>New reminder</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={BellRing}
        title="No reminders match your filters"
        description="Try a different search or status."
      />
    );
  }

  return (
    <>
      <StaggerList className="flex flex-col">
        {visible.map((reminder) => (
          <StaggerItem key={reminder.id}>
            <ReminderRow reminder={reminder} onEdit={setEditingReminder} />
          </StaggerItem>
        ))}
      </StaggerList>

      <ReminderFormDialog
        open={!!editingReminder}
        onOpenChange={(open) => !open && setEditingReminder(undefined)}
        reminder={editingReminder}
      />
    </>
  );
}
