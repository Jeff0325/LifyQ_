# 02 — Product Requirements Document (PRD)

## 1. Purpose

This PRD defines what is being built in the current phase — a mock-data, frontend-only implementation of LifyQ — at the requirement level, so design and engineering share one source of truth. It complements [01_Product_Vision.md](01_Product_Vision.md) (why) with the what.

## 2. Scope of This Phase

**In scope:** Full UI/UX for the MVP domain set (defined in [22_MVP_Definition.md](22_MVP_Definition.md)), running entirely on a mock data layer, deployed as a live, navigable, responsive web application.

**Explicitly out of scope for this phase:**
- Real authentication or account creation
- A real database or persistence beyond the browser (localStorage is permitted for session-like continuity, not as "the database")
- Any network calls to real third-party services
- Real AI provider calls (Jarvis and the Intelligent Capture Engine — §3.0 — are fully built and usable this phase; their understanding comes from a deterministic mock provider, not a real LLM — see [34_AI_Architecture.md](34_AI_Architecture.md) §5)
- Payment processing of any kind
- Native mobile builds (Capacitor is planned but not executed this phase)
- Multi-user or collaboration features

## 3. Functional Requirements by Domain

Each domain below lists the minimum functional surface required for that domain's UI to be considered complete. Domains marked **(MVP)** are built in the current phase; others are designed at the information-architecture level now (so navigation and data models anticipate them) but not built until the phase defined in [07_Feature_Roadmap.md](07_Feature_Roadmap.md).

### 3.0 Intelligent Capture Engine — ICE (MVP, cross-cutting)
Full specification in [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md); this is the requirement-level summary.
- A capture entry point reachable from anywhere in the app (global, not per-domain), accepting typed text, pasted/shared text, and browser-native voice input (Web Speech API — real speech-to-text, not a mocked capability, per doc 35 §2) as fully functional sources this phase; camera OCR, image, PDF, and email capture are UI-stubbed entry points (visible, reachable, non-functional understanding — same posture already established for Cloud Sync, §3.18)
- Every source produces the same normalized structured-output shape (`StructuredCapture`, [34_AI_Architecture.md](34_AI_Architecture.md) §4) regardless of origin
- **Never auto-saves.** Every capture — regardless of source or confidence — surfaces a confirmation screen, pre-filled and fully editable, before anything reaches a repository. This is a hard requirement, not a UX preference: see [34_AI_Architecture.md](34_AI_Architecture.md) §2
- Routes to any existing domain (Tasks, Goals, Habits, Calendar, Bills, Subscriptions, Life Records, Reminders, Grocery Lists, Finance, Journal, Health, Projects, Notes, Documents) per the routing table in doc 35 §5 — reuses each domain's existing create/edit Zod schema and mutation hook; no new repository is introduced for ICE
- One capture can produce multiple proposals (e.g., "buy coffee and chicken tomorrow" → two grocery items); the confirmation UI presents these as an independently-confirmable batch, not a single merged form
- Below-threshold-confidence captures produce a clarifying question in the Jarvis conversation instead of a low-quality proposal

### 3.0a Context Engine (MVP, cross-cutting)
Full specification in [38_Context_Engine.md](38_Context_Engine.md); this is the requirement-level summary. This is ICE's counterpart on the read side — §3.0 turns language into structured writes, this turns a question into a synthesized answer drawn from more than one domain.
- The user can ask a question naming no module and get a correct, synthesized answer when the question genuinely spans domains (e.g., "Which medicines expire before my doctor's appointment?", "Can I safely cancel any subscriptions this month?") — full example set in doc 38 §3
- Answered via a **Relationship Graph** (doc 38 §1) — a formalized, typed record of which domains relate to which, extending the existing `EntityRef` pattern; and a **Context Engine** (doc 38 §2) — a runtime pipeline that classifies a question, resolves which relationships it touches, retrieves and joins the relevant data, computes any derived comparison, and hands the assembled result to `AIProvider.converse()` for final phrasing
- **Not** implemented as a graph database or a conversational-memory system — see doc 38 §0 for why those were considered and declined in favor of this two-layer model
- Single-domain questions are unaffected — they continue to answer exactly as they do today, without the added Context Engine steps (doc 38 §2)
- States which domains it drew from before giving a cross-domain answer, never presenting a synthesized answer as simply, invisibly correct (docs/36 §4)
- Honestly declines to answer, or partially answers and says so, when the question needs data LifyQ doesn't model (e.g., "safely cancel" implying usage data no entity currently tracks — doc 38 §6) rather than guessing

### 3.1 Jarvis — the Conversational Assistant (MVP)
Renamed from "AI Assistant" to reflect the AI-first repositioning ([01_Product_Vision.md](01_Product_Vision.md) §7) — same underlying feature, expanded scope.
- Persistent entry point (global command surface + dedicated full-screen chat view at `/assistant`)
- Conversation thread UI with user/assistant message bubbles, streaming-style reveal animation
- Suggested prompt chips for empty state
- Ability to reference other domains in responses (e.g., "You have 3 tasks due today") using mock data joins
- **Two distinct jobs, one interface** ([34_AI_Architecture.md](34_AI_Architecture.md) §1): open-ended conversation/summary (`AIProvider.converse()` — "What's on my plate today?") and structured capture (`AIProvider.extract()` — "Buy coffee and chicken tomorrow," which produces a confirmable proposal per §3.0 rather than a chat reply)
- Understands relative dates, recurrence phrasing, and in-thread follow-up/context for a still-pending (unconfirmed) capture (doc 35 §4)
- Cannot actually call a real LLM this phase; both jobs are served by `MockICEEngine`, a deterministic pattern-matching provider ([34_AI_Architecture.md](34_AI_Architecture.md) §5) — architecturally identical in kind to how every other mock repository in this phase stands in for a real backend

### 3.2 Dashboard / Home (MVP; redesign target documented, not yet built)
- Personalized greeting (time-of-day aware)
- Current shipped shape: per-domain summary cards (today's tasks, active goals progress, habit streaks, upcoming calendar events, plus the life-admin/planning/analytics overview rows added in docs/31–33)
- **Target shape** ([37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md)): an urgency-sorted feed answering "what do I need to know and do right now," with the current per-domain cards moved to a progressive-disclosure layer rather than removed — sequenced as future build work, not part of this documentation revision
- Quick-add entry point, now understood as the ICE capture surface (§3.0) rather than a lightweight tasks/notes/reminders-only parser
- Empty state for a brand-new user (see [05_User_Journeys.md](05_User_Journeys.md))

### 3.3 Tasks (MVP)
- List view and board (kanban) view, toggleable
- Create/edit/delete/complete task (mock persistence, in-memory + localStorage)
- Priority, due date, tags, project association, subtasks
- Filter and sort (by due date, priority, project, status)
- Bulk actions (multi-select complete/delete)

### 3.4 Goals (MVP)
- Goal cards with progress indicator (derived from linked tasks/projects/habits)
- Create/edit goal with target date, category, milestone breakdown
- Goal detail view showing linked projects, tasks, and habits

### 3.5 Habits (MVP)
- Daily/weekly habit list with check-off interaction
- Streak counter and visual streak calendar (heatmap)
- Create/edit habit with frequency and reminder time
- Habit detail view with historical completion chart

### 3.6 Calendar (MVP)
- Month, week, and day views
- Unified rendering of events, task due dates, habit reminders
- Create/edit event (title, time, location, linked entities)
- Responsive agenda-list mode for mobile

### 3.7 Notes (MVP)
- List/grid of notes with search
- Rich-text-style note editor (formatting toolbar, mock persistence)
- Tagging and folder/notebook organization
- Linking a note to a task, goal, or project

### 3.8 Settings (MVP)
- Profile (mock, editable, not persisted to any backend)
- Appearance (theme: light/dark/system, density)
- Notification preferences (UI only)
- Subscription/plan management screen (mock — see [21_Monetization_Strategy.md](21_Monetization_Strategy.md))
- Data & privacy panel (placeholder for future export/delete, states the mock-data disclaimer)

### 3.9 Onboarding (MVP)
- Welcome sequence introducing the concept
- Lightweight preference capture (which domains matter to the user) that personalizes the initial Dashboard mock data
- Skippable at every step

### 3.10 Life Records (Post-MVP, IA-planned, Phase 2)
Personal records that carry an expiration or renewal date and need future attention — passports, driver's licenses, national IDs, vehicle registration, insurance policies, membership cards, bank cards, professional licenses, visas.
- Store record metadata (type, number/identifier, issue date, expiration date, issuing authority)
- Attach a photo or document to each record (via the Documents module, §3.13)
- Automatic reminder generation as expiration approaches (via the Reminder Engine, [13_Technical_Architecture.md](13_Technical_Architecture.md) §10)
- Searchable, filterable by record type and expiration window

### 3.11 Bills (Post-MVP, IA-planned, Phase 2)
Recurring and one-time household bills — electricity, water, internet, mobile, rent, mortgage.
- Due dates, recurring schedule (weekly/monthly/yearly/one-time)
- Paid/unpaid history per bill
- Reminder automation ahead of the due date
- Feeds a Dashboard summary card (upcoming + overdue bills)

### 3.12 Subscriptions (Post-MVP, IA-planned, Phase 2)
Recurring paid services — Netflix, Spotify, ChatGPT, Claude, domains, hosting, Microsoft 365, and similar.
- Monthly or yearly billing cycle, cost tracking
- Renewal reminders ahead of the next charge
- Dashboard summary card (total recurring spend, upcoming renewals)

### 3.13 Documents (Post-MVP, IA-planned, Phase 2)
A secure, searchable vault for receipts, contracts, invoices, tax files, certificates, and school records — and the shared attachment layer Life Records, Bills, and Health entries build on.
- Upload and store files (mock: object URL, per [16_Data_Model_Plan.md](16_Data_Model_Plan.md))
- OCR-ready field (text extraction is a Phase 4+ real-backend concern; the field exists now so the UI never needs rework)
- Tags and categories, full-text search
- Attach a document to any other entity (task, goal, life record, bill, health record, ...) via the same `EntityRef` link already used by Notes

### 3.14 Health (Post-MVP, IA-planned, Phase 3)
Personal health records — medicines, prescriptions, vaccinations, doctor visits, allergies, blood pressure, and weight.
- Medicine expiration tracking
- Prescription reminders (dosage schedule)
- Appointment reminders (doctor visits, vaccination boosters)
- Vitals logging (blood pressure, weight) over time

### 3.15 Grocery Lists (Post-MVP, IA-planned, Phase 2)
Smart shopping lists.
- Multiple concurrent lists, category grouping within a list
- Voice- and text-generated list items via ICE ("buy coffee and chicken tomorrow" — §3.0), functional this phase against the mock provider; this supersedes the earlier "Phase 5" framing now that ICE ships in the current phase — no separate integration was ever needed, since it's the same `AIProvider` interface every domain routes through
- Reminder integration (e.g., a standing weekly reminder to review the list)

### 3.16 Finance, Journal, Projects, Notifications, Analytics (Post-MVP, IA-planned)
- Full requirements deferred to the phase in which each is built; each already has a reserved place in [06_Information_Architecture.md](06_Information_Architecture.md) and a data shape in [16_Data_Model_Plan.md](16_Data_Model_Plan.md) so their eventual addition requires no structural rework.

### 3.17 Cross-Cutting Integration Requirements (applies to every Phase 2+ module)
Every domain module — existing and new — integrates with the same six shared systems rather than inventing its own:
- **Dashboard** — a summary card/tile, following the existing `DailyOverview`/`*ProgressCard` pattern
- **Reminder Engine** — any entity with a future-relevant date (expiration, due date, renewal, appointment) registers into it rather than managing its own scheduling; see [13_Technical_Architecture.md](13_Technical_Architecture.md) §10
- **Calendar** — reminder-generating entities surface on the Calendar the same way Task due dates and Habit reminder times already do
- **Notifications** — the Reminder Engine's output is what the Notifications Inbox displays; no module talks to Notifications directly
- **Search** — every entity is indexed by the Global Search / Command Palette ([06_Information_Architecture.md](06_Information_Architecture.md) §5); no per-module search UI
- **AI Engine (ICE / Jarvis / Context Engine)** — every domain's repository is a sanctioned data source `AIProvider.converse()` can query (read) and a sanctioned target `AIProvider.extract()` proposals can route to (write, always confirm-gated) — the same way Jarvis already reads Tasks/Goals/Habits/Calendar today, extended per §3.0 and [34_AI_Architecture.md](34_AI_Architecture.md) §3. Every domain is also a node in the Relationship Graph the Context Engine reasons over for cross-domain questions ([38_Context_Engine.md](38_Context_Engine.md))

New modules are **designed**, not built, to this contract now — implementation still follows [07_Feature_Roadmap.md](07_Feature_Roadmap.md)'s phase sequencing. Every new module ships with one addition to [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §5's routing table and, if it has meaningful relationships to other domains, one addition to [38_Context_Engine.md](38_Context_Engine.md) §1's relationship table — at no extra architectural cost in either case, since its existing Zod schema and mutation hook (required by every domain regardless of ICE) are all either capability ever needs.

### 3.18 Cloud Sync & Premium Subscription (Post-MVP, UI-stubbed)
- A visible "Synced" indicator and a "Upgrade to Premium" surface exist in this phase as **non-functional UI affordances** — they communicate the product's eventual shape without implying real behavior. See [21_Monetization_Strategy.md](21_Monetization_Strategy.md).

## 4. Non-Functional Requirements

| Category | Requirement | Reference |
|---|---|---|
| Performance | Lighthouse Performance ≥ 95 on key routes | [18_Performance_Strategy.md](18_Performance_Strategy.md) |
| Accessibility | WCAG 2.1 AA conformance | [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) |
| Responsiveness | Full functionality from 320px to 4K, mobile-first | [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) |
| Security (phase-appropriate) | No secrets in repo, safe coding hygiene, forward-compatible with real auth | [17_Security_Plan.md](17_Security_Plan.md) |
| Maintainability | Feature-based architecture, typed contracts, repository pattern for data | [12_Folder_Architecture.md](12_Folder_Architecture.md), [13_Technical_Architecture.md](13_Technical_Architecture.md) |
| Testability | Critical logic and flows covered by automated tests | [25_Testing_Strategy.md](25_Testing_Strategy.md) |
| Portability | Architecture must not block a future Capacitor native wrap | [13_Technical_Architecture.md](13_Technical_Architecture.md) |

## 5. Assumptions

- The team building this has senior-level React/TypeScript proficiency.
- Supabase is the intended backend when that phase begins; data contracts are shaped to map cleanly onto Postgres tables.
- The product will eventually be a paid subscription; free-tier limits should be representable in the UI now even though they are not enforced by any backend.
- Real AI integration will use an `AIProvider` implementation (OpenAI, Anthropic, Gemini, Ollama, Azure OpenAI, or a local model — [34_AI_Architecture.md](34_AI_Architecture.md) §1), selected by config, model-agnostic at every layer above the provider boundary; the mock provider is structured so a real one replaces it behind the same interface with zero UI changes.
- The product vision, UX, user flows, AI interaction model, information architecture, and module-relationship design for ICE/Jarvis (docs 01, 06, 34, 35, 36, 37) are treated as finalized inputs to any future database/backend/API design for them — not the reverse (see [07_Feature_Roadmap.md](07_Feature_Roadmap.md) Non-Negotiable Sequencing Rules #8).

## 6. Constraints

- No backend, database, authentication, or payment code is to be written in this phase (see [01_Product_Vision.md](01_Product_Vision.md) §5).
- All persisted-feeling data lives in a mock data layer (in-memory + optional localStorage), never a real API.
- Every UI decision must remain valid once real data, real auth, and real sync are introduced — no throwaway scaffolding.

## 7. Open Questions for Founder Review

These are flagged, not blocking, and are revisited in [26 — Consistency Review, see final section of this document set].

1. Should Finance and Health be pulled into MVP given how central "life management" framing makes them? Current recommendation: no — see [22_MVP_Definition.md](22_MVP_Definition.md) rationale.
2. Should the AI Assistant be a docked panel, a full page, or both? Current recommendation: both, detailed in [10_Navigation_Architecture.md](10_Navigation_Architecture.md).
3. Free tier limits are placeholders pending real usage-cost data once AI is live; treat numbers in [21_Monetization_Strategy.md](21_Monetization_Strategy.md) as directional.
4. **Resolved:** whether "Medicine" needed its own pillar — folded into the existing Health pillar (§3.14) rather than split out, since prescriptions/medicines are one part of a person's broader health record, not a separate domain.
5. **Open, deliberately not decided here:** Travel is not a pillar. It was raised during planning and explicitly deferred rather than speculatively added — no itinerary/trip data model exists. Revisit only if there's a specific reason to add it, not by default.
