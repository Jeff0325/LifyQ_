import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateJournalEntryInput,
  JournalEntry,
  UpdateJournalEntryInput,
} from '@/features/journal/types';

export type JournalRepository = Repository<
  JournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput
>;

function fromRow(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    content: row.content as string,
    mood: orUndefined(row.mood as JournalEntry['mood'] | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const journalRepository: JournalRepository = createSupabaseRepository<
  JournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput
>({
  table: 'journal_entries',
  fromRow,
  orderBy: { column: 'date', ascending: false },
  toInsertRow: (input) => ({
    date: input.date,
    content: input.content,
    mood: input.mood ?? null,
  }),
  toUpdateRow: (input) => ({
    ...(input.date !== undefined && { date: input.date }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.mood !== undefined && { mood: input.mood ?? null }),
  }),
});
