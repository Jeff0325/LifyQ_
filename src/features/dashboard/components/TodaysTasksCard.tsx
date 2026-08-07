import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useTasks, useToggleTaskStatus } from '@/features/tasks';
import { todayIso } from '@/lib/date';
import { cn } from '@/lib/utils';

export function TodaysTasksCard() {
  const { data: tasks, isLoading, isError } = useTasks();
  const toggleStatus = useToggleTaskStatus();
  const today = todayIso();

  const relevant = (tasks ?? [])
    .filter(
      (t) =>
        t.status !== 'done' &&
        (t.dueDate === today || (t.dueDate && t.dueDate < today)),
    )
    .slice(0, 5);

  return (
    <Card className="min-w-0 gap-3 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <CardTitle>Today&apos;s tasks</CardTitle>
        <Link
          to={ROUTES.tasks}
          className="font-medium inline-flex items-center text-body-sm text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="gap-3 flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-body-sm text-foreground-tertiary">
          Couldn&apos;t load tasks.
        </p>
      ) : relevant.length === 0 ? (
        <div className="gap-2 py-4 flex flex-col items-center text-center">
          <CheckCircle2 aria-hidden="true" className="size-6 text-success" />
          <p className="text-body-sm text-foreground-secondary">
            Nothing due today — you&apos;re all caught up.
          </p>
        </div>
      ) : (
        <ul className="gap-2.5 flex flex-col">
          {relevant.map((task) => (
            <li key={task.id} className="gap-2.5 flex items-center">
              <Checkbox
                checked={false}
                onCheckedChange={() => toggleStatus.mutate({ task })}
                aria-label={`Mark ${task.title} as done`}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-body-sm text-foreground',
                  task.dueDate && task.dueDate < today && 'text-danger',
                )}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
