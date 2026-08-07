import type { Bill } from '@/features/bills/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedBills(): Bill[] {
  const base = (
    overrides: Partial<Bill> & Pick<Bill, 'title' | 'category' | 'dueDate'>,
  ): Bill =>
    ({
      id: crypto.randomUUID(),
      recurrence: 'monthly',
      status: 'unpaid',
      paidHistory: [],
      createdAt: timestamp(-30),
      updatedAt: timestamp(-30),
      ...overrides,
    }) as Bill;

  return [
    base({
      title: 'Electricity',
      category: 'electricity',
      amount: 84.5,
      dueDate: isoDate(3),
    }),
    base({
      title: 'Internet',
      category: 'internet',
      amount: 60,
      dueDate: isoDate(7),
    }),
    base({
      title: 'Rent',
      category: 'rent',
      amount: 1450,
      dueDate: isoDate(-1),
    }),
    base({
      title: 'Mobile Plan',
      category: 'mobile',
      amount: 45,
      dueDate: isoDate(-10),
      status: 'paid',
      paidHistory: [{ date: isoDate(-10), amount: 45 }],
    }),
    base({
      title: 'Water',
      category: 'water',
      amount: 32,
      dueDate: isoDate(12),
    }),
  ];
}
