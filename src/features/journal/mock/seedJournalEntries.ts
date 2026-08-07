import type { JournalEntry } from '@/features/journal/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedJournalEntries(): JournalEntry[] {
  const base = (
    overrides: Partial<JournalEntry> & Pick<JournalEntry, 'date' | 'content'>,
  ): JournalEntry =>
    ({
      id: crypto.randomUUID(),
      createdAt: timestamp(-10),
      updatedAt: timestamp(-10),
      ...overrides,
    }) as JournalEntry;

  return [
    base({
      date: isoDate(0),
      content:
        'Good momentum today. Got the roadmap deck mostly done and the run this morning felt easier than last week.',
      mood: 'good',
    }),
    base({
      date: isoDate(-1),
      content:
        'Rough day — overdue bill stress and a long PR review. Need to catch up on sleep.',
      mood: 'low',
    }),
    base({
      date: isoDate(-3),
      content:
        'Quiet weekend. Read a few chapters, meal prepped for the week. Feeling steady.',
      mood: 'okay',
    }),
    base({
      date: isoDate(-6),
      content:
        'Half-marathon training is clicking — hit a new long-run distance without knee pain.',
      mood: 'great',
    }),
  ];
}
