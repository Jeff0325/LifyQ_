import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const HABIT_FREQUENCIES = ['daily', 'weekdays', 'weekly'] as const;
export type HabitFrequency = (typeof HABIT_FREQUENCIES)[number];

export interface HabitCompletion {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  completed: boolean;
}

export interface Habit extends BaseEntity {
  title: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  completions: HabitCompletion[];
  /** Derived from `completions` in the repository layer — docs/16 §6. */
  currentStreak: number;
  longestStreak: number;
}

export const habitFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  frequency: z.enum(HABIT_FREQUENCIES),
  reminderTime: z.string().optional(),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;
export type CreateHabitInput = HabitFormValues;
export type UpdateHabitInput = Partial<HabitFormValues> & {
  completions?: HabitCompletion[];
};
