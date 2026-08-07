import { ArrowDownRight, ArrowUpRight, Scale, Wallet } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  useBudgets,
  useTransactions,
} from '@/features/finance/hooks/useFinance';
import { computeSpent } from '@/features/finance/utils';
import { cn } from '@/lib/utils';

function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'brand';
}) {
  const toneClass = {
    success: 'text-success bg-success-subtle',
    danger: 'text-danger bg-danger-subtle',
    brand: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950',
  }[tone];

  return (
    <div className="gap-3 p-4 flex items-center rounded-xl border border-border bg-surface">
      <div
        className={cn(
          'size-10 flex shrink-0 items-center justify-center rounded-lg',
          toneClass,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0 flex flex-col">
        <span className="font-semibold text-h3 text-foreground tabular-nums">
          {value}
        </span>
        <span className="truncate text-caption text-foreground-tertiary">
          {label}
        </span>
      </div>
    </div>
  );
}

export function FinanceOverview() {
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="gap-3 sm:grid-cols-3 grid grid-cols-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const monthPrefix = currentMonthPrefix();
  const thisMonth = (transactions ?? []).filter((t) =>
    t.date.startsWith(monthPrefix),
  );
  const income = thisMonth
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = thisMonth
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const net = income - expenses;
  const overBudgetCount = (budgets ?? []).filter(
    (b) => computeSpent(b, transactions ?? []) > b.limit,
  ).length;

  return (
    <div className="gap-3 sm:grid-cols-3 grid grid-cols-1">
      <StatTile
        icon={ArrowUpRight}
        label="Income this month"
        value={`$${income.toFixed(0)}`}
        tone="success"
      />
      <StatTile
        icon={ArrowDownRight}
        label="Expenses this month"
        value={`$${expenses.toFixed(0)}`}
        tone="danger"
      />
      <StatTile
        icon={Scale}
        label={
          overBudgetCount > 0
            ? `${overBudgetCount} over budget`
            : 'Net this month'
        }
        value={
          overBudgetCount > 0
            ? `${overBudgetCount}`
            : `${net >= 0 ? '+' : '-'}$${Math.abs(net).toFixed(0)}`
        }
        tone={overBudgetCount > 0 ? 'danger' : 'brand'}
      />
    </div>
  );
}
