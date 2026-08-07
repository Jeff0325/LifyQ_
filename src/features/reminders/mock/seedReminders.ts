import type { Reminder } from '@/features/reminders/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedReminders(): Reminder[] {
  const base = (
    overrides: Partial<Reminder> & Pick<Reminder, 'title' | 'remindAt'>,
  ): Reminder =>
    ({
      id: crypto.randomUUID(),
      recurring: 'none',
      completed: false,
      createdAt: timestamp(-20),
      updatedAt: timestamp(-20),
      ...overrides,
    }) as Reminder;

  return [
    base({
      title: 'Call the vet for annual checkup',
      remindAt: isoDate(2),
    }),
    base({
      title: 'Review weekly grocery list',
      remindAt: isoDate(0),
      recurring: 'weekly',
    }),
    base({
      title: 'Submit expense report',
      remindAt: isoDate(-1),
    }),
    base({
      title: 'Water the office plants',
      remindAt: isoDate(1),
      recurring: 'weekly',
    }),
    base({
      title: 'Renew gym membership',
      remindAt: isoDate(15),
    }),
  ];
}
