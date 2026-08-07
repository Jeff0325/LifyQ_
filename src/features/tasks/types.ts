import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['none', 'low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_CATEGORIES = [
  'work',
  'personal',
  'health',
  'learning',
  'errands',
  'other',
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task extends BaseEntity {
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string; // ISO date (YYYY-MM-DD)
  completedAt?: string;
}

/**
 * Shared by the create/edit form (React Hook Form + zodResolver) and the
 * mock repository's input types — one schema, no drift between client
 * validation and what a real API would reject. See
 * docs/14_State_Management_Strategy.md §4.
 */
export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  notes: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  category: z.enum(TASK_CATEGORIES),
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export type CreateTaskInput = TaskFormValues;
export type UpdateTaskInput = Partial<TaskFormValues> & {
  completedAt?: string | undefined;
};

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
};
