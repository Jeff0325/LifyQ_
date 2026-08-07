import { Calendar, CheckSquare, Repeat, Target } from 'lucide-react';

import { StatTile } from '@/features/dashboard/components/StatTile';
import { useGoals } from '@/features/goals';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';
import { useEvents } from '@/features/calendar';
import { todayIso } from '@/lib/date';

export function DailyOverview() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: events, isLoading: eventsLoading } = useEvents();

  const today = todayIso();
  const tasksDueToday =
    tasks?.filter((t) => t.dueDate === today && t.status !== 'done').length ??
    0;
  const activeGoals = goals?.filter((g) => g.status === 'active').length ?? 0;
  const habitsDoneToday =
    habits?.filter((h) =>
      h.completions.some((c) => c.date === today && c.completed),
    ).length ?? 0;
  const eventsToday = events?.filter((e) => e.date === today).length ?? 0;

  return (
    <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
      <StatTile
        icon={CheckSquare}
        label="Tasks due today"
        value={String(tasksDueToday)}
        loading={tasksLoading}
      />
      <StatTile
        icon={Repeat}
        label={`Habits done${habits ? ` (of ${habits.length})` : ''}`}
        value={String(habitsDoneToday)}
        loading={habitsLoading}
        tone="success"
      />
      <StatTile
        icon={Target}
        label="Active goals"
        value={String(activeGoals)}
        loading={goalsLoading}
        tone="warning"
      />
      <StatTile
        icon={Calendar}
        label="Events today"
        value={String(eventsToday)}
        loading={eventsLoading}
        tone="brand"
      />
    </div>
  );
}
