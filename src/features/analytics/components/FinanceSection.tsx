import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

import { BarChart } from '@/components/shared/BarChart';
import { Sparkline } from '@/components/shared/Sparkline';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsStatTile } from '@/features/analytics/components/AnalyticsStatTile';
import {
  dailySpendingTrend,
  incomeInWindow,
  spendingByCategory,
  spendingInWindow,
} from '@/features/analytics/utils';
import { useTransactions } from '@/features/finance';

const WINDOW_DAYS = 30;
const TREND_DAYS = 14;

/**
 * Finance's trailing-30-day view, distinct from the Finance page's
 * calendar-month-to-date framing (`FinanceOverview`) — a rolling window is
 * the more useful "how am I trending" lens for an insight page, while the
 * Finance page itself stays anchored to the current billing month.
 */
export function FinanceSection() {
  const { data: transactions, isLoading } = useTransactions();

  const income = incomeInWindow(transactions ?? [], WINDOW_DAYS);
  const expenses = spendingInWindow(transactions ?? [], WINDOW_DAYS);
  const net = income - expenses;
  const categoryBars = spendingByCategory(transactions ?? [], WINDOW_DAYS);
  const dailyTrend = dailySpendingTrend(transactions ?? [], TREND_DAYS);

  return (
    <Card className="gap-5 p-5 flex flex-col">
      <CardTitle>Finance</CardTitle>

      {isLoading ? (
        <div className="gap-3 sm:grid-cols-3 grid grid-cols-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="gap-3 sm:grid-cols-3 grid grid-cols-1">
            <AnalyticsStatTile
              icon={ArrowUpRight}
              label="Income, 30d"
              value={`$${income.toFixed(0)}`}
              tone="success"
            />
            <AnalyticsStatTile
              icon={ArrowDownRight}
              label="Expenses, 30d"
              value={`$${expenses.toFixed(0)}`}
              tone="danger"
            />
            <AnalyticsStatTile
              icon={Scale}
              label="Net, 30d"
              value={`${net >= 0 ? '+' : '-'}$${Math.abs(net).toFixed(0)}`}
              tone={net >= 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="gap-1 flex flex-col">
            <span className="text-caption text-foreground-tertiary">
              Spending by category, last {WINDOW_DAYS} days
            </span>
            {categoryBars.length === 0 ? (
              <p className="py-2 text-body-sm text-foreground-tertiary">
                No expenses logged in this window.
              </p>
            ) : (
              <BarChart
                data={categoryBars}
                label={`Spending by category, last ${WINDOW_DAYS} days`}
                formatValue={(v) => `$${v}`}
                width={320}
                height={160}
              />
            )}
          </div>

          <div className="gap-1 flex flex-col">
            <span className="text-caption text-foreground-tertiary">
              Daily spending, last {TREND_DAYS} days
            </span>
            <Sparkline
              data={dailyTrend}
              label={`Daily spending, last ${TREND_DAYS} days`}
              width={180}
              height={40}
            />
          </div>
        </>
      )}
    </Card>
  );
}
