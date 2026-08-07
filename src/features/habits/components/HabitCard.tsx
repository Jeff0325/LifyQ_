import {
  Check,
  Flame,
  History,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HabitHistoryView } from '@/features/habits/components/HabitHistoryView';
import {
  useDeleteHabit,
  useToggleHabitToday,
} from '@/features/habits/hooks/useHabits';
import type { Habit } from '@/features/habits/types';
import { lastNDays, todayIso } from '@/features/habits/utils';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const FREQUENCY_LABELS: Record<Habit['frequency'], string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekly: 'Once a week',
};

export interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const toggleToday = useToggleHabitToday();
  const deleteHabit = useDeleteHabit();
  const { toast } = useToast();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doneToday = habit.completions.some(
    (c) => c.date === todayIso() && c.completed,
  );
  const week = lastNDays(habit.completions, 7);

  const handleDelete = async () => {
    await deleteHabit.mutateAsync(habit.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Habit deleted' });
  };

  return (
    <Card className="min-w-0 gap-3 p-4 flex flex-col">
      <div className="gap-3 flex items-start justify-between">
        <div className="min-w-0 gap-0.5 flex flex-col">
          <h3 className="font-semibold truncate text-body-sm text-foreground">
            {habit.title}
          </h3>
          <p className="text-caption text-foreground-tertiary">
            {FREQUENCY_LABELS[habit.frequency]}
            {habit.reminderTime && ` · ${habit.reminderTime}`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${habit.title}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
              <History aria-hidden="true" className="size-4" />
              View history
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(habit)}>
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="gap-3 flex items-center justify-between">
        <div className="gap-3 flex items-center">
          {habit.currentStreak > 0 && (
            <span className="gap-1 font-semibold inline-flex items-center text-body-sm text-accent-600 tabular-nums dark:text-accent-400">
              <Flame aria-hidden="true" className="size-4" />
              {habit.currentStreak}
            </span>
          )}
          <div className="gap-1 flex items-center" aria-hidden="true">
            {week.map((day) => (
              <span
                key={day.date}
                className={cn(
                  'size-2 rounded-full',
                  day.completed ? 'bg-brand-600' : 'bg-surface-raised',
                )}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleToday.mutate(habit)}
          aria-pressed={doneToday}
          aria-label={
            doneToday
              ? `Mark ${habit.title} as not done today`
              : `Mark ${habit.title} as done today`
          }
          className={cn(
            'size-10 duration-base ease-standard flex shrink-0 items-center justify-center rounded-full border transition-colors',
            doneToday
              ? 'border-brand-600 bg-brand-600 text-foreground-on-brand'
              : 'border-border text-foreground-tertiary hover:border-brand-600 hover:text-brand-600',
          )}
        >
          <Check aria-hidden="true" className="size-5" />
        </button>
      </div>

      <HabitHistoryView
        habit={habit}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this habit?"
        description={`"${habit.title}" and its history will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteHabit.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
