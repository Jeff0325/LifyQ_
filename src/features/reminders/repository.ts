import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '@/features/reminders/types';

export type RemindersRepository = Repository<
  Reminder,
  CreateReminderInput,
  UpdateReminderInput
>;

function fromRow(row: Record<string, unknown>): Reminder {
  return {
    id: row.id as string,
    title: row.title as string,
    remindAt: row.remind_at as string,
    recurring: row.recurring as Reminder['recurring'],
    notes: orUndefined(row.notes as string | null),
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const remindersRepository: RemindersRepository =
  createSupabaseRepository<Reminder, CreateReminderInput, UpdateReminderInput>({
    table: 'reminders',
    fromRow,
    orderBy: { column: 'remind_at', ascending: true },
    toInsertRow: (input) => ({
      title: input.title,
      remind_at: input.remindAt,
      recurring: input.recurring,
      notes: input.notes,
      completed: false,
    }),
    toUpdateRow: (input) => ({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.remindAt !== undefined && { remind_at: input.remindAt }),
      ...(input.recurring !== undefined && { recurring: input.recurring }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.completed !== undefined && { completed: input.completed }),
    }),
  });
