import { createSupabaseRepository } from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateHabitInput,
  Habit,
  HabitCompletion,
  UpdateHabitInput,
} from '@/features/habits/types';
import {
  computeCurrentStreak,
  computeLongestStreak,
} from '@/features/habits/utils';

export type HabitsRepository = Repository<
  Habit,
  CreateHabitInput,
  UpdateHabitInput
>;

function withStreaks(habit: Habit): Habit {
  return {
    ...habit,
    currentStreak: computeCurrentStreak(habit.completions),
    longestStreak: computeLongestStreak(habit.completions),
  };
}

function fromRow(row: Record<string, unknown>): Habit {
  return withStreaks({
    id: row.id as string,
    title: row.title as string,
    frequency: row.frequency as Habit['frequency'],
    reminderTime: (row.reminder_time as string | null) ?? undefined,
    completions: (row.completions as HabitCompletion[] | null) ?? [],
    currentStreak: 0,
    longestStreak: 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  });
}

/**
 * `currentStreak`/`longestStreak` are always recomputed from
 * `completions` on read, per docs/16_Data_Model_Plan.md §6.
 */
export const habitsRepository: HabitsRepository = createSupabaseRepository<
  Habit,
  CreateHabitInput,
  UpdateHabitInput
>({
  table: 'habits',
  fromRow,
  deriveOnRead: withStreaks,
  toInsertRow: (input) => ({
    title: input.title,
    frequency: input.frequency,
    reminder_time: input.reminderTime,
    completions: [],
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.frequency !== undefined && { frequency: input.frequency }),
    ...(input.reminderTime !== undefined && {
      reminder_time: input.reminderTime,
    }),
    ...(input.completions !== undefined && {
      completions: input.completions,
    }),
  }),
});
