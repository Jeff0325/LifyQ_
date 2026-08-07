import type { Goal, Milestone } from '@/features/goals/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

function milestones(titles: [string, boolean][]): Milestone[] {
  return titles.map(([title, done]) => ({
    id: crypto.randomUUID(),
    title,
    done,
  }));
}

/** Narratively-coherent fixtures — a goal genuinely links to the kind of milestones a real one would have, per docs/16_Data_Model_Plan.md §7. */
export function seedGoals(): Omit<Goal, 'progress'>[] {
  const base = (
    overrides: Partial<Goal> & Pick<Goal, 'title' | 'category' | 'milestones'>,
  ): Omit<Goal, 'progress'> => ({
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp(-30),
    updatedAt: timestamp(-2),
    ...overrides,
  });

  return [
    base({
      title: 'Run a half-marathon',
      category: 'health',
      description:
        'First half-marathon, targeting a sub-2:15 finish at the city race in the spring.',
      targetDate: isoDate(75),
      milestones: milestones([
        ['Complete a 10k without stopping', true],
        ['Build up to a 15-mile long run', true],
        ['Register for the race', true],
        ['Run a 18-mile long run', false],
        ['Taper week', false],
      ]),
    }),
    base({
      title: 'Ship the LifyQ v1 design system',
      category: 'career',
      description:
        'Get the full component library and mobile shell production-ready.',
      targetDate: isoDate(14),
      milestones: milestones([
        ['Foundation & design tokens', true],
        ['Component library', true],
        ['Mobile-first shell', true],
        ['Core feature modules', false],
      ]),
    }),
    base({
      title: 'Build a 3-month emergency fund',
      category: 'finance',
      description:
        'Save three months of expenses in a high-yield savings account.',
      targetDate: isoDate(120),
      milestones: milestones([
        ['Open high-yield savings account', true],
        ['Automate monthly transfer', true],
        ['Reach 1 month saved', true],
        ['Reach 2 months saved', false],
        ['Reach 3 months saved', false],
      ]),
    }),
    base({
      title: 'Read 12 books this year',
      category: 'learning',
      description: 'A mix of fiction and non-fiction — currently on track.',
      targetDate: isoDate(200),
      milestones: milestones([
        ['Q1: 3 books', true],
        ['Q2: 3 books', true],
        ['Q3: 3 books', false],
        ['Q4: 3 books', false],
      ]),
    }),
    base({
      title: 'Learn conversational Spanish',
      category: 'learning',
      description:
        'Enough to hold a casual conversation on the Barcelona trip.',
      targetDate: isoDate(90),
      milestones: milestones([
        ['Finish beginner course', true],
        ['50 days on language app streak', false],
        ['One full conversation with a tutor', false],
      ]),
    }),
    base({
      title: 'Redesign the home office',
      category: 'personal',
      status: 'completed',
      description: 'Standing desk, better lighting, a proper chair.',
      targetDate: isoDate(-10),
      milestones: milestones([
        ['Order standing desk', true],
        ['Order chair', true],
        ['Set up lighting', true],
        ['Cable management', true],
      ]),
    }),
  ];
}
