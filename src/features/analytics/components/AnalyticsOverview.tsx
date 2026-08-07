import { ArrowLeftRight, CheckSquare, Receipt, Repeat } from 'lucide-react';

import { AnalyticsStatTile } from '@/features/analytics/components/AnalyticsStatTile';
import {
  billsPaidRate,
  habitConsistency,
  incomeInWindow,
  spendingInWindow,
  tasksCompletedInWindow,
} from '@/features/analytics/utils';
import { useBills } from '@/features/bills';
import { useTransactions } from '@/features/finance';
import { useHabits } from '@/features/habits';
import { useTasks } from '@/features/tasks';

const WINDOW_DAYS = 30;

/**
 * The headline row — one glance at the trailing 30 days across the four
 * domains with the clearest single "is this going well" number. Detail
 * lives in the sections below; this is Analytics' equivalent of Dashboard's
 * `DailyOverview` stat row.
 */
export function AnalyticsOverview() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();
  const { data: bills, isLoading: billsLoading } = useBills();

  const tasksCompleted = tasksCompletedInWindow(tasks ?? [], WINDOW_DAYS);
  const consistency = habitConsistency(habits ?? [], WINDOW_DAYS);
  const net =
    incomeInWindow(transactions ?? [], WINDOW_DAYS) -
    spendingInWindow(transactions ?? [], WINDOW_DAYS);
  const { paid, total } = billsPaidRate(bills ?? []);

  return (
    <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
      <AnalyticsStatTile
        icon={CheckSquare}
        label="Tasks completed, 30d"
        value={String(tasksCompleted)}
        loading={tasksLoading}
      />
      <AnalyticsStatTile
        icon={Repeat}
        label="Habit consistency, 30d"
        value={`${consistency}%`}
        loading={habitsLoading}
        tone={
          consistency >= 70
            ? 'success'
            : consistency >= 40
              ? 'warning'
              : 'danger'
        }
      />
      <AnalyticsStatTile
        icon={ArrowLeftRight}
        label="Net cash flow, 30d"
        value={`${net >= 0 ? '+' : '-'}$${Math.abs(net).toFixed(0)}`}
        loading={transactionsLoading}
        tone={net >= 0 ? 'success' : 'danger'}
      />
      <AnalyticsStatTile
        icon={Receipt}
        label="Bills paid this cycle"
        value={total === 0 ? '—' : `${paid}/${total}`}
        loading={billsLoading}
        tone={total > 0 && paid === total ? 'success' : 'brand'}
      />
    </div>
  );
}
