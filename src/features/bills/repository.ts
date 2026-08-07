import { createSupabaseRepository } from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  Bill,
  CreateBillInput,
  PaidEntry,
  UpdateBillInput,
} from '@/features/bills/types';

export type BillsRepository = Repository<
  Bill,
  CreateBillInput,
  UpdateBillInput
>;

function fromRow(row: Record<string, unknown>): Bill {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as Bill['category'],
    amount: (row.amount as number | null) ?? undefined,
    dueDate: row.due_date as string,
    recurrence: row.recurrence as Bill['recurrence'],
    status: row.status as Bill['status'],
    paidHistory: (row.paid_history as PaidEntry[] | null) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const billsRepository: BillsRepository = createSupabaseRepository<
  Bill,
  CreateBillInput,
  UpdateBillInput
>({
  table: 'bills',
  fromRow,
  orderBy: { column: 'due_date', ascending: true },
  toInsertRow: (input) => ({
    title: input.title,
    category: input.category,
    amount: input.amount ?? null,
    due_date: input.dueDate,
    recurrence: input.recurrence,
    status: 'unpaid',
    paid_history: [],
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.amount !== undefined && { amount: input.amount ?? null }),
    ...(input.dueDate !== undefined && { due_date: input.dueDate }),
    ...(input.recurrence !== undefined && { recurrence: input.recurrence }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.paidHistory !== undefined && {
      paid_history: input.paidHistory,
    }),
  }),
});
