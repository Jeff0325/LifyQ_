import type { Task } from '@/features/tasks/types';
import { toIsoDate } from '@/lib/date';

function isoDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toIsoDate(date);
}

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

/**
 * Realistic, narratively-coherent fixtures (varied categories, priorities,
 * and dates relative to "today" so the seed always feels current) — per
 * docs/16_Data_Model_Plan.md §7. Regenerated fresh each session unless
 * localStorage already holds in-session edits.
 */
export function seedTasks(): Task[] {
  const base = (
    overrides: Partial<Task> & Pick<Task, 'title' | 'category' | 'priority'>,
  ): Task =>
    ({
      id: crypto.randomUUID(),
      status: 'todo',
      createdAt: timestamp(-7),
      updatedAt: timestamp(-7),
      ...overrides,
    }) as Task;

  return [
    base({
      title: 'Finish Q3 product roadmap deck',
      category: 'work',
      priority: 'high',
      dueDate: isoDate(0),
      notes:
        'Needs the updated Analytics timeline from Priya before the 2pm review.',
    }),
    base({
      title: 'Book flights for the Denver offsite',
      category: 'work',
      priority: 'medium',
      dueDate: isoDate(0),
    }),
    base({
      title: 'Call dentist to reschedule cleaning',
      category: 'health',
      priority: 'low',
      dueDate: isoDate(0),
    }),
    base({
      title: 'Review pull request from Sam',
      category: 'work',
      priority: 'high',
      dueDate: isoDate(-1),
    }),
    base({
      title: 'Pay electricity bill',
      category: 'errands',
      priority: 'medium',
      dueDate: isoDate(-2),
    }),
    base({
      title: 'Read two chapters of "Deep Work"',
      category: 'learning',
      priority: 'low',
      dueDate: isoDate(1),
    }),
    base({
      title: 'Plan birthday dinner for Maya',
      category: 'personal',
      priority: 'medium',
      dueDate: isoDate(2),
    }),
    base({
      title: 'Renew passport',
      category: 'errands',
      priority: 'low',
      dueDate: isoDate(10),
    }),
    base({
      title: 'Prep slides for marathon training kickoff',
      category: 'health',
      priority: 'medium',
      dueDate: isoDate(3),
      status: 'in_progress',
    }),
    base({
      title: 'Draft onboarding email for new hire',
      category: 'work',
      priority: 'medium',
      status: 'in_progress',
      dueDate: isoDate(1),
    }),
    base({
      title: 'Grocery run — meal prep ingredients',
      category: 'errands',
      priority: 'low',
      dueDate: isoDate(0),
    }),
    base({
      title: 'Send thank-you note to interview panel',
      category: 'work',
      priority: 'none',
      status: 'done',
      dueDate: isoDate(-3),
      completedAt: timestamp(-3),
    }),
    base({
      title: 'Set up new budgeting spreadsheet',
      category: 'personal',
      priority: 'low',
      status: 'done',
      dueDate: isoDate(-5),
      completedAt: timestamp(-4),
    }),
    base({
      title: 'Morning run — 5k easy pace',
      category: 'health',
      priority: 'medium',
      status: 'done',
      dueDate: isoDate(0),
      completedAt: timestamp(0),
    }),
  ];
}
