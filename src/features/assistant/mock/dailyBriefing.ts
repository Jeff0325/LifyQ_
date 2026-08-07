import { billsRepository } from '@/features/bills/repository';
import { eventsRepository } from '@/features/calendar/repository';
import { remindersRepository } from '@/features/reminders/repository';
import { tasksRepository } from '@/features/tasks/repository';
import { todayIso } from '@/lib/date';

function capitalize(text: string): string {
  return text.length === 0 ? text : text[0]!.toUpperCase() + text.slice(1);
}

/**
 * Jarvis's narrative summary of the day — the Dashboard's daily briefing
 * card (docs/37_Dashboard_Design_Philosophy.md §4), same shape as every
 * `describeX()` function in `mockAssistantEngine.ts` (reads a handful of
 * repositories, formats one plain-English answer), just proactive rather
 * than triggered by a question.
 */
export async function generateDailyBriefing(): Promise<string> {
  const [tasks, events, bills, reminders] = await Promise.all([
    tasksRepository.list(),
    eventsRepository.list(),
    billsRepository.list(),
    remindersRepository.list(),
  ]);
  const today = todayIso();

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== 'done',
  );
  const dueTodayTasks = tasks.filter(
    (t) => t.dueDate === today && t.status !== 'done',
  );
  const todayEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const urgentBills = bills.filter(
    (b) => b.status !== 'paid' && b.dueDate <= today,
  );
  const dueReminders = reminders.filter(
    (r) => !r.completed && r.remindAt <= today,
  );

  const sentences: string[] = [];

  if (todayEvents.length > 0) {
    const next = todayEvents[0]!;
    sentences.push(
      `Your day starts with "${next.title}"${next.startTime ? ` at ${next.startTime}` : ''}.`,
    );
  }

  const attentionParts: string[] = [];
  if (overdueTasks.length > 0) {
    attentionParts.push(
      `${overdueTasks.length} task${overdueTasks.length === 1 ? ' is' : 's are'} overdue`,
    );
  }
  if (dueTodayTasks.length > 0) {
    attentionParts.push(`${dueTodayTasks.length} more due today`);
  }
  if (urgentBills.length > 0) {
    attentionParts.push(
      `${urgentBills.length} bill${urgentBills.length === 1 ? '' : 's'} need${urgentBills.length === 1 ? 's' : ''} your attention`,
    );
  }
  if (dueReminders.length > 0) {
    attentionParts.push(
      `${dueReminders.length} reminder${dueReminders.length === 1 ? '' : 's'} waiting on you`,
    );
  }

  if (attentionParts.length === 0 && sentences.length === 0) {
    return 'Nothing urgent on your plate today — a good day to get ahead on something.';
  }
  if (attentionParts.length === 0) {
    return `${sentences.join(' ')} Otherwise, everything looks quiet.`;
  }

  const [first, ...rest] = attentionParts;
  const summary =
    rest.length === 0
      ? capitalize(first!)
      : `${capitalize(first!)}, and ${rest.join(', ')}`;
  sentences.push(`${summary}.`);
  return sentences.join(' ');
}
