import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const JOURNAL_MOODS = ['great', 'good', 'okay', 'low', 'bad'] as const;
export type JournalMood = (typeof JOURNAL_MOODS)[number];

export interface JournalEntry extends BaseEntity {
  date: string;
  content: string;
  mood?: JournalMood;
}

export const journalEntryFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  content: z.string().trim().min(1, 'Write something first').max(10000),
  mood: z.enum(JOURNAL_MOODS).optional(),
});

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;
export type CreateJournalEntryInput = JournalEntryFormValues;
export type UpdateJournalEntryInput = Partial<JournalEntryFormValues>;

export interface JournalFilters {
  search: string;
  mood: JournalMood | 'all';
}

export const DEFAULT_JOURNAL_FILTERS: JournalFilters = {
  search: '',
  mood: 'all',
};

export const JOURNAL_MOOD_LABELS: Record<JournalMood, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  bad: 'Bad',
};

export const JOURNAL_MOOD_EMOJI: Record<JournalMood, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  low: '😕',
  bad: '😞',
};
