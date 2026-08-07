# 38 — Context Engine (and the Relationship Graph it reasons over)

This document specifies how Jarvis answers questions that span more than one domain — "Which medicines expire before my doctor's appointment?", "Can I safely cancel any subscriptions this month?" — without the user ever naming a module. It also records the architecture decision behind *why* this is modeled as two separate, smaller concepts rather than one large new subsystem. Read [01_Product_Vision.md](01_Product_Vision.md) §7 and [34_AI_Architecture.md](34_AI_Architecture.md) first if you haven't; this document assumes ICE and the `AIProvider` abstraction as given.

## 0. Architecture Decision: Two Layers, Not One

Three names were on the table: **Personal Knowledge Graph**, **Context Engine**, **Memory Layer**. None of the three, taken alone, is the right container for what's actually needed — the request bundles two genuinely different concerns that deserve separate architecture:

1. **What relates to what** — a data-model question ("a Bill's category can match a Budget's category"; "a Medicine can be tied to a HealthEvent"). This is structural, mostly static, and belongs at the same layer as every other entity relationship LifyQ already has.
2. **How a question gets answered** — a runtime question ("given 'which medicines expire before my appointment,' fetch the right Medicines, fetch the right upcoming HealthEvent, compare dates, phrase a sentence"). This is computation that happens *at query time*, using #1 as an input, not a fact stored anywhere.

Collapsing both into one "Knowledge Graph" or one "Context Engine" blurs a seam worth keeping distinct — so the recommendation is **both**, cleanly separated:

- **The Relationship Graph** — the data-model layer, §1.
- **The Context Engine** — the runtime reasoning layer, §2–5.

### Why not "Personal Knowledge Graph"

The name is accurate in spirit — LifyQ's entities genuinely form a graph (docs/06 §4 already describes one) — but as an *architecture* decision, "Knowledge Graph" carries a specific, heavier implication: a dedicated graph-shaped storage engine (a property-graph database like Neo4j, or an RDF/triple-store with its own query language), with edges as first-class stored records and graph-traversal algorithms as a core capability. LifyQ has already committed to normalized Postgres tables mapping 1:1 to typed repositories ([13_Technical_Architecture.md](13_Technical_Architecture.md) §6) — a second, differently-shaped persistence engine running alongside it would be a real architectural fork, not a documentation decision, and it isn't needed: every relationship in the user's five examples is expressible as a typed reference between two rows in two existing tables (§1), which is exactly what the app already does for Notes, Documents, Journal, and Reminders (`EntityRef`, [16_Data_Model_Plan.md](16_Data_Model_Plan.md)). The instinct behind "knowledge graph" — that relationships between entities matter and should be explicit — is correct and is exactly what §1 formalizes. The specific term is what's declined, because it would commit the project to infrastructure it doesn't need.

### Why not "Memory Layer"

In AI-application architecture, "memory" is an established term with a specific, different meaning: an assistant's recall of *past interaction* — prior conversation turns, stated preferences ("I prefer paying bills a week early"), corrections the user has made before. That is a real, legitimate future capability for Jarvis, and a smaller one than what's being asked here — but it is not what "which medicines expire before my appointment" needs. That question is answered entirely from data LifyQ already has stored *right now* (Medicines, HealthEvents), joined at query time. Naming this capability "Memory Layer" would misdescribe it today and collide with the real memory layer if/when LifyQ builds one later (flagged as future scope in §6). The Context Engine (§2) is the correct name for "reason over what's already stored"; a Memory Layer, if built later, would be the correct name for "recall what was previously said."

### Why "Context Engine" is the right name for the runtime layer

This maps onto an established, well-understood pattern in AI-application engineering: retrieval-and-synthesis (the same shape as "RAG" — retrieval-augmented generation) — given a question, retrieve the specific structured data that's relevant, then hand that assembled context to the language layer to phrase an answer, rather than asking the model to know everything unprompted. §3 specifies this pipeline concretely. It's also a natural pairing with the name already chosen for the write path: **ICE turns unstructured input into structured writes; the Context Engine turns structured data into contextual answers.** Together they're the two halves of what makes Jarvis feel like it "already understands your life," per docs/01 §7.

## 1. The Relationship Graph

An explicit, typed set of relationships between entities — formalizing and extending what [06_Information_Architecture.md](06_Information_Architecture.md) §4 already documents conceptually, and what `EntityRef` ([16_Data_Model_Plan.md](16_Data_Model_Plan.md)) already implements structurally for Notes/Documents/Journal/Reminders. Two kinds of relationship exist, and the distinction matters:

- **Structural relationships** — stored as an explicit foreign-key-style reference, exactly like `EntityRef` today. Example: a Task's `projectId`, a Document's `linkedEntities`. These are *facts the user or the app declared* — "this task belongs to this project" is stored, not inferred.
- **Inferred relationships** — never stored anywhere; computed by the Context Engine at query time by comparing attributes across two domains that have no direct link. Example: "this medicine expires before that appointment" — nobody ever links a specific Medicine row to a specific HealthEvent row; the relationship exists only because their dates happen to compare a certain way *when asked*.

Both kinds are declared in one place — an extended version of docs/06 §4's table — so it's always clear, for any pair of domains, whether their relationship is a stored edge or a computed one:

| From | To | Kind | Basis |
|---|---|---|---|
| Bill | Budget | Inferred | `Bill.category` matches `Budget.category` |
| Subscription | Transaction (Finance) | Inferred | A Subscription's `cost`/`billingCycle` compared against matching-category `Transaction` history — see §6's limitation note |
| Medicine | HealthEvent (doctor visit) | Inferred | `Medicine.expiresAt` compared against upcoming `HealthEvent.date` where `type` indicates an appointment |
| Life Record (passport) | Calendar Event | Inferred | `LifeRecord.expiresAt` compared against `CalendarEvent.date` — see §6 on why this stands in for "future travel" |
| Project | Task | Structural | Existing `taskIds[]` on Project (already built, docs/32) |
| Task / Event / Habit | Note, Journal Entry, Document | Structural | Existing `EntityRef` (already built) |
| Life Record / Bill / Subscription / Medicine | Reminder | Structural | Existing Reminder Engine registration ([13_Technical_Architecture.md](13_Technical_Architecture.md) §10) |

New rows are added here exactly when a new relationship is worth answering questions about — this table, not a new storage engine, is "the graph." No new entity type is introduced for it; it's documentation plus (where structural) fields that already exist or follow the exact `EntityRef` pattern already established.

## 2. The Context Engine — Pipeline

```
User question (via Jarvis's converse())
  → Query Classification: single-domain, or cross-domain?
  → [cross-domain only] Relationship Resolution: which domain pairs does this question touch? (§1's table)
  → Data Retrieval: fetch the relevant rows from each touched domain's existing repository — read-only, no new repository
  → Derived-Fact Computation: joins/comparisons the retrieval alone doesn't answer (date proximity, category matching, sum-and-compare)
  → Context Assembly: the computed facts + retrieved rows, structured for the language layer
  → AIProvider synthesis: converse()'s underlying provider phrases the final answer from assembled context
```

**Single-domain questions bypass Relationship Resolution and Derived-Fact Computation entirely** — "What's on my plate today?" still resolves as it already does today (`mockAssistantEngine.ts`'s existing per-domain `describeX()` pattern, unchanged). The Context Engine only activates its cross-domain machinery when Query Classification detects a question actually needs it — this keeps every already-built single-domain answer exactly as fast and as simple as it is today; nothing is routed through unnecessary machinery.

**Query Classification** is pattern-based in the mock phase (§4), the same technique already used for every other mock decision in this codebase — recognizing phrasing that implies two domains ("X before Y", "can I cancel", "relate to", a question naming two domain-shaped nouns) rather than true semantic understanding, which arrives with a real provider (Phase 5).

## 3. Worked Examples

Each of the five questions from the brief, traced through the pipeline:

1. **"When does my passport expire?"** — single-domain (Life Records). No Context Engine needed; existing `describeLifeRecords`-style lookup answers it directly.
2. **"What bills are due this week?"** — single-domain (Bills). Same as above, already built.
3. **"Which medicines expire before my doctor's appointment?"** — cross-domain: Medicine × HealthEvent. Retrieval: all medicines with `expiresAt` set; the next upcoming HealthEvent classified as an appointment. Derived-fact computation: filter medicines where `expiresAt < appointment.date`. Synthesis: "Your amoxicillin expires June 3rd, before your dentist appointment on June 10th."
4. **"What should I finish today?"** — cross-domain: Task × Calendar (free-time awareness) × Goal (priority weighting). Retrieval: today's incomplete tasks, today's calendar load, active goals' linked tasks. Derived-fact computation: tasks linked to an active goal, or with a due date of today, ranked above tasks with neither. Synthesis is a short prioritized list, not a raw task dump.
5. **"Can I safely cancel any subscriptions this month?"** — cross-domain: Subscription × Transaction × Budget, **with an honest gap** — see §6. The Context Engine can confidently answer the *financial* half (which subscriptions' cost would meaningfully help an over-budget category if cancelled) but not the *usage* half ("safely" implies "will you miss it," which needs data LifyQ doesn't currently model).

## 4. Mock-Phase Implementation

Per [01_Product_Vision.md](01_Product_Vision.md) §5, no real provider exists this phase. `MockContextEngine` extends the same deterministic-rules technique `mockAssistantEngine.ts` already uses, generalized from "each rule reads one repository" to "some rules read two repositories and compute a comparison" — architecturally the same kind of function (`describeX(): Promise<string>`), just with more than one repository read inside it and a join/filter step before formatting the response. This is enough to build and test the full pipeline (§2) and every worked example (§3) end-to-end without a real model call, exactly like every other mock-then-real capability in this codebase.

## 5. UX: Showing the Work

Per [36_UX_Philosophy.md](36_UX_Philosophy.md) §4 (trust through transparency), a cross-domain answer states which domains it drew from, briefly — not a debug trace, one clause: *"Checking your medicines against your upcoming appointments — ..."*. This does two things: it keeps Jarvis's routing legible (the same principle already applied to ICE's confirmation screens, [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §7), and it lets a user immediately spot a wrong join (e.g., if it compared against the wrong appointment) rather than silently trusting a possibly-wrong synthesized answer.

## 6. Known Gap, Stated Honestly

**"Can I safely cancel any subscriptions this month?" cannot be fully answered by data LifyQ currently models.** The Context Engine can compare a subscription's cost against budget/spending impact (Subscription × Transaction × Budget, all existing data), but "safely" implies *usage* — will the person miss it — and no existing entity tracks last-used, open-frequency, or any engagement signal for a Subscription. Two honest options, neither built now:
- Answer the financial half only, and say so explicitly ("Netflix costs $15/mo and isn't pushing any budget over — I don't know how often you use it, though").
- Add a `lastUsedAt`/engagement field to `Subscription` in a future data-model revision, if this question turns out to matter enough to justify tracking it.

This gap is recorded here rather than silently papered over with a guess, consistent with docs/01 §6's "not an autonomous agent" guardrail — the Context Engine should say what it doesn't know, not fabricate confidence.

**Similarly, "Passport ↔ future travel" (§1) is represented as Life Record ↔ Calendar Event, not Life Record ↔ Travel**, because Travel is explicitly not a modeled domain (docs/01 §3: "raised and deliberately deferred"). A calendar event happening to be a trip is inferred the same way any other event is — LifyQ cannot currently distinguish a "travel" calendar event from any other kind. If Travel is ever added as a real pillar, this relationship is upgraded to a direct one at that point; until then, this is the honest, currently-buildable version of the requested relationship.

## 7. Architecture and Scalability Impact

- **No new persistence engine.** The Relationship Graph is documentation plus existing/`EntityRef`-shaped fields — it does not require a graph database, does not conflict with the Postgres/RLS architecture already committed for Phase 4 ([13_Technical_Architecture.md](13_Technical_Architecture.md) §6), and needs no new migration category beyond what any new field already requires.
- **No new repository.** The Context Engine reads existing repositories exactly as `mockAssistantEngine.ts` already does (docs/13 §7's cross-feature exception) — it adds a computation step between reads and the response, not a new data source.
- **Adding a new inferred relationship is a documentation change plus one new rule function** — one row in §1's table, one `describeX×Y()`-shaped function in the mock engine (real-provider phase: one addition to whatever retrieval instructions the real provider is given) — not a schema migration.
- **Query Classification is the one piece that meaningfully improves with a real provider** (§2) — the mock phase's pattern-matching classification is a known, stated approximation, exactly like every other mock decision in this codebase, and is expected to become materially more capable (true intent understanding, not phrase-matching) once Phase 5's real `AIProvider` is live, with zero change to the pipeline shape around it.
