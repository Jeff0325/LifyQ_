# 01 — Product Vision

## 1. What LifyQ Is

**LifyQ is not a collection of productivity modules. LifyQ is an AI-first life operating system.**

Every domain described in this document — Tasks, Goals, Habits, Bills, Health, and the rest — still exists, and the architecture and UI built for each of them (docs/30–33) remains the permanent foundation. What changes is how a person reaches them. The default way to get something into LifyQ is no longer "open the right module and fill out the right form." It's talking to LifyQ the way you'd talk to a capable personal assistant, and letting it figure out the module, the fields, and the structure on your behalf. Manual data entry becomes the exception — available, precise, always there as a fallback — not the primary experience.

This is a change in **default interaction model**, not in domain scope. The fifteen-plus pillars in §3 are still the whole of what LifyQ organizes — but they are destinations for structured data, not the primary experience. **Jarvis is the primary experience.** A user should be able to live entirely inside a conversation with Jarvis and a daily briefing, and only ever open Tasks or Bills or Health directly when they specifically want to browse, bulk-edit, or double-check the underlying record — never because that's the only way in. §2 explains why AI-first is the right default now; §7 introduces the two platform capabilities that make this possible without throwing away anything already built: the **Intelligent Capture Engine (ICE)**, which turns what a user says into structured writes, and the **Context Engine**, which lets Jarvis reason across everything already stored to answer questions no single module could answer alone (full spec: [38_Context_Engine.md](38_Context_Engine.md)).

Most productivity software solves one slice of life — a to-do app, a budgeting app, a journal, a habit tracker — and forces the user to stitch fifteen disconnected tools together, re-entering the same context in each one, through a different form, in a different app, every time. LifyQ's premise is that life is not siloed, and neither is talking about it: a person doesn't think "I need to open the Bills app" when their electricity bill arrives — they think "the electricity bill is due on the 15th," in one sentence, the same way they'd tell a person. LifyQ is built so that sentence is enough.

## 2. Why Now

Three shifts make this the right moment for LifyQ:

1. **AI has crossed the threshold from "chatbot" to "assistant."** People no longer just want a place to store their tasks — they want something that can look at their goals, their calendar, and their energy levels and tell them what actually matters today, and that can turn a sentence spoken in passing into a correctly-filed, correctly-scheduled piece of structured data without being asked to open an app and fill in five fields. LifyQ is built AI-first from the data model up, not AI-bolted-on — see §7.
2. **Consumers now expect software-company-grade craft in every app they use**, driven by Apple, Linear, Notion, Revolut, and Arc. A cluttered, dated productivity tool is a churn risk regardless of feature depth. Design quality is now a retention feature, not a cosmetic one.
3. **Subscription fatigue has a counter-trend**: consolidation. Users are actively looking to cancel five $8/month apps in favor of one $15/month app that replaces all of them. LifyQ's cross-domain breadth is the product, not scope creep.

## 3. Product Pillars

LifyQ organizes a person's life into domains. Every domain shares one navigation shell, one design system, and one underlying data model so that switching between them feels like switching tabs in a single app, not opening a different product.

| Pillar | Purpose |
|---|---|
| Jarvis (AI Assistant) | **Not a pillar among peers — the primary experience.** The conversational surface of ICE (input) and the Context Engine (reasoning) — see §7. Listed here for navigational completeness; every other row in this table is a destination Jarvis can read from and write into, not a competing front door |
| Tasks | Discrete, actionable items with due dates, priority, and context |
| Goals | Long-horizon outcomes that tasks and projects ladder up to |
| Habits | Recurring behaviors tracked for consistency and streaks |
| Calendar | Time-based view unifying tasks, events, habits, and reminders |
| Finance | Personal budgeting, spending, and net-worth awareness |
| Bills | Recurring and one-time household bills — due dates, payment history |
| Subscriptions | Recurring paid services — renewal dates, cost tracking |
| Health | Medicines, prescriptions, vaccinations, doctor visits, allergies, and vitals (blood pressure, weight) |
| Journal | Freeform reflection, linked to date, mood, and other entities |
| Life Records | Personal records with expiration dates — passports, licenses, IDs, insurance, memberships — tracked toward renewal |
| Documents | Secure, searchable storage for receipts, contracts, invoices, and other files; the attachment layer other modules build on |
| Notes | Freeform capture and knowledge management |
| Grocery Lists | Smart shopping lists — multiple lists, categories, voice/AI-generated |
| Projects | Multi-step bodies of work that group tasks toward a goal |
| Reminders | Lightweight, time- or location-triggered nudges — the user-facing surface of the shared Reminder Engine (see [13_Technical_Architecture.md](13_Technical_Architecture.md) §10) |
| Notifications | Cross-domain alerting, digest, and delivery preferences |
| Cloud Sync | Data availability across every device, in real time |
| Analytics | Cross-domain insight into how time, money, energy, and attention are spent |
| Premium Subscription | The commercial layer that funds continued development |

Full domain sequencing and prioritization live in [07_Feature_Roadmap.md](07_Feature_Roadmap.md) and [22_MVP_Definition.md](22_MVP_Definition.md).

**Life Records, Bills, Subscriptions, and Grocery Lists** were added to this pillar set after the MVP core loop shipped, to move LifyQ from a productivity tool toward a true life-management platform — the household-administration layer that sits alongside the existing plan/act/reflect loop. **Travel is not a pillar** — it was raised and deliberately deferred rather than added speculatively; if it's wanted later, it follows the same addition process as these four.

## 4. What LifyQ Is Not

- **Not a team collaboration tool.** LifyQ is single-player by design. Multiplayer (shared households, teams) is an explicit non-goal until the core single-user experience is exceptional.
- **Not a note-taking app with extras bolted on.** Notion's model starts from documents; LifyQ starts from the person's life as structured data, with freeform notes as one domain among many.
- **Not a "quantified self" dashboard.** Analytics exist to inform decisions, not to gamify metrics for their own sake.
- **Not enterprise software.** No admin consoles, no seat management, no org charts, in this phase.

## 5. Current Phase: Frontend-Only Foundation

The present engineering objective is deliberately narrow: build a complete, production-quality **frontend** using mock data, with **no backend, no authentication, no database, no live APIs, no real AI provider calls, and no payments**. Every screen, interaction, and state (loading, empty, error, success) is designed and built as if it were talking to real systems — because the architecture is required to accept those real systems later without a rewrite.

This constraint is unchanged by the AI-first repositioning in §7. ICE and Jarvis are designed and built in this phase exactly like every other capability so far: against a **mock provider** that simulates natural-language understanding deterministically (pattern-matching, the same technique `mockAssistantEngine.ts` already uses — see [34_AI_Architecture.md](34_AI_Architecture.md) §5), not a real LLM call. What's different this time is *sequencing*, not the no-backend rule: the product vision, UX, user flows, AI interaction model, information architecture, and module-relationship design for ICE/Jarvis are finalized **before** any database schema or backend service is designed for them (see [07_Feature_Roadmap.md](07_Feature_Roadmap.md) §"Non-Negotiable Sequencing Rules" #8) — so that real-provider integration, when it arrives, is a swap behind an already-proven interface, exactly as planned for every other domain in [13_Technical_Architecture.md](13_Technical_Architecture.md) §4.

This is not a prototype or a throwaway design exercise. It is the permanent UI layer of the commercial product. See [13_Technical_Architecture.md](13_Technical_Architecture.md) for how the mock layer is built to be replaced, not discarded.

## 6. What LifyQ Is Not (continued): AI Guardrails

- **Not an autonomous agent.** ICE and Jarvis never write data on their own initiative. They understand, extract, propose, and wait. See §7 and [34_AI_Architecture.md](34_AI_Architecture.md) §2 for the confirm-before-save principle, which is a product law, not an implementation detail.
- **Not a single-vendor AI product.** No feature is allowed to depend on one AI provider's specific API shape. See [34_AI_Architecture.md](34_AI_Architecture.md) §1.
- **Not a graph-database product.** Cross-domain reasoning (§7's Context Engine) is a computation layer over LifyQ's existing relational data, not a second, differently-shaped storage engine running alongside it. See [38_Context_Engine.md](38_Context_Engine.md) §0 for why.

## 7. Flagship Capability: The Intelligent Capture Engine (ICE) and Jarvis

**ICE is not a feature. It is the central intelligence layer every source of information passes through before it reaches any domain's business logic.** Every pillar in §3 already has a repository, a set of typed fields, and a UI for creating and editing its entities by hand — none of that changes. ICE sits *in front of* that existing architecture as a new, shared input layer: it takes unstructured input (a sentence, a photo, a forwarded email, a pasted paragraph) from any supported source, understands what the user means, and produces the same normalized structured-action proposal regardless of where the input came from.

**Supported input sources** (scope per source, this phase vs. later, is detailed in [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md)):
- Voice conversations
- Typed text
- Camera OCR
- Images
- PDFs
- Emails
- Shared text from other apps
- Clipboard
- Future integrations

**Jarvis** is the conversational front door to ICE — the assistant a user talks to, in plain language, instead of hunting for the right module. Someone should be able to say *"I have a meeting in two days,"* *"Buy coffee and chicken tomorrow,"* *"My passport expires next year,"* *"Remind me to call my mother this weekend,"* or *"My electricity bill is due every 15th"* and never once think about which pillar in §3 that belongs to — Jarvis determines that, and ICE structures it.

**Jarvis also reasons across what's already stored, via the Context Engine.** ICE handles input — turning a sentence into structured data. The Context Engine handles the reverse: answering a question that needs *relationships* between things already in LifyQ, without the user naming a domain — *"Which medicines expire before my doctor's appointment?"*, *"What should I finish today?"*, *"Can I safely cancel any subscriptions this month?"* Bills relate to budgets, medicines relate to appointments, projects relate to tasks and calendar events, subscriptions relate to recurring spending — LifyQ already models every one of these entities; the Context Engine is what makes their relationships something Jarvis can actually reason over, rather than fifteen domains that each only know about themselves. Full specification, including why this is deliberately *not* built as a standalone knowledge-graph database or a conversational-memory system, is in [38_Context_Engine.md](38_Context_Engine.md).

**The one rule that governs all of this:** the AI never saves anything on its own. It understands intent, extracts structured information, generates a recommendation, and presents it on a confirmation screen the user can edit before anything is written. Manual forms are not deprecated by this — they remain the precise, always-available fallback for browsing and bulk-editing, and they are also *how every ICE proposal gets reviewed*, since confirmation is itself a lightweight, pre-filled form. The full mechanics — the provider abstraction, the universal structured-output shape, and how a confirmed proposal reaches the existing repository layer untouched — are specified in [34_AI_Architecture.md](34_AI_Architecture.md) and [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md). The UX consequences — conversation-first design, progressive disclosure, and what this does to the Dashboard specifically — are in [36_UX_Philosophy.md](36_UX_Philosophy.md) and [37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md).

**Home and Jarvis are the same surface, not two.** Opening LifyQ does not land on a module-grid dashboard with a small "ask the assistant" teaser off to the side — it lands on a daily briefing that *is* Jarvis speaking, with quick capture immediately available. See [37_Dashboard_Design_Philosophy.md](37_Dashboard_Design_Philosophy.md) for the full redesign target.

## 8. Design Aspiration

When someone opens LifyQ for the first time, the reaction should be: *"This looks like a premium app I'd happily use every day."* The bar is Apple, Linear, Notion, Revolut, Arc Browser, Raycast, and Perplexity — not a typical SaaS admin dashboard. Full detail in [08_Design_System.md](08_Design_System.md) and [09_Brand_Guidelines.md](09_Brand_Guidelines.md).

## 9. Success Definition for This Phase

The frontend phase is successful when:

- Every pillar listed in Section 3 that is in-scope for MVP (see [22_MVP_Definition.md](22_MVP_Definition.md)) has a fully designed, fully responsive, fully interactive UI running on realistic mock data.
- The application is indistinguishable, at the UI/UX level, from a fully backed production SaaS product.
- ICE and Jarvis are usable end-to-end against a mock provider — a user can capture something in natural language, see a correct structured proposal, edit it, and confirm it into the correct existing domain, entirely on mock data.
- A backend engineer can implement Supabase-backed repositories, and an AI engineer can implement a real `AIProvider`, against the existing data and interface contracts (see [16_Data_Model_Plan.md](16_Data_Model_Plan.md), [34_AI_Architecture.md](34_AI_Architecture.md)) without touching component code.
- Lighthouse performance, accessibility, and best-practices scores meet the targets in [18_Performance_Strategy.md](18_Performance_Strategy.md) and [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md).
