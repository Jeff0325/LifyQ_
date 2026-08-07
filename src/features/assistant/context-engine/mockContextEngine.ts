import { eventsRepository } from '@/features/calendar/repository';
import { billsRepository } from '@/features/bills/repository';
import {
  budgetsRepository,
  transactionsRepository,
} from '@/features/finance/repository';
import { computeSpent } from '@/features/finance/utils';
import {
  healthEventsRepository,
  medicinesRepository,
} from '@/features/health/repository';
import { lifeRecordsRepository } from '@/features/life-records/repository';
import { subscriptionsRepository } from '@/features/subscriptions/repository';
import { todayIso } from '@/lib/date';

function friendlyDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

interface CrossDomainRule {
  label: string;
  test: RegExp;
  respond: () => Promise<string>;
}

// ---- Bill × Budget ---------------------------------------------------

async function billBudgetRule(): Promise<string> {
  const [bills, budgets, transactions] = await Promise.all([
    billsRepository.list(),
    budgetsRepository.list(),
    transactionsRepository.list(),
  ]);

  const unpaid = bills.filter((b) => b.status !== 'paid');
  if (unpaid.length === 0) {
    return "Good news — you don't have any unpaid bills right now, so your budgets are safe for the moment.";
  }

  const matches = unpaid
    .map((bill) => {
      const budget = budgets.find((b) => b.category === bill.category);
      if (!budget) return null;
      const spent = computeSpent(budget, transactions);
      return { bill, budget, overBy: spent - budget.limit };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null && m.overBy > 0);

  if (matches.length === 0) {
    return "None of your unpaid bills fall under a budget that's currently over limit, so you're in decent shape.";
  }
  const worst = matches[0]!;
  return `Worth flagging — "${worst.bill.title}" falls under your ${worst.budget.category} budget, which is already $${worst.overBy.toFixed(0)} over this month.`;
}

// ---- Subscription × Transaction (financial half only — docs/38 §6) -----

async function subscriptionTransactionRule(): Promise<string> {
  const [subscriptions, transactions, budgets] = await Promise.all([
    subscriptionsRepository.list(),
    transactionsRepository.list(),
    budgetsRepository.list(),
  ]);

  if (subscriptions.length === 0) {
    return "You don't have any subscriptions tracked yet.";
  }

  const overBudget = budgets.filter(
    (b) => computeSpent(b, transactions) > b.limit,
  );
  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + (s.billingCycle === 'yearly' ? s.cost / 12 : s.cost),
    0,
  );

  if (overBudget.length === 0) {
    return "None of your budgets are over limit right now, so cancelling a subscription wouldn't fix anything urgent. I can't tell how often you actually use each one, though — that part's up to you.";
  }
  return `You have ${overBudget.length} budget${overBudget.length === 1 ? '' : 's'} running over and about $${totalMonthly.toFixed(0)} a month tied up in subscriptions, so trimming one would help the numbers. I can't tell how often you actually use each service, though — that part's up to you.`;
}

// ---- Medicine × Health Event (appointment) ------------------------------

async function medicineHealthEventRule(): Promise<string> {
  const [medicines, healthEvents] = await Promise.all([
    medicinesRepository.list(),
    healthEventsRepository.list(),
  ]);
  const today = todayIso();

  const nextVisit = healthEvents
    .filter((e) => e.type === 'doctor_visit' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!nextVisit) {
    return "You don't have any upcoming doctor visits scheduled, so there's nothing to check against your medicines yet.";
  }

  const expiringBefore = medicines.filter(
    (m) => m.expiresAt && m.expiresAt < nextVisit.date,
  );
  if (expiringBefore.length === 0) {
    return `Good news — nothing expires before your "${nextVisit.title}" visit on ${friendlyDate(nextVisit.date)}.`;
  }
  return `Worth noting — ${expiringBefore.map((m) => `"${m.name}"`).join(', ')} expire${expiringBefore.length === 1 ? 's' : ''} before your "${nextVisit.title}" visit on ${friendlyDate(nextVisit.date)}, so you may want to refill ahead of time.`;
}

// ---- Life Record × Calendar Event ("future travel" stand-in) -----------

const TRAVEL_KEYWORDS = /\b(trip|flight|travel|vacation|offsite|conference)\b/i;

async function lifeRecordCalendarEventRule(): Promise<string> {
  const [records, events] = await Promise.all([
    lifeRecordsRepository.list(),
    eventsRepository.list(),
  ]);
  const today = todayIso();

  const nextExpiring = records
    .filter((r) => r.expiresAt && r.expiresAt >= today)
    .sort((a, b) => a.expiresAt!.localeCompare(b.expiresAt!))[0];
  if (!nextExpiring?.expiresAt) {
    return "Nothing on your records is expiring soon, so you're all set for now.";
  }

  // No real "travel" tag exists on Calendar events (docs/38 §6) — matching
  // by keyword against the event title, not just "any event in the date
  // window," so an unrelated event (a dentist appointment, say) doesn't get
  // paired with a passport as if it were a trip.
  const possibleTrip = events
    .filter((e) => e.date >= today && TRAVEL_KEYWORDS.test(e.title))
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!possibleTrip) {
    return `Your "${nextExpiring.title}" expires ${friendlyDate(nextExpiring.expiresAt)}. Nothing on your calendar looks like travel right now, but I can only go by event titles.`;
  }
  if (possibleTrip.date < nextExpiring.expiresAt) {
    return `Good news — your "${nextExpiring.title}" is valid through ${friendlyDate(nextExpiring.expiresAt)}, which comfortably covers your "${possibleTrip.title}" on ${friendlyDate(possibleTrip.date)}.`;
  }
  return `Heads-up — your "${nextExpiring.title}" expires ${friendlyDate(nextExpiring.expiresAt)}, before your "${possibleTrip.title}" on ${friendlyDate(possibleTrip.date)}. Worth renewing it before you go.`;
}

/**
 * Priority-ordered, first match wins (like ICE's extraction rules). This
 * regex check is what makes `answerCrossDomain` cheap for the common
 * single-domain case — no repository read happens unless one of these
 * actually matches (docs/38_Context_Engine.md §2's "single-domain must be
 * completely unaffected" requirement). `classifyQuery` below exposes the
 * same check standalone, for callers that only need the classification.
 */
const CROSS_DOMAIN_RULES: CrossDomainRule[] = [
  {
    label: 'Bills × Budgets',
    test: /\bbill\w*.*budget\w*|budget\w*.*bill\w*\b/i,
    respond: billBudgetRule,
  },
  {
    label: 'Subscriptions × Spending',
    test: /\bcancel\w*.*subscription|subscription\w*.*cancel/i,
    respond: subscriptionTransactionRule,
  },
  {
    label: 'Medicines × Appointments',
    test: /\bmedicine\w*.*appointment|medicine\w*.*doctor|appointment\w*.*medicine|expir\w*.*appointment/i,
    respond: medicineHealthEventRule,
  },
  {
    label: 'Records × Calendar',
    test: /\b(passport|record\w*).*(trip|travel|calendar|event\w*)/i,
    respond: lifeRecordCalendarEventRule,
  },
];

export function classifyQuery(
  message: string,
): 'single-domain' | 'cross-domain' {
  return CROSS_DOMAIN_RULES.some((rule) => rule.test.test(message))
    ? 'cross-domain'
    : 'single-domain';
}

/**
 * Returns a synthesized cross-domain answer, or `null` if the message
 * doesn't touch more than one domain — the caller falls through to the
 * existing single-domain `converse()` path unchanged. See docs/38 §4 for
 * why this mock-phase implementation collapses retrieval + computation +
 * phrasing into one function instead of a separate "assemble context, then
 * hand to synthesis" step.
 */
export async function answerCrossDomain(
  message: string,
): Promise<string | null> {
  const matched = CROSS_DOMAIN_RULES.find((rule) => rule.test.test(message));
  return matched ? matched.respond() : null;
}
