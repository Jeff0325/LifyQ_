import type { CalendarEvent } from '@/features/calendar/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedEvents(): CalendarEvent[] {
  const base = (
    overrides: Partial<CalendarEvent> & Pick<CalendarEvent, 'title' | 'date'>,
  ): CalendarEvent => ({
    id: crypto.randomUUID(),
    createdAt: timestamp(-10),
    updatedAt: timestamp(-10),
    ...overrides,
  });

  return [
    base({
      title: 'Product roadmap review',
      date: isoDate(0),
      startTime: '10:00',
      endTime: '11:00',
      location: 'Conference Room A',
    }),
    base({
      title: 'Lunch with Priya',
      date: isoDate(0),
      startTime: '12:30',
      endTime: '13:30',
    }),
    base({
      title: '1:1 with manager',
      date: isoDate(0),
      startTime: '16:00',
      endTime: '16:30',
    }),
    base({
      title: 'Dentist appointment',
      date: isoDate(1),
      startTime: '09:00',
      endTime: '09:45',
      location: 'Riverside Dental',
    }),
    base({
      title: 'Team offsite — Denver',
      date: isoDate(3),
    }),
    base({
      title: 'Marathon training — long run',
      date: isoDate(2),
      startTime: '07:00',
      endTime: '09:00',
    }),
    base({
      title: "Maya's birthday dinner",
      date: isoDate(4),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Otto Ristorante',
    }),
    base({
      title: 'Quarterly planning',
      date: isoDate(6),
      startTime: '13:00',
      endTime: '15:00',
    }),
  ];
}
