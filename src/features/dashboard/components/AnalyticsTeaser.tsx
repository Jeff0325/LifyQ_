import { ChevronRight, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import {
  habitConsistency,
  incomeInWindow,
  spendingInWindow,
  tasksCompletedInWindow,
} from '@/features/analytics/utils';
import { useTransactions } from '@/features/finance';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';

const WINDOW_DAYS = 30;

/**
 * Dashboard's entry point into the Analytics domain (docs/07 rule 7 — every
 * domain integrates with Dashboard, not the other way around). Deliberately
 * doesn't repeat `ProductivityInsights`' 7-day task sparkline — this shows
 * a 30-day, three-domain-wide readout instead, so the two cards complement
 * rather than duplicate each other.
 */
export function AnalyticsTeaser() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();

  const isLoading = tasksLoading || habitsLoading || transactionsLoading;
  const tasksCompleted = tasksCompletedInWindow(tasks ?? [], WINDOW_DAYS);
  const consistency = habitConsistency(habits ?? [], WINDOW_DAYS);
  const net =
    incomeInWindow(transactions ?? [], WINDOW_DAYS) -
    spendingInWindow(transactions ?? [], WINDOW_DAYS);

  return (
    <Card className="gap-3 p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <CardTitle>Analytics</CardTitle>
        <Link
          to={ROUTES.analytics}
          className="font-medium inline-flex items-center text-body-sm text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : (
        <div className="gap-4 flex items-center">
          <LineChart
            aria-hidden="true"
            className="size-8 shrink-0 text-brand-600 dark:text-brand-400"
          />
          <p className="text-body-sm text-foreground-secondary">
            <span className="font-semibold text-foreground tabular-nums">
              {tasksCompleted}
            </span>{' '}
            tasks done,{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {consistency}%
            </span>{' '}
            habit consistency, and a{' '}
            <span
              className={
                net >= 0
                  ? 'font-semibold text-success tabular-nums'
                  : 'font-semibold text-danger tabular-nums'
              }
            >
              {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(0)}
            </span>{' '}
            net cash flow over the last 30 days.
          </p>
        </div>
      )}
    </Card>
  );
}
