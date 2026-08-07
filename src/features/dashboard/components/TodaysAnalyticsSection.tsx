import { CheckSquare, Receipt, Sparkles, TrendingUp } from 'lucide-react';

import { useBills } from '@/features/bills';
import { habitConsistency } from '@/features/analytics/utils';
import { StatTile } from '@/features/dashboard/components/StatTile';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';
import { todayIso } from '@/lib/date';

/**
 * A lightweight "how's my day going" summary — derived, single-number
 * stats only, never the underlying item lists (those already live in
 * Today's Focus/Needs Attention, so nothing here repeats them).
 */
export function TodaysAnalyticsSection() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: bills, isLoading: billsLoading } = useBills();
  const isLoading = tasksLoading || habitsLoading || billsLoading;

  const today = todayIso();
  const monthPrefix = today.slice(0, 7);

  const taskList = tasks ?? [];
  const habitList = habits ?? [];
  const billList = bills ?? [];

  const tasksCompletedToday = taskList.filter(
    (t) => t.completedAt?.slice(0, 10) === today,
  ).length;

  const habitPct = habitConsistency(habitList, 30);

  const billsPaidThisMonth = billList.reduce(
    (count, bill) =>
      count +
      bill.paidHistory.filter((p) => p.date.startsWith(monthPrefix)).length,
    0,
  );

  const todaysTasks = taskList.filter((t) => t.dueDate === today);
  const taskPctToday =
    todaysTasks.length > 0
      ? Math.round(
          (todaysTasks.filter((t) => t.status === 'done').length /
            todaysTasks.length) *
            100,
        )
      : null;
  const habitsDoneToday = habitList.filter((h) =>
    h.completions.some((c) => c.date === today && c.completed),
  ).length;
  const habitPctToday =
    habitList.length > 0
      ? Math.round((habitsDoneToday / habitList.length) * 100)
      : null;
  const dailyProgressParts = [taskPctToday, habitPctToday].filter(
    (p): p is number => p !== null,
  );
  const dailyProgress =
    dailyProgressParts.length > 0
      ? Math.round(
          dailyProgressParts.reduce((sum, p) => sum + p, 0) /
            dailyProgressParts.length,
        )
      : 0;

  return (
    <section className="gap-4 flex flex-col">
      <h2 className="font-semibold tracking-tight text-h3 text-foreground">
        Today&apos;s Analytics
      </h2>
      <div className="gap-3 grid grid-cols-2">
        <StatTile
          icon={CheckSquare}
          label="Tasks completed today"
          value={String(tasksCompletedToday)}
          loading={isLoading}
          tone="tasks"
        />
        <StatTile
          icon={Sparkles}
          label="Daily progress"
          value={`${dailyProgress}%`}
          loading={isLoading}
          tone="brand"
        />
        <StatTile
          icon={TrendingUp}
          label="Habit consistency (30d)"
          value={`${habitPct}%`}
          loading={isLoading}
          tone="habits"
        />
        <StatTile
          icon={Receipt}
          label="Bills paid this month"
          value={String(billsPaidThisMonth)}
          loading={isLoading}
          tone="bills"
        />
      </div>
    </section>
  );
}
