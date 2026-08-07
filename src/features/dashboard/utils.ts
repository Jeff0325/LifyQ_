import {
  BellRing,
  CalendarDays,
  CheckSquare,
  CreditCard,
  IdCard,
  Pill,
  Receipt,
  Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ModuleId } from '@/constants/moduleColors';
import { ROUTES } from '@/constants/routes';
import type { Bill } from '@/features/bills/types';
import type { CalendarEvent } from '@/features/calendar/types';
import type { HealthEvent, Medicine } from '@/features/health/types';
import type { LifeRecord } from '@/features/life-records/types';
import { describeExpiry } from '@/features/life-records/utils';
import type { Reminder } from '@/features/reminders/types';
import type { Subscription } from '@/features/subscriptions/types';
import type { Task } from '@/features/tasks/types';
import { toIsoDate, todayIso } from '@/lib/date';

/** `FeedItem.domain` (a display label) → the module it belongs to for
 * accent-coloring purposes — medicines are a Health sub-entity, so they
 * fold into Health's color rather than getting their own. */
export const FEED_DOMAIN_MODULE: Record<string, ModuleId> = {
  Calendar: 'calendar',
  Task: 'tasks',
  Reminder: 'reminders',
  Health: 'health',
  Bill: 'bills',
  Subscription: 'subscriptions',
  Medicine: 'health',
  'Life Record': 'life-records',
};

export function timeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export type FeedSeverity = 'overdue' | 'today' | 'upcoming';

export interface FeedItem {
  id: string;
  /** The underlying record's own id — set only for domains the Home
   * screen's swipe-to-settle gesture can act on (Task/Reminder/Bill/
   * Subscription). Everything else (Calendar/Health/Medicine/Life Record)
   * has no single unambiguous "mark done" action, so stays un-swipeable. */
  entityId?: string;
  domain: string;
  title: string;
  subtitle: string;
  date: string;
  severity: FeedSeverity;
  icon: LucideIcon;
  href: string;
}

export interface BuildUrgencyFeedInput {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  bills: Bill[];
  medicines: Medicine[];
  lifeRecords: LifeRecord[];
  subscriptions: Subscription[];
}

function daysFromNowIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/**
 * Merges every domain's "needs attention today" items into one
 * date/severity-sorted feed — docs/37_Dashboard_Design_Philosophy.md §3–4.
 * Consolidates logic that previously lived separately inside
 * `LifeAdminOverview`'s and `PlanningOverview`'s own urgency lists (now
 * trimmed to stat-tile rows only, per docs/37 §7's migration table) plus
 * two additions those didn't cover: expiring medicines and subscription
 * renewals due soon.
 */
export function buildUrgencyFeed(input: BuildUrgencyFeedInput): FeedItem[] {
  const today = todayIso();
  const renewalWindow = daysFromNowIso(7);
  const items: FeedItem[] = [];

  for (const task of input.tasks) {
    if (task.status === 'done' || !task.dueDate || task.dueDate > today)
      continue;
    items.push({
      id: `task-${task.id}`,
      domain: 'Task',
      title: task.title,
      subtitle: task.dueDate < today ? 'Overdue' : 'Due today',
      date: task.dueDate,
      severity: task.dueDate < today ? 'overdue' : 'today',
      icon: CheckSquare,
      href: ROUTES.tasks,
    });
  }

  for (const reminder of input.reminders) {
    if (reminder.completed || reminder.remindAt > today) continue;
    items.push({
      id: `reminder-${reminder.id}`,
      domain: 'Reminder',
      title: reminder.title,
      subtitle: reminder.remindAt < today ? 'Overdue' : 'Due today',
      date: reminder.remindAt,
      severity: reminder.remindAt < today ? 'overdue' : 'today',
      icon: BellRing,
      href: ROUTES.reminders,
    });
  }

  for (const bill of input.bills) {
    if (bill.status === 'paid' || bill.dueDate > today) continue;
    items.push({
      id: `bill-${bill.id}`,
      domain: 'Bill',
      title: bill.title,
      subtitle: bill.dueDate < today ? 'Overdue' : 'Due today',
      date: bill.dueDate,
      severity: bill.dueDate < today ? 'overdue' : 'today',
      icon: Receipt,
      href: ROUTES.bills,
    });
  }

  for (const medicine of input.medicines) {
    const status = describeExpiry(medicine.expiresAt);
    if (status !== 'expired' && status !== 'expiring_soon') continue;
    items.push({
      id: `medicine-${medicine.id}`,
      domain: 'Medicine',
      title: medicine.name,
      subtitle: status === 'expired' ? 'Expired' : 'Expiring soon',
      date: medicine.expiresAt!,
      severity: status === 'expired' ? 'overdue' : 'upcoming',
      icon: Pill,
      href: ROUTES.health,
    });
  }

  for (const record of input.lifeRecords) {
    const status = describeExpiry(record.expiresAt);
    if (status !== 'expired' && status !== 'expiring_soon') continue;
    items.push({
      id: `life-record-${record.id}`,
      domain: 'Life Record',
      title: record.title,
      subtitle: status === 'expired' ? 'Expired' : 'Expiring soon',
      date: record.expiresAt!,
      severity: status === 'expired' ? 'overdue' : 'upcoming',
      icon: IdCard,
      href: ROUTES.lifeRecords,
    });
  }

  for (const sub of input.subscriptions) {
    if (sub.nextRenewalAt > renewalWindow) continue;
    items.push({
      id: `subscription-${sub.id}`,
      domain: 'Subscription',
      title: sub.serviceName,
      subtitle: sub.nextRenewalAt <= today ? 'Renews today' : 'Renewing soon',
      date: sub.nextRenewalAt,
      severity: sub.nextRenewalAt <= today ? 'today' : 'upcoming',
      icon: CreditCard,
      href: ROUTES.subscriptions,
    });
  }

  for (const event of input.events) {
    if (event.date !== today) continue;
    items.push({
      id: `event-${event.id}`,
      domain: 'Calendar',
      title: event.title,
      subtitle: event.startTime ?? 'Today',
      date: event.date,
      severity: 'today',
      icon: CalendarDays,
      href: ROUTES.calendar,
    });
  }

  const severityRank: Record<FeedSeverity, number> = {
    overdue: 0,
    today: 1,
    upcoming: 2,
  };
  return items.sort((a, b) => {
    if (severityRank[a.severity] !== severityRank[b.severity]) {
      return severityRank[a.severity] - severityRank[b.severity];
    }
    return a.date.localeCompare(b.date);
  });
}

/** ISO dates centered on `reference` (default today) — `radius` days on
 * each side, so today always lands in the middle slot of the Home
 * screen's week strip no matter what day of the week it is. */
export function getCenteredWeekDates(
  reference = new Date(),
  radius = 3,
): string[] {
  return Array.from({ length: radius * 2 + 1 }, (_, i) => {
    const d = new Date(reference);
    d.setDate(d.getDate() + (i - radius));
    return toIsoDate(d);
  });
}

export interface BuildDayAgendaInput {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  bills: Bill[];
  medicines: Medicine[];
  healthEvents: HealthEvent[];
  lifeRecords: LifeRecord[];
  subscriptions: Subscription[];
}

export interface DayAgenda {
  date: string;
  isToday: boolean;
  /** "What's happening on this date" — calendar events, tasks/reminders
   * due, health appointments. Time-ordered where a time is known. */
  focus: FeedItem[];
  /** Only populated for today — overdue is a "today" concept, not tied to
   * whichever date the strip happens to be previewing. */
  overdue: FeedItem[];
  /** Today only — bills/subscriptions coming due within the next couple of
   * weeks, not yet overdue. Not shown for other dates: a future date's own
   * "due on this day" items already surface via `dueOnDate` instead. */
  dueSoon: FeedItem[];
  /** Today only — medicines/records expiring within their "expiring soon"
   * window (`describeExpiry`), not yet expired. */
  expiringSoon: FeedItem[];
  /** Non-today only — bills/subscriptions/medicines/records landing on
   * this exact date, for previewing a specific day on the week strip. */
  dueOnDate: FeedItem[];
}

const DUE_SOON_WINDOW_DAYS = 14;

function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/**
 * The Home screen's single source of truth once the week strip lets a user
 * pick a date: every domain's items relevant to that pick, split into
 * "what to do" vs. "what needs money/attention". Today gets the fuller,
 * forward-looking view (overdue + due soon + expiring soon) since that's
 * the view a user actually plans their day/week from; any other selected
 * date gets a narrower same-day preview (`dueOnDate`) — a quick look at
 * what that specific day holds, not a second urgency list.
 */
export function buildDayAgenda(
  date: string,
  input: BuildDayAgendaInput,
): DayAgenda {
  const today = todayIso();
  const isToday = date === today;
  const focus: FeedItem[] = [];
  const overdue: FeedItem[] = [];
  const dueSoon: FeedItem[] = [];
  const expiringSoon: FeedItem[] = [];
  const dueOnDate: FeedItem[] = [];

  for (const event of input.events) {
    if (event.date !== date) continue;
    focus.push({
      id: `event-${event.id}`,
      domain: 'Calendar',
      title: event.title,
      subtitle: event.startTime ?? 'All day',
      date: event.date,
      severity: 'today',
      icon: CalendarDays,
      href: ROUTES.calendar,
    });
  }

  for (const task of input.tasks) {
    if (task.status === 'done' || task.dueDate !== date) continue;
    focus.push({
      id: `task-${task.id}`,
      entityId: task.id,
      domain: 'Task',
      title: task.title,
      subtitle: 'Task',
      date: task.dueDate,
      severity: 'today',
      icon: CheckSquare,
      href: ROUTES.tasks,
    });
  }

  for (const reminder of input.reminders) {
    if (reminder.completed || reminder.remindAt !== date) continue;
    focus.push({
      id: `reminder-${reminder.id}`,
      entityId: reminder.id,
      domain: 'Reminder',
      title: reminder.title,
      subtitle: 'Reminder',
      date: reminder.remindAt,
      severity: 'today',
      icon: BellRing,
      href: ROUTES.reminders,
    });
  }

  for (const healthEvent of input.healthEvents) {
    if (healthEvent.date !== date) continue;
    focus.push({
      id: `health-event-${healthEvent.id}`,
      domain: 'Health',
      title: healthEvent.title,
      subtitle:
        healthEvent.type === 'doctor_visit' ? 'Appointment' : 'Vaccination',
      date: healthEvent.date,
      severity: 'today',
      icon: Stethoscope,
      href: ROUTES.health,
    });
  }

  if (isToday) {
    // The fuller forward-looking view — a window ahead of today, not just
    // today itself, so "Internet bill due tomorrow"/"passport expires in
    // 12 days" actually show up instead of only ever-empty "due today"
    // buckets.
    const soonWindow = daysFromToday(DUE_SOON_WINDOW_DAYS);

    for (const bill of input.bills) {
      if (
        bill.status === 'paid' ||
        bill.dueDate <= today ||
        bill.dueDate > soonWindow
      )
        continue;
      dueSoon.push({
        id: `bill-${bill.id}`,
        entityId: bill.id,
        domain: 'Bill',
        title: bill.title,
        subtitle: relativeDueLabel(bill.dueDate),
        date: bill.dueDate,
        severity: 'upcoming',
        icon: Receipt,
        href: ROUTES.bills,
      });
    }
    for (const sub of input.subscriptions) {
      if (sub.nextRenewalAt <= today || sub.nextRenewalAt > soonWindow)
        continue;
      dueSoon.push({
        id: `subscription-${sub.id}`,
        entityId: sub.id,
        domain: 'Subscription',
        title: sub.serviceName,
        subtitle: `Renews ${relativeDueLabel(sub.nextRenewalAt)}`,
        date: sub.nextRenewalAt,
        severity: 'upcoming',
        icon: CreditCard,
        href: ROUTES.subscriptions,
      });
    }
    for (const medicine of input.medicines) {
      if (
        medicine.refillReminderAt &&
        medicine.refillReminderAt <= soonWindow &&
        medicine.refillReminderAt > today
      ) {
        dueSoon.push({
          id: `medicine-refill-${medicine.id}`,
          domain: 'Medicine',
          title: medicine.name,
          subtitle: `Refill ${relativeDueLabel(medicine.refillReminderAt)}`,
          date: medicine.refillReminderAt,
          severity: 'upcoming',
          icon: Pill,
          href: ROUTES.health,
        });
      }
      if (describeExpiry(medicine.expiresAt) === 'expiring_soon') {
        expiringSoon.push({
          id: `medicine-expires-${medicine.id}`,
          domain: 'Medicine',
          title: medicine.name,
          subtitle: `Expires ${relativeDueLabel(medicine.expiresAt!)}`,
          date: medicine.expiresAt!,
          severity: 'upcoming',
          icon: Pill,
          href: ROUTES.health,
        });
      }
    }
    for (const record of input.lifeRecords) {
      if (describeExpiry(record.expiresAt) !== 'expiring_soon') continue;
      expiringSoon.push({
        id: `life-record-${record.id}`,
        domain: 'Life Record',
        title: record.title,
        subtitle: `Expires ${relativeDueLabel(record.expiresAt!)}`,
        date: record.expiresAt!,
        severity: 'upcoming',
        icon: IdCard,
        href: ROUTES.lifeRecords,
      });
    }
  } else {
    // Previewing a specific (non-today) date — same-day matches only.
    for (const bill of input.bills) {
      if (bill.status === 'paid' || bill.dueDate !== date) continue;
      dueOnDate.push({
        id: `bill-${bill.id}`,
        entityId: bill.id,
        domain: 'Bill',
        title: bill.title,
        subtitle: 'Due',
        date: bill.dueDate,
        severity: 'today',
        icon: Receipt,
        href: ROUTES.bills,
      });
    }
    for (const sub of input.subscriptions) {
      if (sub.nextRenewalAt !== date) continue;
      dueOnDate.push({
        id: `subscription-${sub.id}`,
        entityId: sub.id,
        domain: 'Subscription',
        title: sub.serviceName,
        subtitle: 'Renews',
        date: sub.nextRenewalAt,
        severity: 'today',
        icon: CreditCard,
        href: ROUTES.subscriptions,
      });
    }
    for (const medicine of input.medicines) {
      if (medicine.expiresAt === date) {
        dueOnDate.push({
          id: `medicine-expires-${medicine.id}`,
          domain: 'Medicine',
          title: medicine.name,
          subtitle: 'Expires',
          date,
          severity: 'today',
          icon: Pill,
          href: ROUTES.health,
        });
      }
      if (medicine.refillReminderAt === date) {
        dueOnDate.push({
          id: `medicine-refill-${medicine.id}`,
          domain: 'Medicine',
          title: medicine.name,
          subtitle: 'Refill due',
          date,
          severity: 'today',
          icon: Pill,
          href: ROUTES.health,
        });
      }
    }
    for (const record of input.lifeRecords) {
      if (record.expiresAt !== date) continue;
      dueOnDate.push({
        id: `life-record-${record.id}`,
        domain: 'Life Record',
        title: record.title,
        subtitle: 'Expires',
        date,
        severity: 'today',
        icon: IdCard,
        href: ROUTES.lifeRecords,
      });
    }
  }

  if (isToday) {
    for (const task of input.tasks) {
      if (task.status === 'done' || !task.dueDate || task.dueDate >= today)
        continue;
      overdue.push({
        id: `task-${task.id}`,
        entityId: task.id,
        domain: 'Task',
        title: task.title,
        subtitle: overdueByLabel(task.dueDate),
        date: task.dueDate,
        severity: 'overdue',
        icon: CheckSquare,
        href: ROUTES.tasks,
      });
    }
    for (const reminder of input.reminders) {
      if (reminder.completed || reminder.remindAt >= today) continue;
      overdue.push({
        id: `reminder-${reminder.id}`,
        entityId: reminder.id,
        domain: 'Reminder',
        title: reminder.title,
        subtitle: overdueByLabel(reminder.remindAt),
        date: reminder.remindAt,
        severity: 'overdue',
        icon: BellRing,
        href: ROUTES.reminders,
      });
    }
    for (const bill of input.bills) {
      if (bill.status === 'paid' || bill.dueDate >= today) continue;
      overdue.push({
        id: `bill-${bill.id}`,
        entityId: bill.id,
        domain: 'Bill',
        title: bill.title,
        subtitle: overdueByLabel(bill.dueDate),
        date: bill.dueDate,
        severity: 'overdue',
        icon: Receipt,
        href: ROUTES.bills,
      });
    }
    for (const medicine of input.medicines) {
      if (describeExpiry(medicine.expiresAt) !== 'expired') continue;
      overdue.push({
        id: `medicine-expired-${medicine.id}`,
        domain: 'Medicine',
        title: medicine.name,
        subtitle: overdueByLabel(medicine.expiresAt!),
        date: medicine.expiresAt!,
        severity: 'overdue',
        icon: Pill,
        href: ROUTES.health,
      });
    }
    for (const record of input.lifeRecords) {
      if (describeExpiry(record.expiresAt) !== 'expired') continue;
      overdue.push({
        id: `life-record-${record.id}`,
        domain: 'Life Record',
        title: record.title,
        subtitle: overdueByLabel(record.expiresAt!),
        date: record.expiresAt!,
        severity: 'overdue',
        icon: IdCard,
        href: ROUTES.lifeRecords,
      });
    }
  }

  const byTime = (a: FeedItem, b: FeedItem) => {
    const aTime =
      a.domain === 'Calendar' && a.subtitle !== 'All day'
        ? a.subtitle
        : '99:99';
    const bTime =
      b.domain === 'Calendar' && b.subtitle !== 'All day'
        ? b.subtitle
        : '99:99';
    return aTime.localeCompare(bTime);
  };
  const byDate = (a: FeedItem, b: FeedItem) => a.date.localeCompare(b.date);

  return {
    date,
    isToday,
    focus: focus.sort(byTime),
    overdue: overdue.sort(byDate),
    dueSoon: dueSoon.sort(byDate),
    expiringSoon: expiringSoon.sort(byDate),
    dueOnDate: dueOnDate.sort(byDate),
  };
}

/** "in 12 days" / "tomorrow" / a short weekday+date for anything further
 * out — used for the today-view's forward-looking "Due Soon"/"Expiring
 * Soon" buckets so they read like a real assistant, not a raw date. */
function relativeDueLabel(isoDate: string): string {
  const today = todayIso();
  const diffDays = Math.round(
    (new Date(`${isoDate}T00:00:00`).getTime() -
      new Date(`${today}T00:00:00`).getTime()) /
      86_400_000,
  );
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 30) return `in ${diffDays} days`;
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "3 days overdue" / "overdue" for today-exact — used for the today-view's
 * Overdue bucket. */
function overdueByLabel(isoDate: string): string {
  const today = todayIso();
  const diffDays = Math.round(
    (new Date(`${today}T00:00:00`).getTime() -
      new Date(`${isoDate}T00:00:00`).getTime()) /
      86_400_000,
  );
  if (diffDays <= 0) return 'Overdue';
  if (diffDays === 1) return '1 day overdue';
  return `${diffDays} days overdue`;
}
