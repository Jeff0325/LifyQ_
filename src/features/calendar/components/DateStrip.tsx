import { buildDateStrip } from '@/features/calendar/utils';
import { cn } from '@/lib/utils';

export interface DateStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  /** Dates that have at least one event, for a small indicator dot. */
  markedDates?: Set<string>;
}

/** Horizontal, swipeable day picker — the mobile-native alternative to a full month grid. See docs/30_Core_Feature_Implementation.md. */
export function DateStrip({
  selectedDate,
  onSelect,
  markedDates,
}: DateStripProps) {
  const days = buildDateStrip();

  return (
    <div className="-mx-4 gap-2 px-4 pb-1 sm:mx-0 sm:px-0 flex [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {days.map((day) => {
        const selected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            aria-current={selected ? 'date' : undefined}
            className={cn(
              'min-w-14 gap-1 px-2 py-2.5 font-medium duration-base ease-standard flex shrink-0 flex-col items-center rounded-xl text-caption transition-colors',
              selected
                ? 'bg-brand-600 text-foreground-on-brand'
                : day.isToday
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950'
                  : 'text-foreground-secondary hover:bg-surface-raised',
            )}
          >
            <span className="uppercase">{day.weekday}</span>
            <span className="text-body-sm tabular-nums">{day.dayNumber}</span>
            <span
              className={cn(
                'size-1 rounded-full',
                markedDates?.has(day.date)
                  ? selected
                    ? 'bg-foreground-on-brand'
                    : 'bg-brand-600'
                  : 'bg-transparent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
