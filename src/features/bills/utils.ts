import { todayIso } from '@/lib/date';
import type { Bill } from '@/features/bills/types';

export type DueTone = 'overdue' | 'today' | 'soon' | 'later';

export function describeDue(bill: Bill): { label: string; tone: DueTone } {
  const today = todayIso();
  if (bill.dueDate < today) return { label: 'Overdue', tone: 'overdue' };
  if (bill.dueDate === today) return { label: 'Due today', tone: 'today' };
  const daysUntil =
    (new Date(bill.dueDate).getTime() - new Date(today).getTime()) / 86_400_000;
  if (daysUntil <= 7)
    return { label: `Due in ${Math.round(daysUntil)}d`, tone: 'soon' };
  return {
    label: `Due ${new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    tone: 'later',
  };
}
