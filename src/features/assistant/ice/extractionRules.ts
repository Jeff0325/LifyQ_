import {
  ICE_DOMAIN_CONFIG,
  type DomainRouteConfig,
} from '@/features/assistant/ice/domainRouting';
import { fuzzyFindByName } from '@/features/assistant/ice/fuzzyFindByName';
import type {
  CaptureDomain,
  CaptureInput,
  CaptureProposal,
  StructuredCapture,
} from '@/features/assistant/types';
import type { BillCategory } from '@/features/bills/types';
import { eventsRepository } from '@/features/calendar/repository';
import type {
  TransactionCategory,
  TransactionType,
} from '@/features/finance/types';
import { medicinesRepository } from '@/features/health/repository';
import {
  resolveRecurrencePhrase,
  resolveRelativeDate,
  todayIso,
} from '@/lib/date';

/** docs/35_Intelligent_Capture_Engine_Spec.md §6 — below this, a proposal carries a clarifying question instead of standing on its own. */
const CONFIDENCE_THRESHOLD = 0.6;

function capitalize(text: string): string {
  const trimmed = text.trim();
  return trimmed.length === 0
    ? trimmed
    : trimmed[0]!.toUpperCase() + trimmed.slice(1);
}

interface ExtractionRule {
  domain: CaptureDomain;
  test: RegExp;
  build: (text: string) => Promise<CaptureProposal[]>;
}

// ---- Bill ------------------------------------------------------------

function guessBillCategory(text: string): BillCategory {
  const lower = text.toLowerCase();
  if (/electric/.test(lower)) return 'electricity';
  if (/\bwater\b/.test(lower)) return 'water';
  if (/internet|wifi|broadband/.test(lower)) return 'internet';
  if (/mobile|phone bill/.test(lower)) return 'mobile';
  if (/\brent\b/.test(lower)) return 'rent';
  if (/mortgage/.test(lower)) return 'mortgage';
  return 'other';
}

const BILL_CATEGORY_TITLES: Record<BillCategory, string> = {
  electricity: 'Electricity bill',
  water: 'Water bill',
  internet: 'Internet bill',
  mobile: 'Mobile bill',
  rent: 'Rent',
  mortgage: 'Mortgage',
  other: 'Bill',
};

const billRule: ExtractionRule = {
  domain: 'bill',
  test: /\b(bill|electricity|water bill|rent|mortgage|internet bill|mobile bill)\b/i,
  build: async (text) => {
    const category = guessBillCategory(text);
    const dueDate = resolveRelativeDate(text);
    const recurrencePhrase = resolveRecurrencePhrase(text);
    const recurrence =
      recurrencePhrase === 'yearly' ||
      recurrencePhrase === 'monthly' ||
      recurrencePhrase === 'weekly'
        ? recurrencePhrase
        : 'one_time';
    const amountMatch = text.match(/\$\s?(\d+(?:\.\d{1,2})?)/);

    const guessedFieldKeys: string[] = [];
    if (!dueDate) guessedFieldKeys.push('dueDate');
    if (!recurrencePhrase) guessedFieldKeys.push('recurrence');

    return [
      {
        domain: 'bill',
        action: 'create',
        fields: {
          title: BILL_CATEGORY_TITLES[category],
          category,
          dueDate: dueDate ?? todayIso(),
          recurrence,
          ...(amountMatch ? { amount: Number(amountMatch[1]) } : {}),
        },
        confidence: dueDate ? 0.9 : 0.6,
        guessedFieldKeys,
      },
    ];
  },
};

// ---- Reminder ----------------------------------------------------------

const reminderRule: ExtractionRule = {
  domain: 'reminder',
  test: /\bremind (?:me )?to\b/i,
  build: async (text) => {
    const match = text.match(/\bremind (?:me )?to (.+)/i);
    const title = match
      ? capitalize(match[1]!.replace(/[.!]+$/, '').trim())
      : 'Reminder';
    const remindAt = resolveRelativeDate(text);
    const recurrencePhrase = resolveRecurrencePhrase(text);
    const recurring =
      recurrencePhrase === 'daily' ||
      recurrencePhrase === 'weekly' ||
      recurrencePhrase === 'monthly'
        ? recurrencePhrase
        : 'none';

    const guessedFieldKeys: string[] = [];
    if (!remindAt) guessedFieldKeys.push('remindAt');
    if (!recurrencePhrase) guessedFieldKeys.push('recurring');

    return [
      {
        domain: 'reminder',
        action: 'create',
        fields: { title, remindAt: remindAt ?? todayIso(), recurring },
        confidence: remindAt ? 0.85 : 0.65,
        guessedFieldKeys,
      },
    ];
  },
};

// ---- Calendar Event (create + update-by-fuzzy-title-match) ---------------

function parseClockTime(text: string): string | undefined {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!match) return undefined;
  let hour = parseInt(match[1]!, 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const isPm = /pm/i.test(match[3]!);
  if (isPm && hour < 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const calendarEventRule: ExtractionRule = {
  domain: 'calendar-event',
  test: /\b(move|reschedule|change)\b.*\b(meeting|appointment|event)\b|\b(meeting|appointment)\b.*\b(schedule|add|create|book)\b|\b(schedule|add|create|book)\b.*\b(meeting|appointment)\b/i,
  build: async (text) => {
    const newDate = resolveRelativeDate(text);
    const newTime = parseClockTime(text);
    const isUpdate = /\b(move|reschedule|change)\b/i.test(text);

    if (isUpdate) {
      const titleMatch = text.match(
        /\b(?:move|reschedule|change)\b\s+(?:my\s+|the\s+)?(.+?)\s+(?:to|for)\b/i,
      );
      const query = titleMatch ? titleMatch[1]! : text;
      const events = await eventsRepository.list();
      const existing = fuzzyFindByName(events, 'title', query);
      if (existing) {
        return [
          {
            domain: 'calendar-event',
            action: 'update',
            entityRef: existing.id,
            fields: {
              title: existing.title,
              date: newDate ?? existing.date,
              startTime: newTime ?? existing.startTime,
              endTime: existing.endTime,
              location: existing.location,
            },
            confidence: 0.75,
            guessedFieldKeys: [],
          },
        ];
      }
    }

    const title = capitalize(text.replace(/[.!]+$/, '').trim());
    const guessedFieldKeys: string[] = [];
    if (!newDate) guessedFieldKeys.push('date');

    return [
      {
        domain: 'calendar-event',
        action: 'create',
        fields: {
          title,
          date: newDate ?? todayIso(),
          ...(newTime ? { startTime: newTime } : {}),
        },
        confidence: newDate ? 0.75 : 0.55,
        guessedFieldKeys,
      },
    ];
  },
};

// ---- Health / Medicine ---------------------------------------------------

const healthMedicineRule: ExtractionRule = {
  domain: 'health-medicine',
  test: /\b(medicine|medication|pill|vitamin|took my|prescri\w*)\b/i,
  build: async (text) => {
    const nameMatch =
      text.match(
        /\b(?:took|take|taking)\s+(?:my\s+)?([a-z0-9 ]+?)(?:\s+(?:today|tomorrow|expires?)\b|[.!]|$)/i,
      ) ??
      text.match(
        /\b(vitamin\s?[a-z0-9]*|[a-z]+cillin|ibuprofen|aspirin|paracetamol)\b/i,
      );
    const name = nameMatch ? capitalize(nameMatch[1]!.trim()) : undefined;
    const expiresAt = resolveRelativeDate(text);

    if (name) {
      const medicines = await medicinesRepository.list();
      const existing = fuzzyFindByName(medicines, 'name', name);
      if (existing) {
        return [
          {
            domain: 'health-medicine',
            action: 'update',
            entityRef: existing.id,
            fields: {
              name: existing.name,
              dosage: existing.dosage,
              prescribedBy: existing.prescribedBy,
              expiresAt: expiresAt ?? existing.expiresAt,
              refillReminderAt: existing.refillReminderAt,
            },
            confidence: 0.8,
            guessedFieldKeys: [],
          },
        ];
      }
    }

    const guessedFieldKeys: string[] = [];
    if (!expiresAt) guessedFieldKeys.push('expiresAt');

    return [
      {
        domain: 'health-medicine',
        action: 'create',
        fields: {
          name: name ?? 'Medicine',
          ...(expiresAt ? { expiresAt } : {}),
        },
        confidence: name ? 0.7 : 0.4,
        guessedFieldKeys,
      },
    ];
  },
};

// ---- Finance / Transaction -----------------------------------------------

function guessTransactionCategory(text: string): TransactionCategory {
  const lower = text.toLowerCase();
  if (/grocer/.test(lower)) return 'groceries';
  if (/restaurant|dinner|lunch|coffee|dining/.test(lower)) return 'dining';
  if (/gas|fuel|uber|taxi|transport|parking/.test(lower)) return 'transport';
  if (/movie|netflix|game|entertainment/.test(lower)) return 'entertainment';
  if (/rent|mortgage|utilit(y|ies)|electric|water\b/.test(lower))
    return 'housing';
  if (/doctor|pharmacy|medicine|health/.test(lower)) return 'health';
  if (/shop|clothes|amazon/.test(lower)) return 'shopping';
  return 'other';
}

const financeTransactionRule: ExtractionRule = {
  domain: 'finance-transaction',
  test: /\b(spent|paid|bought)\b.*\$?\s?\d/i,
  build: async (text) => {
    const amountMatch = text.match(/\$\s?(\d+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? Number(amountMatch[1]) : 0;
    const category = guessTransactionCategory(text);
    const date = resolveRelativeDate(text);
    const type: TransactionType = 'expense'; // the trigger regex requires spent/paid/bought

    const guessedFieldKeys: string[] = [];
    if (!date) guessedFieldKeys.push('date');
    if (!amountMatch) guessedFieldKeys.push('amount');

    return [
      {
        domain: 'finance-transaction',
        action: 'create',
        fields: {
          amount,
          type,
          category,
          date: date ?? todayIso(),
          note: capitalize(text.replace(/[.!]+$/, '').trim()),
        },
        confidence: amountMatch ? 0.85 : 0.3,
        guessedFieldKeys,
      },
    ];
  },
};

// ---- Grocery list item(s) — the one multi-proposal rule ------------------

const groceryListItemRule: ExtractionRule = {
  domain: 'grocery-list-item',
  test: /\b(buy|grocer(y|ies)|shopping list|pick up)\b/i,
  build: async (text) => {
    const withoutVerb = text.replace(/\b(buy|pick up)\b/i, '').trim();
    const withoutDate = withoutVerb
      .replace(/\b(today|tomorrow|this weekend|next week)\b.*$/i, '')
      .trim();
    const items = withoutDate
      .split(/,|\band\b/i)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) {
      return [
        {
          domain: 'grocery-list-item',
          action: 'create',
          fields: { name: 'Item' },
          confidence: 0.3,
          guessedFieldKeys: ['name'],
        },
      ];
    }

    return items.map((name) => ({
      domain: 'grocery-list-item' as const,
      action: 'create' as const,
      fields: { name: capitalize(name) },
      confidence: 0.75,
      guessedFieldKeys: [],
    }));
  },
};

// ---- Task — the fallback for any other actionable statement --------------

const taskRule: ExtractionRule = {
  domain: 'task',
  // Deliberately matches anything — reached only when nothing more specific
  // did, since EXTRACTION_RULES is priority-ordered and this is last.
  test: /./,
  build: async (text) => {
    const dueDate = resolveRelativeDate(text);
    const title = capitalize(text.replace(/[.!]+$/, '').trim());
    const guessedFieldKeys = ['status', 'priority', 'category'];
    if (!dueDate) guessedFieldKeys.push('dueDate');

    return [
      {
        domain: 'task',
        action: 'create',
        fields: {
          title,
          status: 'todo',
          priority: 'none',
          category: 'other',
          ...(dueDate ? { dueDate } : {}),
        },
        confidence: 0.65,
        guessedFieldKeys,
      },
    ];
  },
};

/**
 * Priority order matters — unlike `converseMock`'s RULES (every matching
 * rule contributes to a combined answer), a single capture should usually
 * become ONE proposal, not several competing ones. First match wins;
 * `taskRule` is the catch-all and must stay last. See docs/35 §5.
 */
const EXTRACTION_RULES: ExtractionRule[] = [
  billRule,
  reminderRule,
  calendarEventRule,
  healthMedicineRule,
  financeTransactionRule,
  groceryListItemRule,
  taskRule,
];

/** Routes query-shaped input to `converse()`/the Context Engine instead of a confirmation screen — docs/35 §5's "query" row. */
export function looksLikeQuery(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.endsWith('?')) return true;
  return /^(what|when|which|who|how|why|where|can i|do i|does|is there|are there|will i|am i|tell me|give me|show me|explain)\b/i.test(
    trimmed,
  );
}

function clarifyingQuestionFor(domain: CaptureDomain): string {
  const config: DomainRouteConfig | undefined = ICE_DOMAIN_CONFIG[domain];
  const label = config?.label ?? domain.replace(/-/g, ' ');
  return `I think this might be a ${label} — can you say a bit more, or tell me which part of LifyQ this belongs to?`;
}

export async function extractMock(
  input: CaptureInput,
): Promise<StructuredCapture> {
  const text = input.text.trim();

  if (!text || looksLikeQuery(text)) {
    return { sourceType: input.sourceType, proposals: [], rawInput: text };
  }

  const rule = EXTRACTION_RULES.find((r) => r.test.test(text));
  const rawProposals = rule ? await rule.build(text) : [];

  const proposals = rawProposals.map((proposal) =>
    proposal.confidence < CONFIDENCE_THRESHOLD
      ? {
          ...proposal,
          clarifyingQuestion: clarifyingQuestionFor(proposal.domain),
        }
      : proposal,
  );

  return { sourceType: input.sourceType, proposals, rawInput: text };
}
