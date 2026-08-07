import type { Task, TaskPriority } from '@/features/tasks/types';

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type DueDateTone = 'overdue' | 'today' | 'soon' | 'later' | 'none';

export interface DueDateInfo {
  label: string;
  tone: DueDateTone;
}

/** Relative, human label for a task's due date — "Overdue", "Today", "Tomorrow", or a short date. */
export function describeDueDate(dueDate: string | undefined): DueDateInfo {
  if (!dueDate) return { label: '', tone: 'none' };

  const today = toDateOnly(new Date());
  const due = toDateOnly(new Date(`${dueDate}T00:00:00`));
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return { label: 'Overdue', tone: 'overdue' };
  if (diffDays === 0) return { label: 'Today', tone: 'today' };
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon' };
  if (diffDays <= 6) {
    return {
      label: due.toLocaleDateString(undefined, { weekday: 'short' }),
      tone: 'soon',
    };
  }
  return {
    label: due.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    tone: 'later',
  };
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

/** Incomplete tasks first (by due date, then priority), completed tasks last. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if ((a.status === 'done') !== (b.status === 'done')) {
      return a.status === 'done' ? 1 : -1;
    }
    const aDue = a.dueDate ?? '9999-12-31';
    const bDue = b.dueDate ?? '9999-12-31';
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}
