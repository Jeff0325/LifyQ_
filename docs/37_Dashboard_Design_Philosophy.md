# 37 — Dashboard Design Philosophy

This document sets the target design philosophy for LifyQ's home screen under the AI-first repositioning ([01_Product_Vision.md](01_Product_Vision.md) §7). It describes the **target shape**, not a change made today — the current Dashboard (`src/pages/Home.tsx`, built across docs/30–33) is the baseline this document evaluates and supersedes, but implementing the redesign is future build work, sequenced per [07_Feature_Roadmap.md](07_Feature_Roadmap.md), not part of this documentation pass.

## 1. The One Question

The home screen should answer one question immediately, before anything else competes for attention:

> **"What do I need to know and do right now?"**

Everything on the Dashboard is evaluated against this question. If a piece of content doesn't help answer it, it doesn't belong above the fold.

**Home and Jarvis are not two screens — they are the same surface.** Opening LifyQ does not land on a neutral dashboard that happens to contain a small link to "ask the assistant." It lands on a daily briefing that *is* Jarvis speaking — the same intelligence that answers a typed question, expressed by default as a proactive summary instead of waiting for one. The full-conversation view (`/assistant`, docs/06 §7) still exists for open-ended back-and-forth, but it's a deeper mode of the same relationship, not a separate product area the home screen merely teases.

## 2. What's Wrong With the Current Design

The current Dashboard, built module-by-module as each domain shipped (docs/30–33), is **module-centric**: it's a sequence of per-domain summary cards (`TodaysTasksCard`, `HabitProgressCard`, `GoalsProgressCard`, `CalendarSummaryCard`, `LifeAdminOverview`, `PlanningOverview`, `ProductivityInsights`, `AnalyticsTeaser`, ...) stacked in the order their domains were built, not in the order of what's urgent. This was the correct way to build it incrementally — each card was the right way to integrate a newly-shipped domain into the Dashboard at the time (per docs/02 §3.17's Dashboard integration requirement) — but the cumulative result is a long, repetitive scroll of "here's a grid of feature cards," which is exactly the shape §"Development Priority Change" flags as the wrong end state. It answers "what exists in this app," not "what do I need right now."

## 3. Target Content, in Priority Order

The redesigned home screen surfaces content in this order — urgency and time-relevance first, module identity last:

1. **Today's schedule** — the next thing on the calendar, not a summary of the whole day
2. **Current priorities** — the handful of things (tasks, overdue items, goal-linked work) that most deserve today's attention, surfaced calmly rather than alarmingly (continuing the existing red/amber-not-alarmist convention from [05_User_Journeys.md](05_User_Journeys.md) Journey D) — a synthesized, ranked short list, not every open task
3. **Upcoming reminders** — due today or imminently
4. **Bills due soon**
5. **Expiring medicines**
6. **Expiring documents** — Life Records (passports, licenses, insurance) and any Document nearing a relevant expiry
7. **Subscription renewals**
8. **Calendar events** (beyond "next")
9. **AI insights** — Jarvis-generated, proactive, often the product of the Context Engine ([38_Context_Engine.md](38_Context_Engine.md)) reasoning across more than one domain ("Your car insurance renews the same week as two other bills — want to see the total?")
10. **Daily summary** — a short narrative tying the above together in Jarvis's voice, not a fixed grid position — see §1's Home/Jarvis convergence
11. **Quick voice capture** — always reachable, not buried
12. **Quick text capture** — equally prominent, never voice-only (accessibility requirement, docs/36 §5)

This list is a priority order for *what earns a place in the default view*, not a literal fixed vertical stack — items 1–8 are naturally merged into one urgency-sorted feed (a bill due today and a medicine expiring today sort next to each other by *when*, not grouped by *which module they belong to*), which is the core structural change from the current per-domain-card layout. Item 9 (AI insights) is the one entry that can genuinely only exist post-Context-Engine — it's the concrete Dashboard expression of docs/38's cross-domain reasoning, not just a restated stat.

## 4. Replacing the Feature Grid

The current `DOMAIN_CARDS` grid (`Home.tsx`) and the module-by-module overview components it renders are **not deleted** — every one of them remains fully built, fully functional, and reachable. They move one level down, per §5's progressive disclosure. What replaces them at the top of the screen:

- **A single urgency-sorted feed** merging items 1–8 above, computed the same way [features/dashboard's existing aggregation components already do](../src/features/dashboard) (reading each domain's hooks directly, an already-sanctioned cross-feature read per [12_Folder_Architecture.md](12_Folder_Architecture.md) §5) — the computation logic already exists across `LifeAdminOverview`, `PlanningOverview`, and similar components; the redesign is a presentation change (one merged, sorted feed instead of separate per-domain cards), not a new data layer.
- **A daily briefing card** — a short, generated sentence or two, in the same voice Jarvis uses in conversation (docs/01 §7), summarizing the day rather than presenting raw numbers first.
- **A persistent quick-capture entry point, voice and text equally prominent** — elevated from the current `AssistantEntryCard` teaser-link pattern to a primary, always-visible affordance, consistent with Jarvis being the primary experience (docs/01 §7, docs/36 §1). Text is never a secondary fallback bolted onto a voice-first design — both are first-class, per docs/36 §5's accessibility requirement.

## 5. Progressive Disclosure

Per [36_UX_Philosophy.md](36_UX_Philosophy.md) §2: the default view shows only what's urgent or time-relevant today. A single, clear "See everything" (or per-domain "View all") expansion reveals the full module-by-module breakdown — the existing `ProductivityInsights`, `LifeAdminOverview`, `PlanningOverview`, `AnalyticsTeaser`, and the four domain progress cards continue to exist, presented as this secondary layer rather than the primary view. Nothing built in docs/30–33 is wasted; it's re-sequenced, not rebuilt.

## 6. Tone

Calm, modern, premium, and information-rich without overwhelming — the existing design aspiration (docs/01 §8, [08_Design_System.md](08_Design_System.md)) applies unchanged. The redesign is a content-priority and information-architecture change, not a new visual language: same tokens, same `Card`/`StatTile` vocabulary, same motion primitives. A screenshot of the redesigned Dashboard should look like it belongs to the same product as every other screen in LifyQ, just organized around urgency instead of module identity.

## 7. Relationship to Existing Components

| Current component | Target role after redesign |
|---|---|
| `WelcomeSection` | Retained — the greeting remains the entry point |
| `AssistantEntryCard` | Superseded by the elevated quick-capture entry point (§4) |
| `DailyOverview` (stat row) | Superseded by the urgency-sorted feed (§4) — its underlying data (tasks due, habits done, active goals, events today) feeds the new feed instead of four static tiles |
| `TodaysTasksCard`, `HabitProgressCard`, `GoalsProgressCard`, `CalendarSummaryCard` (the `DOMAIN_CARDS` grid) | Move to the progressive-disclosure layer (§5) |
| `LifeAdminOverview`, `PlanningOverview` | Their urgency lists (overdue bills, expiring records, due reminders) are absorbed into the merged feed (§4); their stat-tile rows move to the disclosure layer |
| `ProductivityInsights`, `AnalyticsTeaser` | Move to the disclosure layer, alongside a link to the full Analytics page (unchanged) |

This table is the concrete migration reference for whichever future milestone implements this redesign — every existing component has a stated destination, none are silently dropped.
