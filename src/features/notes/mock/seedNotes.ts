import type { Note } from '@/features/notes/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

/** Realistic fixtures per docs/16_Data_Model_Plan.md §7 — see seedTasks.ts for the pattern this follows. */
export function seedNotes(): Note[] {
  const base = (
    overrides: Partial<Note> & Pick<Note, 'title' | 'content' | 'folder'>,
  ): Note =>
    ({
      id: crypto.randomUUID(),
      tags: '',
      createdAt: timestamp(-14),
      updatedAt: timestamp(-14),
      ...overrides,
    }) as Note;

  return [
    base({
      title: 'Roadmap review talking points',
      content:
        'Lead with the Q3 wins, then the Analytics timeline slip. Ask Priya for the updated numbers before the 2pm.',
      folder: 'work',
      tags: 'meeting, roadmap',
      updatedAt: timestamp(0),
    }),
    base({
      title: 'Half-marathon training notes',
      content:
        'Long runs on Saturdays, easy pace. Increase distance by no more than 10% week over week. Watch the left knee after 10 miles.',
      folder: 'personal',
      tags: 'running, health',
      linkedGoalId: undefined,
      updatedAt: timestamp(-1),
    }),
    base({
      title: 'Book ideas',
      content:
        'Deep Work — revisit the "shallow work budget" chapter. Also want to read something on habit formation next.',
      folder: 'ideas',
      tags: 'reading',
      updatedAt: timestamp(-3),
    }),
    base({
      title: 'Denver offsite logistics',
      content:
        'Flights booked for the 14th. Need to confirm the hotel block and check if the team dinner needs a reservation.',
      folder: 'work',
      tags: 'travel, offsite',
      updatedAt: timestamp(-2),
    }),
    base({
      title: 'Emergency fund plan',
      content:
        'Target: 3 months of expenses. Automating $400/month into the high-yield savings account until the goal is hit.',
      folder: 'personal',
      tags: 'finance',
      updatedAt: timestamp(-5),
    }),
    base({
      title: 'Wifi password + house notes for housesitter',
      content:
        'Network: LifyQ-Home. Password on the fridge. Water the plants every 3 days.',
      folder: 'reference',
      tags: '',
      updatedAt: timestamp(-8),
    }),
  ];
}
