# 34 — AI Architecture

This document specifies how AI is architected across LifyQ: the provider-abstraction layer, the confirm-before-save principle, and exactly how a piece of AI-extracted information reaches the existing domain repositories without any of them changing. It is the technical companion to [01_Product_Vision.md](01_Product_Vision.md) §7 (why this exists), [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) (the capture/write pipeline), and [38_Context_Engine.md](38_Context_Engine.md) (the cross-domain reasoning/read pipeline). This document covers the parts that are true regardless of which pipeline is running.

## 1. AI Provider Abstraction

No part of the application — UI, ICE, Jarvis, the Context Engine, or any domain — is allowed to depend on a specific AI vendor's request/response shape. Every AI call in the system goes through one interface:

```ts
interface AIProvider {
  /** Freeform conversation — Jarvis's chat surface. Cross-domain questions
   *  are pre-processed by the Context Engine (§1a) before reaching this. */
  converse(thread: ChatMessage[], message: string): Promise<string>;

  /** Structured extraction — ICE's capture pipeline. */
  extract(input: CaptureInput): Promise<StructuredCapture>;
}
```

(Corrected — the shipped interface, `src/features/assistant/types.ts`, returns a plain `string` from `converse()`, not a wrapper response object; docs/41 confirmed and fixed this drift.) `CaptureInput` and `StructuredCapture` are specified in doc 35 §3 and are provider-agnostic — they describe *what* was understood, never how a specific vendor's API represents it. A `{Vendor}Provider` class (`OpenAIProvider`, `AnthropicProvider`, `GeminiProvider`, `OllamaProvider`, `AzureOpenAIProvider`, or a local-model provider) implements this interface once, translating the vendor's actual request/response format at the boundary. Everything upstream of that boundary — the confirmation UI, the domain routers, every existing feature's mutation hooks — never sees a vendor-specific type.

### 1a. Where the Context Engine Sits

`converse()` remains a single, simple method — the Context Engine is not a third `AIProvider` method, it's a step that runs *before* `converse()` for questions that need it:

```
User message → Context Engine's Query Classification (38 §2)
  → [single-domain] straight to converse() unchanged, today's existing behavior
  → [cross-domain] Context Engine assembles joined/computed context (38 §2–3)
      → that assembled context + the original message → converse()
```

`converse()` itself never knows whether its input was passed straight through or pre-assembled by the Context Engine — it always just receives a thread and a message (the message, in the cross-domain case, includes the assembled context as part of what it's given to synthesize from). This keeps `AIProvider` a two-method interface, and keeps the Context Engine a pipeline stage rather than a new surface the provider abstraction has to know about.

This is the same pattern already established for `AssistantEngine` ([13_Technical_Architecture.md](13_Technical_Architecture.md) §7) and for data repositories ([13_Technical_Architecture.md](13_Technical_Architecture.md) §4): one interface, swappable implementations, nothing above the seam changes when the implementation below it does. `AIProvider` **is** the generalized, two-method form of what `AssistantEngine` already was — `converse()` replaces `sendMessage()` 1:1, and `extract()` is new, added specifically for ICE. `AssistantEngine`'s existing consumers (the chat UI, `useAssistant`) are not rewritten; they're re-pointed at `AIProvider.converse()`.

**Provider selection** is a single config value (`VITE_AI_PROVIDER`, following the same `import.meta.env` pattern already used for `VITE_DATA_SOURCE`, per [13_Technical_Architecture.md](13_Technical_Architecture.md) §9), read once at boot by a small factory that returns the configured `AIProvider` implementation. Nothing else in the app performs provider selection logic.

## 2. The Confirm-Before-Save Principle

This is a product law (docs/01 §7), enforced architecturally, not just by convention:

1. **Understand** — the provider parses the input's intent.
2. **Extract** — structured fields are pulled out (dates, amounts, people, categories, recurrence, ...).
3. **Recommend** — ICE proposes which domain(s) and which action (create/update/query) this maps to.
4. **Confirm** — the proposal renders on a confirmation screen, never silently applied.
5. **Edit** — every extracted field is editable inline before it's committed.
6. **Save** — only on explicit user confirmation does the data reach a repository.

**Architecturally, this means `AIProvider.extract()` never calls a mutation hook.** It returns a `StructuredCapture` value — inert data, not a side effect. The confirmation UI (a `CaptureConfirmSheet`, following the same `ResponsiveFormSheet` pattern every domain's create/edit form already uses — [12_Folder_Architecture.md](12_Folder_Architecture.md), [13_Technical_Architecture.md](13_Technical_Architecture.md) §3) is the *only* code path that calls `useCreateTask`, `useCreateBill`, `useCreateReminder`, or any other existing mutation hook. There is no "auto-save" code path to accidentally trigger — the mutation call physically doesn't exist until the confirmation UI's Save button fires it, exactly the way today's manual "New Task" dialog already works. **A confirmed ICE capture and a manually filled-in form are, from the repository's point of view, indistinguishable** — same input type, same validation schema (§3), same mutation hook.

This is also why ICE requires **zero changes** to any of the fifteen existing domain repositories. It's a new caller of the same `create`/`update` functions those repositories already expose, not a new data path.

## 3. One Schema, Two Entry Points

Every domain already validates its create/edit form with a Zod schema (`taskFormSchema`, `billFormSchema`, `reminderFormSchema`, ...) shared between the form and the repository input type (established since [30_Core_Feature_Implementation.md](30_Core_Feature_Implementation.md)). ICE reuses these same schemas rather than inventing parallel validation:

- The provider extracts a best-guess object shaped like the domain's `Create{X}Input`.
- Before rendering the confirmation screen, ICE runs the extracted object through that domain's existing Zod schema. Fields that fail validation (or are missing) are flagged for the user to fill in, using the same inline-error UI the manual form already has — no new error-display pattern.
- On confirm, the (now user-approved) object is passed to the existing `useCreate{X}` hook unchanged.

The practical effect: **a domain never needs to know it can be reached via ICE.** As far as `tasksRepository`, `billsRepository`, or any future domain's repository is concerned, a capture confirmed via Jarvis and a task typed into the "New Task" dialog arrive identically.

## 4. Universal Structured Output

Every provider — regardless of input source (voice, text, OCR, ...) or vendor — returns the same normalized shape. Full field-level spec is in [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §3; the shape that matters architecturally is that it's a **discriminated union keyed by target domain**, with a confidence score and a list of ambiguities:

```ts
interface StructuredCapture {
  sourceType: CaptureSourceType;      // 'voice' | 'text' | 'ocr' | 'image' | 'pdf' | 'email' | 'shared-text' | 'clipboard'
  proposals: CaptureProposal[];       // one utterance can yield multiple proposals — see doc 35 §4
  rawInput: string;                   // normalized text form of whatever was captured, kept for audit/re-edit
}

interface CaptureProposal {
  domain: CaptureDomain;              // 'task' | 'bill' | 'reminder' | 'goal' | ... — every existing pillar, see doc 35 §5
  action: 'create' | 'update' | 'query';
  fields: Record<string, unknown>;    // shaped like that domain's Create{X}Input, validated per §3
  confidence: number;                 // 0–1
  clarifyingQuestion?: string;        // set when confidence is too low to propose confidently — doc 35 §6
}
```

Because this shape is identical regardless of source, the confirmation UI, the domain router, and every downstream repository call are written once and work for every input source doc 35 defines — adding a new source later (e.g., a future calendar-import integration) means writing a new adapter that produces this same shape, not new UI or new routing logic.

## 5. Mock-Phase Implementation: `MockICEEngine`

Per [01_Product_Vision.md](01_Product_Vision.md) §5, this phase ships no real AI provider. `MockICEEngine` implements `AIProvider` using deterministic pattern-matching — the same technique `mockAssistantEngine.ts` already uses for `converse()` (regex-keyed rules producing scripted responses, [13_Technical_Architecture.md](13_Technical_Architecture.md) §7) — extended with a rule set for `extract()` that recognizes common phrasings ("X is due on/every N", "remind me to X", "buy X and Y", "I have a Y in N days") and produces plausible `StructuredCapture` values with a synthetic confidence score. This is enough to build and fully test the confirmation UI, the per-domain routing, and every UX flow in doc 35 without a real model call — exactly the same "build the interface, mock the implementation, swap later" approach already proven across every other part of LifyQ.

## 6. Security Posture

AI calls follow the same forward-declared posture as every other future integration ([17_Security_Plan.md](17_Security_Plan.md) §6): once a real provider exists, calls are proxied through a server-side function, never made directly from the browser with an embedded API key, and any user content sent to a provider is scoped to what extraction actually requires. RLS-backed user isolation (docs/17 §4) applies identically to AI-originated writes as to manually-entered ones, since — per §2 above — they use the exact same mutation path.

## 7. Architecture & Scalability Impact

- **No existing repository, hook, or component changes.** ICE is purely additive: a new input layer that terminates at the same mutation hooks every existing form already calls (§2–3). The eighteen months of domain work already built (docs/30–33) required zero modification to support this.
- **Adding a new domain remains a closed, well-defined task.** A future pillar still needs the same repository/types/schema/hooks/components shape every domain already follows ([13_Technical_Architecture.md](13_Technical_Architecture.md) §10.2); the only ICE-specific addition is one entry in doc 35's domain routing table (§5) and one Zod schema reuse (§3) — not a new capture UI.
- **Swapping AI providers is a config change**, identical in kind to swapping `VITE_DATA_SOURCE` from mock to Supabase. No UI, routing, or confirmation-flow code depends on which provider is active.
- **Two AI "jobs" (`converse`, `extract`) can be served by different providers or models** without affecting each other — e.g., a cheaper/faster model for structured extraction and a more capable one for open-ended conversation — since both are just methods on the same interface, called independently.
- **The confirm-before-save law is structurally impossible to bypass**, not just policy: there is no mutation call anywhere in the ICE code path (§2), so a future engineer cannot accidentally wire up silent auto-save without visibly adding a new call site that a review would catch.
