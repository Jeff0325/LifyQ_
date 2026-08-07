import { motion } from 'motion/react';

import { getCenteredWeekDates } from '@/features/dashboard/utils';
import { DURATION, EASE } from '@/lib/motion';
import { todayIso } from '@/lib/date';
import { cn } from '@/lib/utils';

export interface WeekStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

/**
 * The Home screen's date control — replaces the old static Jarvis launch
 * card. Centered on today (today ± 3 days) rather than a fixed Mon…Sun
 * calendar week, so today always sits in the middle slot no matter what
 * day of the week it is. The selected date drives everything below it
 * (`DayFocusSection`/`DayAttentionSection`); Jarvis itself moved off Home
 * entirely (reachable only via the bottom nav's center button — docs/06
 * §5's "reachable from anywhere" is already satisfied there).
 */
export function WeekStrip({ selectedDate, onSelect }: WeekStripProps) {
  const week = getCenteredWeekDates();
  const today = todayIso();

  return (
    <div className="gap-2 flex">
      {week.map((date) => {
        const dayNumber = Number(date.slice(-2));
        const weekdayLabel = new Date(`${date}T00:00:00`).toLocaleDateString(
          undefined,
          { weekday: 'short' },
        );
        const isSelected = date === selectedDate;
        const isToday = date === today;

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={isSelected}
            aria-label={`${weekdayLabel} ${dayNumber}${isToday ? ', today' : ''}`}
            className="min-w-0 relative flex-1"
          >
            {isSelected && (
              <motion.span
                layoutId="week-strip-selected"
                transition={{
                  duration: DURATION.moderate,
                  ease: EASE.standard,
                }}
                className="inset-0 absolute rounded-2xl bg-linear-to-br from-brand-600 to-brand-700 shadow-elevation-2"
              />
            )}
            <span
              className={cn(
                'gap-1 py-2.5 duration-base ease-standard relative flex flex-col items-center rounded-2xl transition-colors',
                isSelected
                  ? 'text-foreground-on-brand'
                  : 'text-foreground-secondary hover:bg-surface-raised',
              )}
            >
              <span className="font-medium tracking-wide text-caption uppercase opacity-80">
                {weekdayLabel}
              </span>
              <span className="font-semibold text-body">{dayNumber}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'size-1 rounded-full',
                  isToday
                    ? isSelected
                      ? 'bg-foreground-on-brand'
                      : 'bg-brand-600'
                    : 'bg-transparent',
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
