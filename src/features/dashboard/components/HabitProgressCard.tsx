import { Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProgressRing } from '@/components/shared/ProgressRing';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useHabits, useToggleHabitToday } from '@/features/habits';
import { todayIso } from '@/lib/date';
import { cn } from '@/lib/utils';

export function HabitProgressCard() {
  const { data: habits, isLoading, isError } = useHabits();
  const toggleToday = useToggleHabitToday();
  const today = todayIso();

  const done = (habits ?? []).filter((h) =>
    h.completions.some((c) => c.date === today && c.completed),
  ).length;
  const total = habits?.length ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="min-w-0 gap-3 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <CardTitle>Habit progress</CardTitle>
        <Link
          to={ROUTES.habits}
          className="font-medium inline-flex items-center text-body-sm text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : isError ? (
        <p className="text-body-sm text-foreground-tertiary">
          Couldn&apos;t load habits.
        </p>
      ) : total === 0 ? (
        <p className="text-body-sm text-foreground-secondary">
          No habits yet — start one from the Habits tab.
        </p>
      ) : (
        <div className="gap-4 flex items-center">
          <ProgressRing value={percent} size={64} label={`${done}/${total}`} />
          <ul className="min-w-0 gap-2 flex flex-1 flex-col">
            {(habits ?? []).slice(0, 4).map((habit) => {
              const doneToday = habit.completions.some(
                (c) => c.date === today && c.completed,
              );
              return (
                <li key={habit.id}>
                  <button
                    type="button"
                    onClick={() => toggleToday.mutate(habit)}
                    className="gap-2 flex w-full items-center text-left"
                  >
                    <span
                      className={cn(
                        'size-4 flex shrink-0 items-center justify-center rounded-full border',
                        doneToday
                          ? 'border-brand-600 bg-brand-600'
                          : 'border-border',
                      )}
                    >
                      {doneToday && (
                        <Check
                          aria-hidden="true"
                          className="size-3 text-foreground-on-brand"
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-body-sm',
                        doneToday
                          ? 'text-foreground-tertiary line-through'
                          : 'text-foreground',
                      )}
                    >
                      {habit.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
