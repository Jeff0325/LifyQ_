import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from '@/features/notes/types';

export type NotesRepository = Repository<
  Note,
  CreateNoteInput,
  UpdateNoteInput
>;

function fromRow(row: Record<string, unknown>): Note {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    folder: row.folder as Note['folder'],
    tags: row.tags as string,
    linkedTaskId: orUndefined(row.linked_task_id as string | null),
    linkedGoalId: orUndefined(row.linked_goal_id as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const notesRepository: NotesRepository = createSupabaseRepository<
  Note,
  CreateNoteInput,
  UpdateNoteInput
>({
  table: 'notes',
  fromRow,
  toInsertRow: (input) => ({
    title: input.title,
    content: input.content ?? '',
    folder: input.folder,
    tags: input.tags ?? '',
    linked_task_id: input.linkedTaskId || null,
    linked_goal_id: input.linkedGoalId || null,
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.folder !== undefined && { folder: input.folder }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.linkedTaskId !== undefined && {
      linked_task_id: input.linkedTaskId || null,
    }),
    ...(input.linkedGoalId !== undefined && {
      linked_goal_id: input.linkedGoalId || null,
    }),
  }),
});
