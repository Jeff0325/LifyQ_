import type { Habit, HabitCompletion } from '@/features/habits/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

/**
 * Builds `days` of completion history ending today, using a deterministic
 * pattern (not random) so the seed is stable across reloads within a
 * session and reads as a believable history rather than noise.
 */
function history(
  days: number,
  pattern: (dayIndex: number) => boolean,
): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    completions.push({ date: isoDate(-i), completed: pattern(days - 1 - i) });
  }
  return completions;
}

/** Base entity fields, omitting the derived streak fields (repository computes those). */
type SeedHabit = Omit<Habit, 'currentStreak' | 'longestStreak'>;

export function seedHabits(): SeedHabit[] {
  const base = (
    overrides: Partial<Habit> &
      Pick<Habit, 'title' | 'frequency' | 'completions'>,
  ): SeedHabit => ({
    id: crypto.randomUUID(),
    createdAt: timestamp(-45),
    updatedAt: timestamp(-1),
    ...overrides,
  });

  return [
    base({
      title: 'Morning run',
      frequency: 'daily',
      reminderTime: '06:30',
      // A strong, unbroken 12-day streak running right up to today.
      completions: history(30, (i) => i >= 18),
    }),
    base({
      title: 'Read for 20 minutes',
      frequency: 'daily',
      reminderTime: '21:00',
      // Mostly consistent with a couple of missed days.
      completions: history(30, (i) => i !== 5 && i !== 12 && i !== 13),
    }),
    base({
      title: 'Drink 8 glasses of water',
      frequency: 'daily',
      // Very consistent, minor recent lapse yesterday (streak resets but stays "current" pending today).
      completions: history(30, (i) => i < 28),
    }),
    base({
      title: 'Meditate',
      frequency: 'daily',
      reminderTime: '07:00',
      // Just started, 4-day streak.
      completions: history(30, (i) => i >= 26),
    }),
    base({
      title: 'Strength training',
      frequency: 'weekdays',
      reminderTime: '17:30',
      // Weekday pattern (skip roughly every 5th/6th day to look like weekends).
      completions: history(30, (i) => i % 7 !== 5 && i % 7 !== 6),
    }),
    base({
      title: 'Weekly meal prep',
      frequency: 'weekly',
      completions: history(30, (i) => i % 7 === 0),
    }),
  ];
}
