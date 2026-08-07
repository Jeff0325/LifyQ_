import { BarChart } from '@/components/shared/BarChart';
import { Sparkline } from '@/components/shared/Sparkline';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  goalProgressByGoal,
  habitConsistencyByHabit,
  taskCompletionTrend,
} from '@/features/analytics/utils';
import { useGoals } from '@/features/goals';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';

const TREND_DAYS = 14;

/**
 * Task/goal/habit insight — the "plan → act" loop from docs/07's Phase 1
 * rationale, viewed as a trend instead of Dashboard's point-in-time
 * snapshot. Reads `useTasks`/`useGoals`/`useHabits` directly, the same
 * cross-feature-read this session already sanctioned for Projects reading
 * Tasks/Goals (docs/12 §5 precedent) — Analytics is the domain that exists
 * specifically to aggregate every other domain, so it's the clearest case
 * for that precedent yet.
 */
export function ProductivitySection() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const trend = taskCompletionTrend(tasks ?? [], TREND_DAYS);
  const totalCompleted = trend.reduce((sum, n) => sum + n, 0);
  const goalBars = goalProgressByGoal(goals ?? []);
  const habitBars = habitConsistencyByHabit(habits ?? []);

  return (
    <Card className="gap-5 p-5 flex flex-col">
      <CardTitle>Productivity</CardTitle>

      <div className="gap-4 flex flex-col">
        <div className="gap-1 flex flex-col">
          <span className="text-caption text-foreground-tertiary">
            Tasks completed, last {TREND_DAYS} days
          </span>
          {tasksLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="gap-3 flex items-center justify-between">
              <span className="font-semibold text-h2 text-foreground tabular-nums">
                {totalCompleted}
              </span>
              <Sparkline
                data={trend}
                label={`Tasks completed, last ${TREND_DAYS} days`}
                width={180}
                height={40}
              />
            </div>
          )}
        </div>

        <div className="gap-1 flex flex-col">
          <span className="text-caption text-foreground-tertiary">
            Goal progress
          </span>
          {goalsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : goalBars.length === 0 ? (
            <p className="py-2 text-body-sm text-foreground-tertiary">
              No active goals yet.
            </p>
          ) : (
            <BarChart
              data={goalBars}
              label="Progress by active goal"
              formatValue={(v) => `${v}%`}
              width={320}
              height={160}
            />
          )}
        </div>

        <div className="gap-1 flex flex-col">
          <span className="text-caption text-foreground-tertiary">
            Habit consistency, last 30 days
          </span>
          {habitsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : habitBars.length === 0 ? (
            <p className="py-2 text-body-sm text-foreground-tertiary">
              No habits yet.
            </p>
          ) : (
            <BarChart
              data={habitBars}
              label="Habit consistency, last 30 days"
              formatValue={(v) => `${v}%`}
              width={320}
              height={160}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
