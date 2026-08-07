import { toIsoDate } from '@/lib/date';
import type { HabitCompletion } from '@/features/habits/types';

export { todayIso } from '@/lib/date';

function isCompletedOn(completions: HabitCompletion[], date: string): boolean {
  return completions.some((entry) => entry.date === date && entry.completed);
}

/**
 * Consecutive completed days ending today — or ending yesterday if today
 * simply hasn't been checked off yet (an unbroken streak still "current",
 * not reset, until a day is actually missed).
 */
export function computeCurrentStreak(completions: HabitCompletion[]): number {
  const cursor = new Date();
  if (!isCompletedOn(completions, toIsoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (isCompletedOn(completions, toIsoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive completed days anywhere in history. */
export function computeLongestStreak(completions: HabitCompletion[]): number {
  const completedDates = completions
    .filter((entry) => entry.completed)
    .map((entry) => entry.date)
    .sort();

  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  for (const dateStr of completedDates) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (previous) {
      const dayGap = Math.round(
        (date.getTime() - previous.getTime()) / 86_400_000,
      );
      current = dayGap === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}

/** Last N days (oldest first) as `{ date, completed }`, for sparklines/heatmaps. */
export function lastNDays(
  completions: HabitCompletion[],
  days: number,
): HabitCompletion[] {
  const result: HabitCompletion[] = [];
  const cursor = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const date = toIsoDate(d);
    result.push({ date, completed: isCompletedOn(completions, date) });
  }
  return result;
}
