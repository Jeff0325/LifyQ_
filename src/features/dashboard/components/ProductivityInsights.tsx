import { TrendingUp } from 'lucide-react';

import { Sparkline } from '@/components/shared/Sparkline';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';
import { toIsoDate } from '@/lib/date';

function lastSevenDayCounts(completedAtDates: string[]): number[] {
  const counts: number[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toIsoDate(d);
    counts.push(completedAtDates.filter((date) => date === iso).length);
  }
  return counts;
}

export function ProductivityInsights() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const isLoading = tasksLoading || habitsLoading;

  const completedDates = (tasks ?? [])
    .filter((t) => t.completedAt)
    .map((t) => t.completedAt!.slice(0, 10));
  const trend = lastSevenDayCounts(completedDates);
  const totalThisWeek = trend.reduce((sum, n) => sum + n, 0);
  const bestHabit = [...(habits ?? [])].sort(
    (a, b) => b.currentStreak - a.currentStreak,
  )[0];

  return (
    <Card className="gap-3 p-5 flex flex-col">
      <CardTitle>Productivity insights</CardTitle>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <div className="gap-4 flex items-center justify-between">
          <div className="gap-1 flex flex-col">
            <span className="font-semibold text-h2 text-foreground tabular-nums">
              {totalThisWeek}
            </span>
            <span className="text-caption text-foreground-tertiary">
              tasks completed, last 7 days
            </span>
            {bestHabit && bestHabit.currentStreak > 0 && (
              <span className="mt-1 gap-1 inline-flex items-center text-caption text-foreground-secondary">
                <TrendingUp aria-hidden="true" className="size-3.5" />
                &ldquo;{bestHabit.title}&rdquo; — {bestHabit.currentStreak}-day
                streak
              </span>
            )}
          </div>
          <Sparkline
            data={trend}
            label="Tasks completed, last 7 days"
            width={120}
            height={40}
          />
        </div>
      )}
    </Card>
  );
}
