/**
 * Analytics is a read-only cross-domain aggregation view — it has no
 * repository or mock data of its own (docs/07_Feature_Roadmap.md, docs/16
 * has no Analytics entity). These are pure functions over data already
 * fetched via each domain's own hooks (`useTasks`, `useGoals`, ...), the
 * same "call the source domain's hooks directly" approach
 * `ProductivityInsights` already uses on the Dashboard — no new
 * cross-feature-read precedent needed, just applied at page scope instead
 * of a Dashboard-card scope.
 */
import type { BarChartDatum } from '@/components/shared/BarChart';
import type { Bill } from '@/features/bills/types';
import { TRANSACTION_CATEGORY_LABELS } from '@/features/finance/types';
import type {
  Transaction,
  TransactionCategory,
} from '@/features/finance/types';
import type { Goal } from '@/features/goals/types';
import type { Habit } from '@/features/habits/types';
import { lastNDays } from '@/features/habits/utils';
import type { Subscription } from '@/features/subscriptions/types';
import type { Task } from '@/features/tasks/types';
import { toIsoDate } from '@/lib/date';

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
}

/** Tasks completed per day, oldest first, trailing N days — for a Sparkline. */
export function taskCompletionTrend(tasks: Task[], days = 14): number[] {
  const counts: number[] = [];
  const cursor = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const iso = toIsoDate(d);
    counts.push(
      tasks.filter((t) => t.completedAt?.slice(0, 10) === iso).length,
    );
  }
  return counts;
}

/** Count of tasks completed in the trailing N days. */
export function tasksCompletedInWindow(tasks: Task[], days = 30): number {
  const cutoff = daysAgoIso(days);
  return tasks.filter(
    (t) => t.completedAt && t.completedAt.slice(0, 10) >= cutoff,
  ).length;
}

/** Average habit completion rate (0–100) across all habits, trailing N days. */
export function habitConsistency(habits: Habit[], days = 30): number {
  if (habits.length === 0) return 0;
  const rates = habits.map((h) => {
    const done = lastNDays(h.completions, days).filter(
      (d) => d.completed,
    ).length;
    return (done / days) * 100;
  });
  return Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length);
}

/** Per-habit completion rate (0–100), trailing N days. */
export function habitConsistencyByHabit(
  habits: Habit[],
  days = 30,
): BarChartDatum[] {
  return habits.map((h) => {
    const done = lastNDays(h.completions, days).filter(
      (d) => d.completed,
    ).length;
    return { label: h.title, value: Math.round((done / days) * 100) };
  });
}

/** Progress (0–100) of every active goal — the full picture behind Dashboard's top-3 teaser. */
export function goalProgressByGoal(goals: Goal[]): BarChartDatum[] {
  return goals
    .filter((g) => g.status === 'active')
    .map((g) => ({ label: g.title, value: g.progress }));
}

/** Sum of expense transactions in the trailing N days. */
export function spendingInWindow(
  transactions: Transaction[],
  days = 30,
): number {
  const cutoff = daysAgoIso(days);
  return transactions
    .filter((t) => t.type === 'expense' && t.date >= cutoff)
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Sum of income transactions in the trailing N days. */
export function incomeInWindow(transactions: Transaction[], days = 30): number {
  const cutoff = daysAgoIso(days);
  return transactions
    .filter((t) => t.type === 'income' && t.date >= cutoff)
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Expense total per category in the trailing N days, top-N categories descending. */
export function spendingByCategory(
  transactions: Transaction[],
  days = 30,
  top = 6,
): BarChartDatum[] {
  const cutoff = daysAgoIso(days);
  const totals = new Map<TransactionCategory, number>();
  for (const t of transactions) {
    if (t.type !== 'expense' || t.date < cutoff) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([category, value]) => ({
      label: TRANSACTION_CATEGORY_LABELS[category],
      value: Math.round(value),
    }));
}

/** Daily expense total, oldest first, trailing N days — for a Sparkline. */
export function dailySpendingTrend(
  transactions: Transaction[],
  days = 14,
): number[] {
  const counts: number[] = [];
  const cursor = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const iso = toIsoDate(d);
    const total = transactions
      .filter((t) => t.type === 'expense' && t.date === iso)
      .reduce((sum, t) => sum + t.amount, 0);
    counts.push(Math.round(total));
  }
  return counts;
}

/** Bills currently marked paid vs. total tracked bills (this cycle). */
export function billsPaidRate(bills: Bill[]): {
  paid: number;
  total: number;
} {
  return {
    paid: bills.filter((b) => b.status === 'paid').length,
    total: bills.length,
  };
}

/** Every subscription's cost normalized to a monthly figure and summed. */
export function totalMonthlySubscriptionCost(
  subscriptions: Subscription[],
): number {
  return subscriptions.reduce(
    (sum, s) => sum + (s.billingCycle === 'yearly' ? s.cost / 12 : s.cost),
    0,
  );
}
