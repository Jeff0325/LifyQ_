export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

/**
 * The seam Phase 5 replaces: a real vendor implementation (OpenAI,
 * Anthropic, Gemini, Ollama, Azure OpenAI, or a local model) calling a real
 * API behind this exact interface swaps in with zero changes to the chat
 * UI, the capture confirmation UI, or any domain's mutation hooks — see
 * docs/34_AI_Architecture.md §1 and docs/13_Technical_Architecture.md §7.
 *
 * Two distinct jobs, one interface: `converse` is freeform conversation
 * (Jarvis's chat surface — this is the exact same method the codebase
 * previously called `AssistantEngine.sendMessage`, renamed, same
 * signature). `extract` is structured capture (the Intelligent Capture
 * Engine, docs/35) — it never writes data itself, see `CaptureProposal`
 * below and docs/34 §2.
 */
export interface AIProvider {
  converse(thread: ChatMessage[], message: string): Promise<string>;
  extract(input: CaptureInput): Promise<StructuredCapture>;
}

/** docs/35_Intelligent_Capture_Engine_Spec.md §2 — per-source scope this phase. */
export type CaptureSourceType =
  | 'voice'
  | 'text'
  | 'ocr'
  | 'image'
  | 'pdf'
  | 'email'
  | 'shared-text'
  | 'clipboard';

export interface CaptureInput {
  sourceType: CaptureSourceType;
  /** Already normalized to plain text by the caller — docs/35 §1's "Normalization" stage. */
  text: string;
}

/**
 * Every domain ICE can route into. Extending this list is the only
 * ICE-specific step a new domain needs — see docs/35 §3 and
 * docs/02_Product_Requirements_Document.md §3.17.
 */
export type CaptureDomain =
  | 'task'
  | 'goal'
  | 'habit'
  | 'calendar-event'
  | 'note'
  | 'life-record'
  | 'bill'
  | 'subscription'
  | 'document'
  | 'grocery-list-item'
  | 'health-medicine'
  | 'health-event'
  | 'health-vital'
  | 'health-allergy'
  | 'project'
  | 'finance-transaction'
  | 'finance-budget'
  | 'journal-entry'
  | 'reminder';

/**
 * One proposed action, never applied on its own — docs/34 §2's
 * confirm-before-save principle. `fields` is intentionally untyped here;
 * it's narrowed against the target domain's own existing Zod schema by
 * `validateProposal` (src/features/assistant/ice/domainRouting.ts) before a
 * confirmation screen ever renders it.
 */
export interface CaptureProposal {
  domain: CaptureDomain;
  action: 'create' | 'update' | 'query';
  fields: Record<string, unknown>;
  confidence: number;
  /** Set instead of a low-confidence proposal — docs/35 §6. */
  clarifyingQuestion?: string;
  /** Set for 'update'/'query' once an existing entity is matched (e.g. by name). */
  entityRef?: string;
  /**
   * Which top-level `fields` keys were filled in with a schema-sensible
   * default rather than actually recognized in the input text (e.g. a
   * task's `priority` defaulting to `'none'` when nothing implied
   * otherwise). Drives the confirmation screen's low-confidence-field
   * flagging (docs/35 §7) — omitted keys are treated as confidently
   * extracted.
   */
  guessedFieldKeys?: string[];
}

export interface StructuredCapture {
  sourceType: CaptureSourceType;
  /** One utterance can yield more than one proposal — docs/35 §3. */
  proposals: CaptureProposal[];
  /** The normalized text form, kept for audit/re-edit. */
  rawInput: string;
}
