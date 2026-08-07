# 07 — Feature Roadmap

This roadmap sequences all 15 pillars (plus system features) across phases. It is the source of truth for "when does X get built," referenced by [22_MVP_Definition.md](22_MVP_Definition.md) and [23_Development_Roadmap.md](23_Development_Roadmap.md). This document sequences *what*; 23 sequences *how* (sprints/milestones).

## Phase 0 — Foundation (pre-feature)
Design system, component library, navigation shell, mock-data architecture, theming (light/dark). No user-facing domain yet. Output: an empty but fully-styled, fully-responsive app shell.

## Phase 1 — MVP Core Loop (frontend, mock data)
The domains that make LifyQ usable as a daily driver on day one, chosen because together they form a complete plan → act → reflect loop without requiring Finance or Health depth:

- Dashboard / Home
- AI Assistant (UI shell, scripted responses)
- Tasks
- Goals
- Habits
- Calendar
- Notes
- Onboarding
- Settings (Profile, Appearance, Notifications-prefs, Subscription-stub)

**Rationale:** These seven domains cover intent (Goals), execution (Tasks, Projects-lite via Task grouping), time (Calendar), consistency (Habits), and capture (Notes) — the core "operating system" promise — without the added complexity of financial or health data sensitivity, which benefits from more design/legal care before shipping. See [22_MVP_Definition.md](22_MVP_Definition.md) for the full justification.

## Phase 2 — Life Administration (frontend, mock data)
- Projects (promoted from "Task grouping" to a full domain with its own board view)
- Finance (Overview, Transactions, Budgets)
- Bills (recurring/one-time household bills, due dates, payment history)
- Subscriptions (recurring paid services, renewal tracking, cost tracking)
- Life Records (expiring personal records — passports, licenses, IDs, insurance, memberships)
- Documents (secure file vault — promoted from Phase 3, see rationale below)
- Grocery Lists (multi-list shopping, category grouping)
- Journal
- Reminders (standalone, beyond task/habit-attached reminders — becomes the user-facing surface of the shared Reminder Engine, [13_Technical_Architecture.md](13_Technical_Architecture.md) §10)

**Rationale:** This phase deepens the "plan → act" loop (Projects) and expands LifyQ from a productivity tool into a life-management platform — the household-administration cluster (Bills, Subscriptions, Life Records, Documents, Grocery Lists) added alongside the originally-planned consolidation domains (Finance, Journal). **Documents moves from Phase 3 to Phase 2** in this revision: Life Records and Bills both need file attachment (a passport photo, a receipt), so the shared storage module must exist before the modules that depend on it — sequencing it after them, as originally planned, would have forced a rework.

## Phase 3 — Insight & Wellness Layer (frontend, mock data)
- Health (Medicines, Prescriptions, Vaccinations, Doctor Visits, Allergies, Vitals — expanded from the original Sleep/Activity/Mood scope)
- Analytics (cross-domain insight, depends on Phase 1 + 2 domains existing to have something to analyze)

**Rationale:** Analytics is deliberately sequenced last among frontend phases because it aggregates data from every other domain — building it earlier would mean designing against incomplete data shapes. Health stays in Phase 3 (not pulled into Phase 2 with the other administrative modules) because it depends on Documents (Phase 2) for attaching prescription/record photos, and because it's closer in kind to Analytics — ongoing tracking and insight — than to the one-time-setup administrative modules around it.

## Phase 3.5 — AI-First Platform Redesign (frontend, mock data — documentation and design finalized now; build follows)
- **Intelligent Capture Engine (ICE)** — the shared, provider-agnostic capture pipeline every input source routes through ([35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md))
- **Jarvis** — the conversational assistant, evolved from the Phase 1 AI Assistant into ICE's conversational front door and the app's primary experience, not a peer pillar ([34_AI_Architecture.md](34_AI_Architecture.md))
- **`AIProvider` abstraction** — one interface (`converse`/`extract`) served by `MockICEEngine` this phase, swappable for a real vendor later with no UI change ([34_AI_Architecture.md](34_AI_Architecture.md) §1, §5)
- **The Relationship Graph and Context Engine** — the formalized cross-domain relationship model and the runtime layer that reasons over it to answer questions no single module could ("which medicines expire before my appointment") — a data-model-level and a query-time concern, deliberately kept as two distinct layers rather than one new subsystem ([38_Context_Engine.md](38_Context_Engine.md))
- **Dashboard redesign** from module-centric feature grid to a single urgency-sorted daily briefing that *is* Jarvis's voice, not a separate screen from it ([37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md))
- **UX philosophy shift** — Jarvis-primary with modules as destinations (not conversation-alongside-forms), progressive disclosure, confirm-before-save as an app-wide law ([36_UX_Philosophy.md](36_UX_Philosophy.md))

**Rationale:** This phase is numbered 3.5, not folded into Phase 3 or deferred to Phase 4, because it's neither a new domain (like Phase 3's Health/Analytics) nor backend plumbing (Phase 4) — it's a repositioning of *how every existing and future domain is reached and reasoned about*, which has to be settled before backend/database work begins so those decisions don't get made twice. **This documentation pass (docs 01, 06, 07, 34, 35, 36, 37, 38) constitutes the "finalize vision/UX/flows/AI model/IA/design system/module relationships" step required by Sequencing Rule #8 below** — ICE, Jarvis, and the Context Engine's actual frontend build-out (against mock implementations, per docs/01 §5) is scheduled after this pass, still ahead of Phase 4, still no real backend or real AI provider involved.

## Phase 4 — Real Backend Integration
- Supabase-backed authentication (replacing mock session)
- Real persistence for all Phase 1–3.5 domains via repository-pattern swap (see [13_Technical_Architecture.md](13_Technical_Architecture.md)) — this now includes ICE/Jarvis's confirmed-capture writes, which use the identical mutation path as every manually-entered write (docs/34 §2), so no separate backend design is needed for AI-originated data
- Real Cloud Sync
- Notifications (real delivery: in-app + push/email groundwork)

**Rationale:** Backend integration happens once, across all domains simultaneously, rather than domain-by-domain — the repository pattern makes this a swap, not fifteen separate integration projects. Phase 3.5 being finalized first means this phase's database schema and API contracts are designed against a settled product shape, not a moving target.

## Phase 5 — Commercial Layer
- Real Premium Subscription (Stripe Billing integration)
- Enforced free-tier limits
- Real AI provider integration — implementing `AIProvider` (docs/34 §1) against a real vendor (OpenAI, Anthropic, Gemini, Ollama, Azure OpenAI, or a local model), proxied through a server-side function per [17_Security_Plan.md](17_Security_Plan.md) §6, behind the exact interface Phase 3.5 already finalized and Phase 3.5's frontend already built against

## Phase 6 — Native Mobile
- Capacitor wrap of the existing responsive web app
- Native-only affordances where warranted (push notifications, biometric unlock, home-screen widgets) added as progressive enhancements, not architecture changes

## Feature-to-Phase Summary Table

| Pillar | Phase | Status this engagement |
|---|---|---|
| Dashboard | 1 | Built (module-centric shape); redesign documented for Phase 3.5, not yet built — see [docs/37](37_Dashboard_Design_Philosophy.md) |
| Jarvis (AI Assistant) | 1 → 3.5 | Built — Phase 3.5 scope (primary experience, `AIProvider`, capture pipeline) live-QA'd, see [docs/39](39_Phase3_5_Build_Summary.md); floating-companion UX (center nav button, persistent chat head, Voice Mode) live-QA'd, see [docs/40](40_Jarvis_Floating_Companion.md); streaming, full-screen mode, and page-context awareness live-QA'd, see [docs/41](41_Jarvis_KURAMA_Parity.md) |
| Tasks | 1 | Build now |
| Goals | 1 | Build now |
| Habits | 1 | Build now |
| Calendar | 1 | Build now |
| Notes | 1 | Build now |
| Onboarding & Settings | 1 | Build now |
| Projects | 2 | Build now |
| Finance | 2 | Build now |
| Bills | 2 | Build now |
| Subscriptions | 2 | Build now |
| Life Records | 2 | Build now |
| Documents | 2 | Build now |
| Grocery Lists | 2 | Build now |
| Journal | 2 | Build now |
| Reminders | 2 | Build now |
| Health | 3 | Build now (built ahead of sequence alongside Phase 2's household-admin cluster — see [docs/31](31_Life_Management_Expansion.md)) |
| Analytics | 3 | Build now |
| Intelligent Capture Engine (ICE) | 3.5 | Built — 6 domains wired (task, bill, reminder, health-medicine, finance-transaction, grocery-list-item) against `MockICEEngine`, live-QA'd; remaining ~12 domains are the same mechanical pattern, not built yet — see [docs/39](39_Phase3_5_Build_Summary.md) |
| Relationship Graph & Context Engine | 3.5 | Built — 4 inferred relationships wired against `MockContextEngine`, live-QA'd; see [docs/39](39_Phase3_5_Build_Summary.md) |
| Cloud Sync | 4 | UI affordance stub only |
| Notifications | 4 | UI affordance stub only |
| Premium Subscription | 5 | UI affordance stub only |

## Non-Negotiable Sequencing Rules

1. Design system and navigation shell (Phase 0) must be complete and stable before any domain UI is built — every domain consumes the same primitives.
2. No domain UI is built against ad-hoc inline data — every domain, even Phase 1 ones, is built against a typed mock-repository from day one (see [16_Data_Model_Plan.md](16_Data_Model_Plan.md)), so Phase 4's backend swap never requires UI rework.
3. Analytics is never built before at least two data-generating domains exist with enough shape to aggregate meaningfully.
4. Monetization UI (paywalls, upgrade prompts) is introduced visually in Phase 1 (per [21_Monetization_Strategy.md](21_Monetization_Strategy.md)) even though it has no real enforcement until Phase 5 — this validates the UX of limits early.
5. Documents ships before any module that needs to attach a file to a record (Life Records, Bills, Health) — the shared storage layer exists first, not last.
6. Every domain module, regardless of when it ships, implements the identical repository/types/schema/hooks/components structure documented in [13_Technical_Architecture.md](13_Technical_Architecture.md) and [16_Data_Model_Plan.md](16_Data_Model_Plan.md) — no domain gets bespoke architecture, including the Life Records/Bills/Subscriptions/Documents/Health/Grocery Lists additions in this revision.
7. Every domain integrates with the same six shared systems — Dashboard, Reminder Engine, Calendar, Notifications, Search, AI Engine — rather than building its own version of any of them. See [02_Product_Requirements_Document.md](02_Product_Requirements_Document.md) §3.17.
8. **Product vision, UX, user flows, AI interaction model, information architecture, design-system implications, and module relationships for any AI-first capability (ICE/Jarvis, docs 01/06/34/35/36/37) are finalized before any database schema, backend service, or API contract is designed for it** — Phase 3.5 exists specifically to be this finalization step ahead of Phase 4, so technical decisions never constrain the product experience prematurely. This rule generalizes beyond ICE: any future capability with comparable product-shape ambiguity gets the same documentation-before-backend treatment.
