# 35 — Intelligent Capture Engine (ICE) Specification

ICE is the shared input pipeline every source of information passes through before reaching any domain's business logic (docs/01 §7). This document specifies the pipeline itself, the per-source scope for this phase, the structured output field-level shape, the domain routing table, the confirmation UX, and how ambiguity is handled. The provider abstraction and the confirm-before-save architecture that this pipeline sits inside are specified in [34_AI_Architecture.md](34_AI_Architecture.md); read that first if you haven't.

## 1. Pipeline

```
Input Source → Normalization → AIProvider.extract() → StructuredCapture
   → Schema Validation (per proposal, against the target domain's existing Zod schema)
   → Confirmation UI (CaptureConfirmSheet)
   → User edits (optional) → User confirms
   → Existing domain mutation hook (useCreateTask, useCreateBill, ...)
```

Every stage after "Normalization" is identical regardless of which input source started the pipeline — this is the point of the universal structured-output shape (docs/34 §4). Only "Normalization" is source-specific: it's the step that turns whatever came in (an audio buffer, a JPEG, a forwarded email) into the plain text or image payload `AIProvider.extract()` actually consumes.

## 2. Input Sources — Scope This Phase

Every source gets a UI entry point in this phase. Whether it's backed by a *functional* mock parser or a *visual-only* stub depends on how much the source depends on a capability this phase explicitly excludes (real network calls, real OCR/transcription models — [01_Product_Vision.md](01_Product_Vision.md) §5).

| Source | This phase | Normalization approach |
|---|---|---|
| Typed text | **Functional**, mock provider | Passed to `MockICEEngine` as-is — the same pattern-matching `mockAssistantEngine.ts` already does for chat |
| Voice conversations | **Functional UI, mock transcription** | Web Speech API (browser-native, no backend) provides real speech-to-text in-browser; the resulting text is then run through the same mock extraction as typed text. This is *not* a real AI transcription call — it's a browser capability already available client-side, so it can be genuinely functional without violating the no-real-AI-provider constraint |
| Clipboard | **Functional**, mock provider | Paste event → text extracted → same path as typed text |
| Shared text from other apps | **Functional**, mock provider | Web Share Target API payload → text → same path as typed text |
| Camera OCR | **UI-stubbed** | Camera capture UI is built and reachable; recognized text is a canned/simulated result for demo purposes (real OCR is a Phase 4+ concern, consistent with Documents' OCR-ready field already being UI-stubbed the same way — [02_Product_Requirements_Document.md](02_Product_Requirements_Document.md) §3.13) |
| Images | **UI-stubbed** | Upload/attach UI built; content "understanding" is simulated, same rationale as Camera OCR |
| PDFs | **UI-stubbed** | Same rationale — real PDF parsing/extraction is real-backend territory |
| Emails | **UI-stubbed** | No real inbox integration exists or is planned for this phase; the entry point ("Forward to LifyQ") is designed and shown, not wired to a real mailbox |
| Future integrations | **Design-reserved only** | No UI in this phase — the pipeline shape (§1) is built so a future source only needs a new Normalization adapter, nothing downstream |

This mirrors the exact posture already used for Cloud Sync and Notifications (visible, honest UI affordances communicating the product's eventual shape, without implying real behavior — [02_Product_Requirements_Document.md](02_Product_Requirements_Document.md) §3.18) rather than hiding unfinished sources entirely.

## 3. Structured Output — Field-Level Spec

Expanding on the shape introduced in [34_AI_Architecture.md](34_AI_Architecture.md) §4:

```ts
type CaptureSourceType =
  | 'voice' | 'text' | 'ocr' | 'image' | 'pdf'
  | 'email' | 'shared-text' | 'clipboard';

type CaptureDomain =
  | 'task' | 'goal' | 'habit' | 'calendar-event' | 'note'
  | 'life-record' | 'bill' | 'subscription' | 'document'
  | 'grocery-list-item' | 'health-medicine' | 'health-event'
  | 'health-vital' | 'health-allergy' | 'project'
  | 'finance-transaction' | 'finance-budget' | 'journal-entry'
  | 'reminder';

interface CaptureProposal {
  domain: CaptureDomain;
  action: 'create' | 'update' | 'query';
  fields: Record<string, unknown>;   // validated against that domain's existing {domain}FormSchema
  confidence: number;                // 0–1
  clarifyingQuestion?: string;       // present only when confidence is below threshold — §6
  entityRef?: string;                // set for 'update'/'query' actions once an existing entity is matched
}
```

`CaptureDomain` is a closed enum matching every existing pillar's repository ([13_Technical_Architecture.md](13_Technical_Architecture.md) §10.2) — adding a pillar means adding one value here plus one routing-table row (§5), nothing else. `fields` is intentionally untyped (`Record<string, unknown>`) at the `StructuredCapture` boundary because the provider doesn't know each domain's exact schema; the Schema Validation pipeline stage (§1) is what narrows it to a real `Create{X}Input` (or rejects/flags it) using the domain's own existing Zod schema — the single point where "AI-shaped data" becomes "the same data type the manual form already produces."

**One utterance can yield multiple proposals.** "Buy coffee and chicken tomorrow" produces two `grocery-list-item` proposals (or one `grocery-list-item` proposal with two line items, if a matching list exists — routing detail in §5), not one malformed combined object. The confirmation UI (§7) presents multiple proposals as a reviewable batch, not a single form.

## 4. Intent Recognition — What ICE Understands

Per [01_Product_Vision.md](01_Product_Vision.md) §7, extraction must handle: context, follow-up questions, dates (including relative — "in two days," "next year," "this weekend"), recurring schedules ("every 15th," "weekly"), priorities, locations, people, products, companies, documents, medicines, subscriptions, bills, groceries, reminders, projects, and tasks. Concretely, this means the extraction rule set (real or mock) resolves:

- **Relative dates** to absolute ISO dates at parse time, using the same date utilities every domain already uses ([lib/date.ts](../src/lib/date.ts)) — not left as unparsed strings for the domain to figure out.
- **Recurrence phrasing** ("every 15th," "weekly," "monthly") to the same recurrence enums each domain already defines (`BillRecurrence`, `ReminderRecurrence`, `HabitFrequency`) — ICE does not invent a parallel recurrence model.
- **Named entities** (people, places, products, companies) as free-text fields on the target proposal (e.g., a bill's `title`, a grocery item's name) — this phase does not introduce first-class Person/Place/Company entities; that would be new domain scope, not an ICE concern.
- **Follow-up/context** — within one Jarvis conversation thread, a later message can refine an earlier unconfirmed proposal (e.g., "actually make that recurring") rather than starting a new one from scratch. The confirmation screen for a pending proposal stays open/referenceable until the user confirms or dismisses it.

## 5. Domain Routing Table

The mapping from recognized intent to existing domain and action — this is also the authoritative "module relationships" reference for ICE, extending the relationship graph already in [06_Information_Architecture.md](06_Information_Architecture.md) §4:

| Example utterance | `domain` | `action` | Target (existing) |
|---|---|---|---|
| "Call dentist tomorrow 3pm" | `task` | create | `tasksRepository` — `dueDate` resolved, no project by default |
| "I have a meeting in two days" | `calendar-event` | create | `eventsRepository` |
| "Remind me to call my mother this weekend" | `reminder` | create | `remindersRepository` |
| "My electricity bill is due every 15th" | `bill` | create | `billsRepository`, `recurrence: 'monthly'` |
| "My passport expires next year" | `life-record` | create | `lifeRecordsRepository`, `expiresAt` resolved |
| "Buy coffee and chicken tomorrow" | `grocery-list-item` ×2 | create | `groceryListsRepository` — appended to the active/default list if one exists, else proposes creating one |
| "Netflix renews the 3rd, $15.49/mo" | `subscription` | create | `subscriptionsRepository` |
| "Spent $40 on groceries" | `finance-transaction` | create | `transactionsRepository`, `type: 'expense'`, `category: 'groceries'` |
| "Run a half-marathon by June" | `goal` | create | `goalsRepository`, `targetDate` resolved |
| "Meditate every morning" | `habit` | create | `habitsRepository`, `frequency: 'daily'` |
| "Add 'talk to Sam about the roadmap' to the LifyQ project" | `task` | create | `tasksRepository`, then linked via `useSetProjectTasks` — a project match narrows the target, it doesn't change the domain |
| "Took my vitamin D today" | `health-medicine` | update | `medicinesRepository` — matched against an existing medicine by name (`entityRef` set); proposes a `create` instead if no match |
| "What's on my plate today?" | — | query | Routed to Jarvis's `converse()`, not `extract()` — no proposal, no confirmation screen; this is the existing chat behavior, unchanged |

Every row's "Target" column is an **already-built** repository from docs/30–33 — ICE introduces no new repository. Rows are added to this table exactly when a new domain ships, following the same "no bespoke architecture" rule every domain addition has followed since [13_Technical_Architecture.md](13_Technical_Architecture.md) §10.2.

## 6. Confidence and Clarifying Questions

`confidence` below a fixed threshold (0.6, revisit once real-provider data exists) suppresses the confirmation screen in favor of a clarifying follow-up rendered in the Jarvis conversation — e.g., input "Fix the thing with Sam" produces no confident proposal, so Jarvis asks *"Is this a task, or something for a specific project?"* rather than guessing and presenting a low-quality proposal for the user to fix by hand. This keeps the confirmation screen reserved for proposals worth reviewing, not every uncertain guess — consistent with [01_Product_Vision.md](01_Product_Vision.md) §6's "not an autonomous agent" guardrail: when ICE isn't confident, it asks, it doesn't assume.

## 7. Confirmation UX

The `CaptureConfirmSheet` (built on the existing `ResponsiveFormSheet` primitive — Dialog at `lg+`, bottom Sheet below, per [11_Component_Library.md](11_Component_Library.md)):

- **Single proposal** → renders exactly like that domain's existing create form, pre-filled from `fields`, with a one-line "Jarvis understood this as a {domain}" header so the routing decision is never invisible to the user.
- **Multiple proposals from one capture** → a stepper/list of proposal cards, each independently editable and independently confirmable or dismissible — confirming one doesn't require confirming all.
- **Edit** — every field uses the exact same input component the manual form already uses for that field (a date field is the same date picker, a category field is the same `Select`) — no parallel "AI editing" UI is built.
- **Reject/discard** — always available, always non-destructive (nothing was saved yet, so "discard" has no confirmation step of its own).
- **Low-confidence fields** are visually flagged (a subtle indicator, not a blocking error) so the user's attention goes where the extraction was least certain, without preventing confirmation of the fields that were confident.

## 8. What This Spec Deliberately Does Not Cover

- Real OCR/transcription model selection — a Phase 4+ backend decision, out of scope for a frontend/architecture spec.
- Person/Place/Company as first-class entities — noted in §4 as free-text only; promoting them to real domains is a future roadmap decision, not implied by this spec.
- Multi-user disambiguation ("my mother" resolving to a saved contact) — no Contacts domain exists; this phase keeps such references as free text.
