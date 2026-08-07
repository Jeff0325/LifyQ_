import {
  habitConsistency,
  incomeInWindow,
  spendingInWindow,
  tasksCompletedInWindow,
} from '@/features/analytics/utils';
import { billsRepository } from '@/features/bills/repository';
import { eventsRepository } from '@/features/calendar/repository';
import { documentsRepository } from '@/features/documents/repository';
import {
  budgetsRepository,
  transactionsRepository,
} from '@/features/finance/repository';
import { computeSpent } from '@/features/finance/utils';
import { goalsRepository } from '@/features/goals/repository';
import { groceryListsRepository } from '@/features/grocery-lists/repository';
import { habitsRepository } from '@/features/habits/repository';
import {
  allergiesRepository,
  healthEventsRepository,
  medicinesRepository,
} from '@/features/health/repository';
import { journalRepository } from '@/features/journal/repository';
import { describeExpiry } from '@/features/life-records/utils';
import { lifeRecordsRepository } from '@/features/life-records/repository';
import { projectsRepository } from '@/features/projects/repository';
import { remindersRepository } from '@/features/reminders/repository';
import { subscriptionsRepository } from '@/features/subscriptions/repository';
import { tasksRepository } from '@/features/tasks/repository';
import type { ChatMessage } from '@/features/assistant/types';
import { todayIso } from '@/lib/date';

function delay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mentionsUpcoming(message: string): boolean {
  return /\bupcoming|coming up|next|later|soon\b/i.test(message);
}

function friendlyDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

async function describeTasks(message: string): Promise<string> {
  const tasks = await tasksRepository.list();
  const today = todayIso();
  const dueToday = tasks.filter(
    (t) => t.dueDate === today && t.status !== 'done',
  );
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== 'done',
  );
  const open = tasks.filter((t) => t.status !== 'done');

  if (open.length === 0) {
    return "You're all caught up — there's nothing open on your task list right now.";
  }

  const sentences: string[] = [
    `You have ${open.length} task${open.length === 1 ? '' : 's'} waiting for you.`,
  ];
  if (overdue.length > 0) {
    sentences.push(
      `${overdue.length === 1 ? 'One of them is' : `${overdue.length} of them are`} overdue — "${overdue[0]!.title}" is worth tackling first so it doesn't linger.`,
    );
  }
  if (dueToday.length > 0) {
    sentences.push(
      `${dueToday.length} ${dueToday.length === 1 ? 'is' : 'are'} due today, including "${dueToday[0]!.title}".`,
    );
  }
  if (mentionsUpcoming(message)) {
    const upcoming = tasks
      .filter((t) => t.dueDate && t.dueDate > today && t.status !== 'done')
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
    sentences.push(
      upcoming.length === 0
        ? "Nothing else on the horizon after that, so you're clear."
        : `Looking further ahead, ${upcoming.length} more ${upcoming.length === 1 ? 'is' : 'are'} coming up, starting with "${upcoming[0]!.title}".`,
    );
  }
  return sentences.join(' ');
}

async function describeGoals(): Promise<string> {
  const goals = await goalsRepository.list();
  const active = goals.filter((g) => g.status === 'active');
  if (active.length === 0) {
    return "You don't have any active goals right now — want to set one and start tracking progress?";
  }

  const closest = [...active].sort((a, b) => b.progress - a.progress)[0]!;
  return `You're working on ${active.length} active goal${active.length === 1 ? '' : 's'}. "${closest.title}" is furthest along at ${closest.progress}% — keep that momentum going.`;
}

async function describeHabits(): Promise<string> {
  const habits = await habitsRepository.list();
  if (habits.length === 0) {
    return "You haven't set up any habits yet — a small one to start with can make a big difference.";
  }

  const today = todayIso();
  const doneToday = habits.filter((h) =>
    h.completions.some((c) => c.date === today && c.completed),
  );
  const bestStreak = [...habits].sort(
    (a, b) => b.currentStreak - a.currentStreak,
  )[0]!;
  return `You've checked off ${doneToday.length} of ${habits.length} habits today. "${bestStreak.title}" is your strongest streak at ${bestStreak.currentStreak} day${bestStreak.currentStreak === 1 ? '' : 's'} — nice consistency.`;
}

async function describeSchedule(): Promise<string> {
  const events = await eventsRepository.list();
  const today = todayIso();
  const todayEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  if (todayEvents.length === 0) {
    return "Good news — you don't have any scheduled events today, so you've got a bit more flexibility.";
  }
  const next = todayEvents[0]!;
  return `You have ${todayEvents.length} event${todayEvents.length === 1 ? '' : 's'} on the calendar today. Next up is "${next.title}"${next.startTime ? ` at ${next.startTime}` : ''}.`;
}

async function describeBills(message: string): Promise<string> {
  const bills = await billsRepository.list();
  const today = todayIso();
  const unpaid = bills.filter((b) => b.status !== 'paid');
  const overdue = unpaid.filter((b) => b.dueDate < today);
  const dueToday = unpaid.filter((b) => b.dueDate === today);
  const upcoming = unpaid
    .filter((b) => b.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const sentences: string[] = [];
  if (overdue.length > 0) {
    sentences.push(
      `Just a heads-up — your "${overdue[0]!.title}" bill is overdue${overdue.length > 1 ? `, along with ${overdue.length - 1} other${overdue.length - 1 === 1 ? '' : 's'}` : ''}. You may want to take care of it soon to avoid late fees.`,
    );
  }
  if (dueToday.length > 0) {
    sentences.push(
      `${dueToday.length} due today: ${dueToday.map((b) => `"${b.title}"`).join(', ')}.`,
    );
  }
  if (sentences.length === 0) {
    sentences.push(
      unpaid.length === 0
        ? "You're all caught up — there aren't any bills due right now."
        : "Nothing due today or overdue, so you're in good shape for the moment.",
    );
  }
  if (mentionsUpcoming(message)) {
    sentences.push(
      upcoming.length === 0
        ? 'Nothing else on the way after that.'
        : `Coming up, "${upcoming[0]!.title}" is due ${friendlyDate(upcoming[0]!.dueDate)}.`,
    );
  }
  return sentences.join(' ');
}

async function describeLifeRecords(): Promise<string> {
  const records = await lifeRecordsRepository.list();
  const expired = records.filter(
    (r) => describeExpiry(r.expiresAt) === 'expired',
  );
  const expiringSoon = records.filter(
    (r) => describeExpiry(r.expiresAt) === 'expiring_soon',
  );

  if (expired.length === 0 && expiringSoon.length === 0) {
    return 'Everything looks current — nothing has expired or is expiring soon on your records.';
  }

  const sentences: string[] = [];
  if (expired.length > 0) {
    sentences.push(
      `Heads-up — "${expired[0]!.title}"${expired.length > 1 ? ` and ${expired.length - 1} other record${expired.length - 1 === 1 ? '' : 's'}` : ''} already expired, so it's worth renewing soon.`,
    );
  }
  if (expiringSoon.length > 0) {
    sentences.push(
      `${expiringSoon.length === 1 ? 'One record is' : `${expiringSoon.length} records are`} expiring soon: ${expiringSoon.map((r) => `"${r.title}"`).join(', ')}. There's still time, but it's a good idea to start planning ahead.`,
    );
  }
  return sentences.join(' ');
}

function monthlyCost(cost: number, cycle: 'monthly' | 'yearly'): number {
  return cycle === 'yearly' ? cost / 12 : cost;
}

async function describeSubscriptions(message: string): Promise<string> {
  const subscriptions = await subscriptionsRepository.list();
  if (subscriptions.length === 0) {
    return "You don't have any subscriptions tracked yet.";
  }
  const total = subscriptions.reduce(
    (sum, sub) => sum + monthlyCost(sub.cost, sub.billingCycle),
    0,
  );
  const sentences = [
    `You have ${subscriptions.length} subscription${subscriptions.length === 1 ? '' : 's'} active, costing about $${total.toFixed(2)} a month altogether.`,
  ];
  if (mentionsUpcoming(message)) {
    const next = [...subscriptions].sort((a, b) =>
      a.nextRenewalAt.localeCompare(b.nextRenewalAt),
    )[0]!;
    sentences.push(
      `The next to renew is "${next.serviceName}" on ${friendlyDate(next.nextRenewalAt)}.`,
    );
  }
  return sentences.join(' ');
}

async function describeDocuments(): Promise<string> {
  const documents = await documentsRepository.list();
  if (documents.length === 0) {
    return "You haven't uploaded any documents yet.";
  }
  const mostRecent = [...documents].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0]!;
  return `You have ${documents.length} document${documents.length === 1 ? '' : 's'} stored, most recently "${mostRecent.fileName}".`;
}

async function describeGroceryLists(): Promise<string> {
  const lists = await groceryListsRepository.list();
  if (lists.length === 0) {
    return "You don't have any grocery lists yet — want to start one?";
  }
  const active = lists.filter((l) => l.items.some((item) => !item.checked));
  if (active.length === 0) {
    return `Nice — all ${lists.length} of your grocery list${lists.length === 1 ? ' is' : 's are'} fully checked off.`;
  }
  const busiest = [...active].sort(
    (a, b) =>
      b.items.filter((i) => !i.checked).length -
      a.items.filter((i) => !i.checked).length,
  )[0]!;
  const remaining = busiest.items.filter((i) => !i.checked).length;
  return `You have ${active.length} active grocery list${active.length === 1 ? '' : 's'}. "${busiest.title}" still has the most left — ${remaining} item${remaining === 1 ? '' : 's'} to go.`;
}

async function describeHealth(): Promise<string> {
  const [medicines, events, allergies] = await Promise.all([
    medicinesRepository.list(),
    healthEventsRepository.list(),
    allergiesRepository.list(),
  ]);
  const today = todayIso();
  const expiredMedicines = medicines.filter(
    (m) => m.expiresAt && m.expiresAt < today,
  );
  const upcomingEvents = events.filter(
    (e) => e.nextDueDate && e.nextDueDate >= today,
  );

  const sentences: string[] = [];
  if (expiredMedicines.length > 0) {
    sentences.push(
      `Worth noting — "${expiredMedicines[0]!.name}"${expiredMedicines.length > 1 ? ` and ${expiredMedicines.length - 1} other medicine${expiredMedicines.length - 1 === 1 ? '' : 's'}` : ''} already expired.`,
    );
  }
  if (upcomingEvents.length > 0) {
    const next = [...upcomingEvents].sort((a, b) =>
      a.nextDueDate!.localeCompare(b.nextDueDate!),
    )[0]!;
    sentences.push(
      `"${next.title}" has a follow-up due ${friendlyDate(next.nextDueDate!)}.`,
    );
  }
  if (sentences.length === 0) {
    sentences.push(
      "Nothing urgent in your health records right now — you're all set.",
    );
  }
  if (allergies.length > 0) {
    sentences.push(
      `Just a reminder, you have ${allergies.length} ${allergies.length === 1 ? 'allergy' : 'allergies'} on file.`,
    );
  }
  return sentences.join(' ');
}

async function describeProjects(): Promise<string> {
  const projects = await projectsRepository.list();
  const active = projects.filter((p) => p.status === 'active');
  if (active.length === 0) {
    return "You don't have any active projects right now — want to start one?";
  }
  const busiest = [...active].sort(
    (a, b) => b.taskIds.length - a.taskIds.length,
  )[0]!;
  return `You have ${active.length} active project${active.length === 1 ? '' : 's'}. "${busiest.title}" has the most going on — ${busiest.taskIds.length} tasks linked to it.`;
}

async function describeFinance(): Promise<string> {
  const [transactions, budgets] = await Promise.all([
    transactionsRepository.list(),
    budgetsRepository.list(),
  ]);
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = transactions.filter((t) => t.date.startsWith(monthPrefix));
  const income = thisMonth
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = thisMonth
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const overBudget = budgets.filter(
    (b) => computeSpent(b, transactions) > b.limit,
  );

  const sentences = [
    `This month you've brought in $${income.toFixed(0)} and spent $${expenses.toFixed(0)}.`,
  ];
  if (overBudget.length > 0) {
    sentences.push(
      `${overBudget.length === 1 ? 'One budget is' : `${overBudget.length} budgets are`} running over — "${overBudget[0]!.category}" could use a closer look.`,
    );
  }
  return sentences.join(' ');
}

async function describeJournal(): Promise<string> {
  const entries = await journalRepository.list();
  if (entries.length === 0) {
    return "You haven't written any journal entries yet — even a couple of lines can be worth looking back on.";
  }
  const latest = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0]!;
  const moodPart = latest.mood
    ? ` You were feeling "${latest.mood}" then.`
    : '';
  return `Your last entry was on ${friendlyDate(latest.date)}.${moodPart}`;
}

async function describeReminders(message: string): Promise<string> {
  const reminders = await remindersRepository.list();
  const today = todayIso();
  const due = reminders.filter((r) => !r.completed && r.remindAt <= today);
  const upcoming = reminders
    .filter((r) => !r.completed && r.remindAt > today)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt));

  const sentences: string[] = [];
  if (due.length > 0) {
    sentences.push(
      `You have ${due.length} reminder${due.length === 1 ? '' : 's'} waiting on you — "${due[0]!.title}" is one of them.`,
    );
  } else {
    sentences.push("Nothing due right now — you're all clear.");
  }
  if (mentionsUpcoming(message)) {
    sentences.push(
      upcoming.length === 0
        ? 'Nothing else coming up after that.'
        : `Looking ahead, ${upcoming.length} more ${upcoming.length === 1 ? 'is' : 'are'} on the way, starting with "${upcoming[0]!.title}" on ${friendlyDate(upcoming[0]!.remindAt)}.`,
    );
  }
  return sentences.join(' ');
}

async function describeAnalytics(): Promise<string> {
  const [tasks, habits, transactions] = await Promise.all([
    tasksRepository.list(),
    habitsRepository.list(),
    transactionsRepository.list(),
  ]);
  const windowDays = 30;
  const completed = tasksCompletedInWindow(tasks, windowDays);
  const consistency = habitConsistency(habits, windowDays);
  const net =
    incomeInWindow(transactions, windowDays) -
    spendingInWindow(transactions, windowDays);
  const netPart =
    net >= 0
      ? `a net gain of $${net.toFixed(0)}`
      : `a net loss of $${Math.abs(net).toFixed(0)}`;
  return `Over the last ${windowDays} days, you've completed ${completed} task${completed === 1 ? '' : 's'}, kept up ${consistency}% habit consistency, and ended up with ${netPart}. Head to Analytics if you'd like the full trend.`;
}

interface Rule {
  label: string;
  test: RegExp;
  respond: (message: string) => Promise<string>;
}

const RULES: Rule[] = [
  {
    label: 'Tasks',
    test: /\b(task|to-?do)s?\b|on my plate\b/i,
    respond: describeTasks,
  },
  { label: 'Goals', test: /\bgoal[s]?\b/i, respond: describeGoals },
  {
    label: 'Habits',
    test: /\bhabit[s]?|streak[s]?\b/i,
    respond: describeHabits,
  },
  {
    label: 'Calendar',
    test: /\b(calendar|event[s]?|schedule|agenda|today'?s? plan)\b/i,
    respond: describeSchedule,
  },
  {
    label: 'Bills',
    test: /\b(bill[s]?|payment[s]?|due)\b/i,
    respond: describeBills,
  },
  {
    label: 'Life records',
    test: /\b(record[s]?|passport|license|expir\w*|insurance|visa)\b/i,
    respond: describeLifeRecords,
  },
  {
    label: 'Subscriptions',
    test: /\b(subscription[s]?|renew(al|ing|s)?)\b/i,
    respond: describeSubscriptions,
  },
  {
    label: 'Documents',
    test: /\b(document[s]?|receipt[s]?|upload[s]?)\b/i,
    respond: describeDocuments,
  },
  {
    label: 'Grocery lists',
    test: /\b(grocer(y|ies)|shopping list[s]?)\b/i,
    respond: describeGroceryLists,
  },
  {
    label: 'Health',
    test: /\b(health|medicine[s]?|prescription[s]?|vaccin\w*|allerg\w*|blood pressure|vitals?)\b/i,
    respond: describeHealth,
  },
  {
    label: 'Projects',
    test: /\bproject[s]?\b/i,
    respond: describeProjects,
  },
  {
    label: 'Finance',
    test: /\b(finance[s]?|budget[s]?|expense[s]?|spending|income)\b/i,
    respond: describeFinance,
  },
  {
    label: 'Journal',
    test: /\b(journal[s]?|diar(y|ies)|mood[s]?)\b/i,
    respond: describeJournal,
  },
  {
    label: 'Reminders',
    test: /\bremind\w*\b/i,
    respond: describeReminders,
  },
  {
    label: 'Analytics',
    test: /\b(analytics|insight[s]?|trend(s|ing)?|how am i doing)\b/i,
    respond: describeAnalytics,
  },
];

const GREETING = /\b(hi|hello|hey|morning)\b/i;

const FALLBACK_RESPONSES = [
  "I can't connect to a real AI just yet, but I can already tell you about your tasks, goals, habits, schedule, bills, subscriptions, documents, grocery lists, health, projects, finances, journal, reminders, or how your trends are looking. Ask me about any of those.",
  "That's a bit outside what I can help with in this preview build. Try asking about your tasks, goals, habits, schedule, bills, subscriptions, documents, groceries, health, projects, budget, journal, or reminders, and I'll pull the real numbers for you.",
];

/**
 * Scripted, pattern-matched responses over the app's own mock data — no
 * real model call. This is the single-domain half of `AIProvider.converse`
 * (docs/34_AI_Architecture.md §1); a real vendor implementation (Phase 5)
 * satisfies the same signature. `useAssistantChat` tries the Context Engine
 * (docs/38_Context_Engine.md) first for cross-domain questions and falls
 * through to this function unchanged for everything else — this file has
 * no knowledge of ICE or the Context Engine, by design.
 */
export async function converseMock(
  _thread: ChatMessage[],
  message: string,
): Promise<string> {
  await delay(500, 1400);

  if (GREETING.test(message) && message.trim().length < 20) {
    return "Hey there! I'm Jarvis. Ask me what's on your plate today, how your goals are tracking, or whether you've kept up your habits — I'm happy to help.";
  }

  // A question can name more than one topic ("tasks and bills today") —
  // every matching rule contributes, not just the first, so a combined
  // question gets a combined answer instead of silently dropping half of it.
  const matched = RULES.filter((rule) => rule.test.test(message));
  if (matched.length === 0) {
    return FALLBACK_RESPONSES[
      Math.floor(Math.random() * FALLBACK_RESPONSES.length)
    ]!;
  }

  const answers = await Promise.all(
    matched.map((rule) => rule.respond(message)),
  );
  if (answers.length === 1) return answers[0]!;
  return matched.map((rule, i) => `${rule.label}: ${answers[i]}`).join('\n\n');
}
