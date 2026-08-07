import { toIsoDate, todayIso } from '@/lib/date';
import type { CalendarEvent } from '@/features/calendar/types';

export { todayIso } from '@/lib/date';

export interface StripDay {
  date: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
}

/** `count` days centered a few days before today, for the horizontal date strip. */
export function buildDateStrip(count = 14, startOffset = -3): StripDay[] {
  const today = todayIso();
  const days: StripDay[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + startOffset + i);
    const date = toIsoDate(d);
    days.push({
      date,
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: date === today,
    });
  }
  return days;
}

export function formatTimeRange(event: CalendarEvent): string {
  if (!event.startTime) return 'All day';
  return event.endTime
    ? `${event.startTime} – ${event.endTime}`
    : event.startTime;
}

export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) =>
    (a.startTime ?? '').localeCompare(b.startTime ?? ''),
  );
}

export function formatFriendlyDate(date: string): string {
  const today = todayIso();
  const tomorrow = toIsoDate(new Date(Date.now() + 86_400_000));
  if (date === today) return 'Today';
  if (date === tomorrow) return 'Tomorrow';
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
