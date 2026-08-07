import type { ZodTypeAny } from 'zod';

import { billFormSchema } from '@/features/bills/types';
import type {
  CaptureDomain,
  CaptureProposal,
} from '@/features/assistant/types';
import { eventFormSchema } from '@/features/calendar/types';
import { transactionFormSchema } from '@/features/finance/types';
import { medicineFormSchema } from '@/features/health/types';
import { reminderFormSchema } from '@/features/reminders/types';
import { taskFormSchema } from '@/features/tasks/types';

/**
 * The domains ICE can route a confirmable proposal into this pass — one
 * entry per wired domain, docs/35_Intelligent_Capture_Engine_Spec.md §5.
 * Each pairs a `CaptureDomain` with that domain's OWN existing
 * `{domain}FormSchema` (never a parallel schema) and the label used in
 * "Jarvis understood this as a {label}" (docs/35 §7).
 *
 * `grocery-list-item` is deliberately absent: it has no single-entity
 * FormDialog to delegate to (a capture can propose several items at once),
 * so it renders `GroceryCaptureCard` instead — see `CaptureConfirmSheet`.
 *
 * The remaining ~12 `CaptureDomain` values follow this exact pattern as a
 * fast-follow, not built this pass — see docs/35 §5 for the full table.
 */
export interface DomainRouteConfig {
  domain: CaptureDomain;
  label: string;
  schema: ZodTypeAny;
}

export const ICE_DOMAIN_CONFIG: Partial<
  Record<CaptureDomain, DomainRouteConfig>
> = {
  task: { domain: 'task', label: 'task', schema: taskFormSchema },
  bill: { domain: 'bill', label: 'bill', schema: billFormSchema },
  reminder: {
    domain: 'reminder',
    label: 'reminder',
    schema: reminderFormSchema,
  },
  'health-medicine': {
    domain: 'health-medicine',
    label: 'medicine',
    schema: medicineFormSchema,
  },
  'finance-transaction': {
    domain: 'finance-transaction',
    label: 'transaction',
    schema: transactionFormSchema,
  },
  'calendar-event': {
    domain: 'calendar-event',
    label: 'calendar event',
    schema: eventFormSchema,
  },
};

export interface ValidatedProposal {
  /** Schema-narrowed data on success; the raw extracted fields on failure (so the confirmation form still has something to pre-fill and let the user fix). */
  data: Record<string, unknown>;
  /** Zod issue messages keyed by field name. */
  fieldErrors: Record<string, string>;
  /** Field names to flag as "worth double-checking" on the confirmation screen — docs/35 §7. */
  lowConfidenceFields: Set<string>;
}

/**
 * Runs a proposal's `fields` through its target domain's existing Zod
 * schema — the one point where "AI-shaped data" becomes "the same shape
 * the manual form already produces" (docs/34_AI_Architecture.md §3). Never
 * introduces a new validation rule of its own.
 */
export function validateProposal(proposal: CaptureProposal): ValidatedProposal {
  const config = ICE_DOMAIN_CONFIG[proposal.domain];
  const lowConfidenceFields = new Set(proposal.guessedFieldKeys ?? []);

  if (!config) {
    return { data: proposal.fields, fieldErrors: {}, lowConfidenceFields };
  }

  const result = config.schema.safeParse(proposal.fields);
  if (result.success) {
    return {
      data: result.data as Record<string, unknown>,
      fieldErrors: {},
      lowConfidenceFields,
    };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { data: proposal.fields, fieldErrors, lowConfidenceFields };
}
