import type { Budget, Transaction } from '@/features/finance/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedTransactions(): Transaction[] {
  const base = (
    overrides: Partial<Transaction> &
      Pick<Transaction, 'amount' | 'type' | 'category' | 'date'>,
  ): Transaction =>
    ({
      id: crypto.randomUUID(),
      createdAt: timestamp(-30),
      updatedAt: timestamp(-30),
      ...overrides,
    }) as Transaction;

  return [
    base({
      amount: 4200,
      type: 'income',
      category: 'income',
      date: isoDate(-3),
      note: 'Paycheck',
    }),
    base({
      amount: 1450,
      type: 'expense',
      category: 'housing',
      date: isoDate(-2),
      note: 'Rent',
    }),
    base({
      amount: 84.5,
      type: 'expense',
      category: 'utilities',
      date: isoDate(-1),
    }),
    base({
      amount: 62.3,
      type: 'expense',
      category: 'groceries',
      date: isoDate(-1),
    }),
    base({
      amount: 38.9,
      type: 'expense',
      category: 'dining',
      date: isoDate(0),
      note: 'Lunch with Priya',
    }),
    base({
      amount: 15.49,
      type: 'expense',
      category: 'entertainment',
      date: isoDate(-5),
      note: 'Netflix',
    }),
    base({
      amount: 45.2,
      type: 'expense',
      category: 'transport',
      date: isoDate(-4),
    }),
    base({
      amount: 120,
      type: 'expense',
      category: 'shopping',
      date: isoDate(-8),
    }),
  ];
}

export function seedBudgets(): Budget[] {
  const base = (
    overrides: Partial<Budget> & Pick<Budget, 'category' | 'limit'>,
  ): Budget =>
    ({
      id: crypto.randomUUID(),
      period: 'monthly',
      createdAt: timestamp(-60),
      updatedAt: timestamp(-60),
      ...overrides,
    }) as Budget;

  return [
    base({ category: 'groceries', limit: 400 }),
    base({ category: 'dining', limit: 150 }),
    base({ category: 'entertainment', limit: 60 }),
    base({ category: 'transport', limit: 200 }),
  ];
}
