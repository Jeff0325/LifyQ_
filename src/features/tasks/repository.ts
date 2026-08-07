import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@/features/tasks/types';

export type TasksRepository = Repository<
  Task,
  CreateTaskInput,
  UpdateTaskInput
>;

function fromRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    notes: orUndefined(row.notes as string | null),
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    category: row.category as Task['category'],
    dueDate: orUndefined(row.due_date as string | null),
    completedAt: orUndefined(row.completed_at as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const tasksRepository: TasksRepository = createSupabaseRepository<
  Task,
  CreateTaskInput,
  UpdateTaskInput
>({
  table: 'tasks',
  fromRow,
  toInsertRow: (input) => ({
    title: input.title,
    notes: input.notes,
    status: input.status,
    priority: input.priority,
    category: input.category,
    due_date: input.dueDate || null,
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.dueDate !== undefined && { due_date: input.dueDate || null }),
    ...(input.completedAt !== undefined && {
      completed_at: input.completedAt ?? null,
    }),
  }),
});
