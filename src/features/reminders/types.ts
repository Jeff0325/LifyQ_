import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const REMINDER_RECURRENCES = [
  'none',
  'daily',
  'weekly',
  'monthly',
] as const;
export type ReminderRecurrence = (typeof REMINDER_RECURRENCES)[number];

export interface Reminder extends BaseEntity {
  title: string;
  remindAt: string;
  recurring: ReminderRecurrence;
  notes?: string;
  completed: boolean;
}

export const reminderFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  remindAt: z.string().min(1, 'Date is required'),
  recurring: z.enum(REMINDER_RECURRENCES),
  notes: z.string().trim().max(500).optional(),
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;
export type CreateReminderInput = ReminderFormValues;
export type UpdateReminderInput = Partial<ReminderFormValues> & {
  completed?: boolean;
};

export interface ReminderFilters {
  search: string;
  status: 'all' | 'upcoming' | 'completed';
}

export const DEFAULT_REMINDER_FILTERS: ReminderFilters = {
  search: '',
  status: 'all',
};

export const REMINDER_RECURRENCE_LABELS: Record<ReminderRecurrence, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};
