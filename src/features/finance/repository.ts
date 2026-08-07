import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  Budget,
  CreateBudgetInput,
  CreateTransactionInput,
  Transaction,
  UpdateBudgetInput,
  UpdateTransactionInput,
} from '@/features/finance/types';

export const transactionsRepository: Repository<
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput
> = createSupabaseRepository({
  table: 'transactions',
  orderBy: { column: 'date', ascending: false },
  fromRow: (row): Transaction => ({
    id: row.id as string,
    amount: Number(row.amount),
    type: row.type as Transaction['type'],
    category: row.category as Transaction['category'],
    date: row.date as string,
    note: orUndefined(row.note as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    note: input.note,
  }),
  toUpdateRow: (input) => ({
    ...(input.amount !== undefined && { amount: input.amount }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.date !== undefined && { date: input.date }),
    ...(input.note !== undefined && { note: input.note }),
  }),
});

export const budgetsRepository: Repository<
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput
> = createSupabaseRepository({
  table: 'budgets',
  fromRow: (row): Budget => ({
    id: row.id as string,
    category: row.category as Budget['category'],
    limit: Number(row.limit),
    period: row.period as Budget['period'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    category: input.category,
    limit: input.limit,
    period: input.period,
  }),
  toUpdateRow: (input) => ({
    ...(input.category !== undefined && { category: input.category }),
    ...(input.limit !== undefined && { limit: input.limit }),
    ...(input.period !== undefined && { period: input.period }),
  }),
});
