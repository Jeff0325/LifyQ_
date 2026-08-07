import { Check, Flame, HeartPulse } from 'lucide-react';

import { ProgressRing } from '@/components/shared/ProgressRing';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_ACCENT } from '@/constants/moduleColors';
import { useHabits, useToggleHabitToday } from '@/features/habits';
import { todayIso } from '@/lib/date';
import { cn } from '@/lib/utils';

const HABITS_ACCENT = MODULE_ACCENT.habits;

/**
 * Daily well-being, kept to what's actually modeled (habits) — no
 * invented water/exercise/sleep widgets with nothing behind them. Medicine
 * expiry/refills already live in Needs Attention, so they're not repeated
 * here. Tapping a remaining habit checks it off right from Home.
 */
export function HealthHabitsSection() {
  const { data: habits, isLoading } = useHabits();
  const toggleHabitToday = useToggleHabitToday();
  const today = todayIso();

  const list = habits ?? [];
  const doneToday = list.filter((h) =>
    h.completions.some((c) => c.date === today && c.completed),
  );
  const remaining = list.filter((h) => !doneToday.includes(h));
  const bestStreak = list.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const pct =
    list.length === 0 ? 0 : Math.round((doneToday.length / list.length) * 100);

  return (
    <section className="gap-4 flex flex-col">
      <h2 className="font-semibold tracking-tight text-h3 text-foreground">
        Health &amp; Habits
      </h2>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : list.length === 0 ? (
        <div className="gap-3 py-10 flex flex-col items-center rounded-2xl border border-border/60 bg-surface text-center">
          <span
            className={cn(
              'size-11 flex items-center justify-center rounded-full',
              HABITS_ACCENT.iconBg,
            )}
          >
            <HeartPulse
              aria-hidden="true"
              className={cn('size-5', HABITS_ACCENT.icon)}
            />
          </span>
          <p className="text-body-sm text-foreground-secondary">
            No habits set up yet — a small one is a good place to start.
          </p>
        </div>
      ) : (
        <div className="gap-5 p-5 flex flex-col rounded-2xl border border-border/60 bg-surface shadow-elevation-1">
          <div className="gap-4 flex items-center">
            <ProgressRing value={pct} size={56} strokeWidth={5} />
            <div className="min-w-0 gap-0.5 flex flex-1 flex-col">
              <span className="font-semibold text-h3 text-foreground tabular-nums">
                {doneToday.length} of {list.length}
              </span>
              <span className="text-caption text-foreground-tertiary">
                habits done today
              </span>
            </div>
            {bestStreak > 0 && (
              <span className="gap-1 px-2.5 py-1 font-medium flex shrink-0 items-center rounded-full bg-warning-subtle text-caption text-warning">
                <Flame aria-hidden="true" className="size-3.5" />
                {bestStreak}d
              </span>
            )}
          </div>

          {remaining.length > 0 && (
            <div className="gap-2 flex flex-col">
              <span className="font-medium tracking-wider text-caption text-foreground-tertiary uppercase">
                Remaining Today
              </span>
              <div className="gap-2 flex flex-col">
                {remaining.map((habit) => (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleHabitToday.mutate(habit)}
                    className="gap-3 px-1 py-1.5 duration-base ease-standard flex items-center rounded-lg text-left transition-colors hover:bg-surface-raised active:scale-[0.99]"
                  >
                    <span
                      aria-hidden="true"
                      className="size-5 flex shrink-0 items-center justify-center rounded-full border-2 border-border"
                    >
                      <Check
                        aria-hidden="true"
                        className="size-3 text-transparent"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">
                      {habit.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
