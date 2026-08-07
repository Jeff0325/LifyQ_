import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const NOTE_FOLDERS = [
  'general',
  'work',
  'personal',
  'ideas',
  'reference',
] as const;
export type NoteFolder = (typeof NOTE_FOLDERS)[number];

export interface Note extends BaseEntity {
  title: string;
  content: string;
  folder: NoteFolder;
  /** Comma-separated — kept as the raw form string, parsed for display via `parseTags()`. */
  tags: string;
  linkedTaskId?: string;
  linkedGoalId?: string;
}

/**
 * Shared by the create/edit form (React Hook Form + zodResolver) and the
 * mock repository's input types — one schema, no drift. See
 * docs/14_State_Management_Strategy.md §4.
 */
export const noteFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  content: z.string().trim().max(20000).optional(),
  folder: z.enum(NOTE_FOLDERS),
  tags: z.string().trim().max(200).optional(),
  linkedTaskId: z.string().optional(),
  linkedGoalId: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export type CreateNoteInput = NoteFormValues;
export type UpdateNoteInput = Partial<NoteFormValues>;

export interface NoteFilters {
  search: string;
  folder: NoteFolder | 'all';
}

export const DEFAULT_NOTE_FILTERS: NoteFilters = {
  search: '',
  folder: 'all',
};
