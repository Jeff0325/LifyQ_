import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Habit } from '@/features/habits/types';
import { lastNDays } from '@/features/habits/utils';
import { cn } from '@/lib/utils';

const HISTORY_DAYS = 84; // 12 weeks

export interface HabitHistoryViewProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A 12-week completion heatmap for a single habit — the "history view" per the Habits module brief. */
export function HabitHistoryView({
  habit,
  open,
  onOpenChange,
}: HabitHistoryViewProps) {
  const days = lastNDays(habit.completions, HISTORY_DAYS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit.title}</DialogTitle>
          <DialogDescription>
            Last {HISTORY_DAYS} days · {habit.currentStreak}-day current streak
            · longest {habit.longestStreak} days
          </DialogDescription>
        </DialogHeader>

        <div
          className="gap-1 grid grid-flow-col"
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
        >
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}${day.completed ? ' — done' : ''}`}
              className={cn(
                'aspect-square rounded-[3px]',
                day.completed ? 'bg-brand-600' : 'bg-surface-raised',
              )}
            />
          ))}
        </div>

        <div className="gap-2 flex items-center text-caption text-foreground-tertiary">
          <span className="size-2.5 inline-block rounded-[2px] bg-surface-raised" />
          Not done
          <span className="ml-2 size-2.5 inline-block rounded-[2px] bg-brand-600" />
          Done
        </div>
      </DialogContent>
    </Dialog>
  );
}
