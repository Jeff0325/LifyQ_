import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProgressRing } from '@/components/shared/ProgressRing';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { goalDetailPath, ROUTES } from '@/constants/routes';
import { useGoals } from '@/features/goals';

export function GoalsProgressCard() {
  const { data: goals, isLoading, isError } = useGoals();

  const active = (goals ?? [])
    .filter((g) => g.status === 'active')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <Card className="min-w-0 gap-3 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <CardTitle>Goals progress</CardTitle>
        <Link
          to={ROUTES.goals}
          className="font-medium inline-flex items-center text-body-sm text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : isError ? (
        <p className="text-body-sm text-foreground-tertiary">
          Couldn&apos;t load goals.
        </p>
      ) : active.length === 0 ? (
        <p className="text-body-sm text-foreground-secondary">
          No active goals — set one from the Goals tab.
        </p>
      ) : (
        <ul className="gap-3 flex flex-col">
          {active.map((goal) => (
            <li key={goal.id}>
              <Link
                to={goalDetailPath(goal.id)}
                className="-mx-2 gap-3 px-2 py-1.5 flex items-center rounded-lg hover:bg-surface-raised"
              >
                <ProgressRing
                  value={goal.progress}
                  size={36}
                  strokeWidth={4}
                  label={null}
                />
                <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">
                  {goal.title}
                </span>
                <span className="shrink-0 text-caption text-foreground-tertiary tabular-nums">
                  {goal.progress}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
