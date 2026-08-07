import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const BILL_CATEGORIES = [
  'electricity',
  'water',
  'internet',
  'mobile',
  'rent',
  'mortgage',
  'other',
] as const;
export type BillCategory = (typeof BILL_CATEGORIES)[number];

export const BILL_RECURRENCES = [
  'one_time',
  'weekly',
  'monthly',
  'yearly',
] as const;
export type BillRecurrence = (typeof BILL_RECURRENCES)[number];

export interface PaidEntry {
  date: string;
  amount: number;
}

export interface Bill extends BaseEntity {
  title: string;
  category: BillCategory;
  amount?: number;
  dueDate: string;
  recurrence: BillRecurrence;
  status: 'unpaid' | 'paid';
  paidHistory: PaidEntry[];
}

export const billFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  category: z.enum(BILL_CATEGORIES),
  amount: z.number().min(0).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  recurrence: z.enum(BILL_RECURRENCES),
});

export type BillFormValues = z.infer<typeof billFormSchema>;
export type CreateBillInput = BillFormValues;
export type UpdateBillInput = Partial<BillFormValues> & {
  status?: Bill['status'];
  paidHistory?: PaidEntry[];
};

export interface BillFilters {
  search: string;
  status: 'all' | 'unpaid' | 'paid';
}

export const DEFAULT_BILL_FILTERS: BillFilters = { search: '', status: 'all' };

export const BILL_CATEGORY_LABELS: Record<BillCategory, string> = {
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  mobile: 'Mobile',
  rent: 'Rent',
  mortgage: 'Mortgage',
  other: 'Other',
};
