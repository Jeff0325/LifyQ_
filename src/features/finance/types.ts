import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_CATEGORIES = [
  'income',
  'housing',
  'utilities',
  'groceries',
  'dining',
  'transport',
  'entertainment',
  'shopping',
  'health',
  'other',
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface Transaction extends BaseEntity {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note?: string;
}

export const transactionFormSchema = z.object({
  amount: z.number().positive('Enter an amount greater than 0'),
  type: z.enum(TRANSACTION_TYPES),
  category: z.enum(TRANSACTION_CATEGORIES),
  date: z.string().min(1, 'Date is required'),
  note: z.string().trim().max(200).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type CreateTransactionInput = TransactionFormValues;
export type UpdateTransactionInput = Partial<TransactionFormValues>;

export const BUDGET_PERIODS = ['weekly', 'monthly'] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

/**
 * `spent` is deliberately not a field here — it would need to be derived
 * from Transactions, and `createMockRepository`'s `deriveOnRead` is
 * synchronous while `transactionsRepository.list()` isn't, so it can't be
 * computed in the repository layer without changing shared architecture
 * every other domain also depends on. Computed client-side instead,
 * wherever a budget is displayed (same precedent as Projects' task
 * progress) — see BudgetCard.
 */
export interface Budget extends BaseEntity {
  category: TransactionCategory;
  limit: number;
  period: BudgetPeriod;
}

export const budgetFormSchema = z.object({
  category: z.enum(TRANSACTION_CATEGORIES),
  limit: z.number().positive('Enter a limit greater than 0'),
  period: z.enum(BUDGET_PERIODS),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CreateBudgetInput = BudgetFormValues;
export type UpdateBudgetInput = Partial<BudgetFormValues>;

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
};

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> =
  {
    income: 'Income',
    housing: 'Housing',
    utilities: 'Utilities',
    groceries: 'Groceries',
    dining: 'Dining',
    transport: 'Transport',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    health: 'Health',
    other: 'Other',
  };
