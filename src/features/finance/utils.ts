import type { Budget, Transaction } from '@/features/finance/types';

/** Sum of this-month expense transactions in a budget's category — the client-side "spent" computation (see types.ts). */
export function computeSpent(
  budget: Budget,
  transactions: Transaction[],
): number {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category === budget.category &&
        t.date.startsWith(monthPrefix),
    )
    .reduce((sum, t) => sum + t.amount, 0);
}
