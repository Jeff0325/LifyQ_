# 05 — User Journeys

These journeys are written as design and engineering reference — each step implies specific screens, states, and components. They should be re-validated against the actual build once implementation starts.

## Journey A: First-Time Onboarding (all personas)

1. **Landing / Welcome** — Brand moment: logo mark, one-line value proposition, "Get Started" primary action. Motion: subtle entrance animation, no delay-inducing splash.
2. **Domain Preference Capture** — A short, skippable, visually light step: "What do you want to get organized first?" presented as selectable cards (Tasks, Goals, Habits, Calendar, Finance*, Health*, Journal*, Notes) — *starred domains shown but marked "Coming Soon" if post-MVP. Selections personalize which Dashboard cards appear first and which mock seed data is emphasized.
3. **Quick Setup** — One or two lightweight preference choices (e.g., theme, first goal or first three tasks) with strong pre-filled defaults the user can accept with one tap.
4. **Arrival at Dashboard** — Already populated with realistic mock data reflecting the user's stated preferences. This is the moment that must produce Priya's "proof of value in under two minutes."
5. **Optional guided tour** — Dismissible, spotlight-style callouts on 2–3 key affordances (quick-add, AI Assistant entry point, navigation). Never blocking, never more than one screen.

**Design requirement:** Steps 2–3 must be completable in under 60 seconds combined. Every step is skippable; skipping still produces a populated, sensible Dashboard via default mock data.

## Journey B: Daniel's Five-Second Capture

1. From any screen, Daniel triggers quick-add (FAB on mobile, keyboard shortcut / persistent input on desktop, both wired to a global command palette).
2. A minimal input appears: single text field, natural-language-parsed placeholder ("Call dentist tomorrow 3pm #health"), zero required fields beyond the text itself.
3. Pressing enter/submit runs the text through ICE (docs/34, docs/35) and surfaces a one-field-focused confirmation ("Jarvis understood this as a task, due tomorrow at 3pm") rather than saving immediately — Daniel confirms with a single tap/enter, which is still a five-second flow end-to-end, just with one extra glance at what was understood before it's saved (docs/34 §2's confirm-before-save principle, non-negotiable even for the fastest capture path).
4. Item lands in Tasks (or the inferred domain) with any parsed metadata (date, tag) pre-applied; Daniel can leave it as-is or open it later to refine.

**Design requirement:** This flow must be reachable in one interaction from anywhere in the app (see [10_Navigation_Architecture.md](10_Navigation_Architecture.md)), must never present more than one input field by default, and the confirmation step (step 3) must never feel like friction — pre-filled, single-tap-to-accept, not a full form to review. This journey is now LifyQ's flagship interaction under the AI-first repositioning ([01_Product_Vision.md](01_Product_Vision.md) §7) — see Journeys G and H for its natural-language and multi-entity variants.

## Journey C: Maya's Cross-Domain Planning Session

1. Maya opens LifyQ on desktop on a Sunday evening. Dashboard shows the week ahead.
2. She opens Goals, reviews progress on "Run a half-marathon," and opens the linked Project.
3. From the Project view, she creates three new Tasks and assigns due dates directly onto the Calendar via drag-or-quick-schedule.
4. She switches to Habits, checks her running-habit streak calendar, and adjusts the reminder time.
5. She opens the AI Assistant panel and asks "What does my week look like?" — the assistant synthesizes tasks, calendar events, and goal deadlines into a short, readable summary (from mock data).

**Design requirement:** Cross-domain linking (Goal → Project → Task → Calendar) must be visually traceable — a user should always be able to see "why" an item exists (its parent chain), reinforced in [06_Information_Architecture.md](06_Information_Architecture.md) and [16_Data_Model_Plan.md](16_Data_Model_Plan.md).

## Journey D: Priya's Daily Morning Check-In (mobile)

1. Priya opens the app on her phone at 7:15am. Dashboard loads instantly (perceived performance via skeleton states, see [18_Performance_Strategy.md](18_Performance_Strategy.md)) showing: today's top 3 tasks, next calendar event, habit check-ins pending, and any overdue items surfaced clearly but calmly (not alarmist red).
2. She checks off two habits directly from the Dashboard without navigating away.
3. She taps a calendar event to confirm timing, then returns to Dashboard via back gesture/button — state is preserved (scroll position, expanded cards).
4. She glances at a weekly summary card (post-MVP Analytics teaser) — even pre-Analytics-launch, the Dashboard should tease "See your week" for future depth.

**Design requirement:** The Dashboard must render meaningful content in under 1 second perceived time on mobile, support quick actions inline (no forced drill-down for simple check-offs), and preserve navigation state on return.

## Journey E: Encountering a Premium Boundary

1. Any persona, while using a free-tier-limited feature (e.g., adding a 4th active project, or asking the AI Assistant a question beyond the daily free cap), hits a limit.
2. The UI presents a non-punitive, clearly-explained paywall moment: what the limit is, what upgrading unlocks, and a clear path to the pricing/upgrade screen — never a dead end or disabled control with no explanation.
3. Declining is always graceful — the user returns to exactly where they were, with the item they were creating preserved if possible (e.g., draft retained).

**Design requirement:** Paywall moments must feel like an honest boundary, not a dark pattern. See [21_Monetization_Strategy.md](21_Monetization_Strategy.md) for tier definitions and [08_Design_System.md](08_Design_System.md) for empty/locked-state visual treatment.

## Journey F: Empty States (new domain, no data yet)

Applies to any domain a user hasn't populated yet (e.g., opens Notes for the first time).

1. Illustrated, on-brand empty state (not a bare "No items" text) explaining what the domain is for in one sentence.
2. A single, clear primary action to create the first item.
3. Optionally, 1–2 example/template items the user can add with one tap to see the domain in action immediately.

**Design requirement:** No domain should ever show a broken-feeling blank screen; empty states are treated as designed moments, per the founding brief's mandate on "beautiful empty states." Full spec in [08_Design_System.md](08_Design_System.md).

## Journey G: Capturing via Jarvis — Natural Language to Structured Action

1. Maya says, out loud or typed into Jarvis, *"I have a meeting in two days."* No module was opened first.
2. ICE resolves "in two days" to an absolute date, recognizes this as a Calendar Event rather than a Task (docs/35 §5's routing table), and Jarvis replies with a short acknowledgment plus a confirmation card: event title (editable, defaulted from the phrase), date (resolved, editable), time (flagged as not yet specified — a low-confidence field per docs/35 §7, not blocking).
3. Maya taps the date to adjust it slightly, leaves the time blank for now, and confirms.
4. The event appears on her Calendar exactly as it would have if she'd created it there directly — same entity, same detail view, same edit affordances.

**Design requirement:** The confirmation card must make Jarvis's routing decision legible ("understood this as a calendar event") so Maya can catch a misroute before confirming, not after. See [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §7.

## Journey H: Ambiguous and Multi-Entity Capture

1. Daniel says *"Buy coffee and chicken tomorrow."*
2. ICE recognizes two grocery items rather than one malformed task, and — since Daniel has an active grocery list — proposes appending both to it (docs/35 §3, §5).
3. Jarvis presents both as a small reviewable batch: two line items, each independently editable, a single "Add both" confirm action, and a per-item "Add just this one" fallback.
4. Separately, Daniel says *"Fix the thing with Sam."* Confidence is too low for a clean proposal (no clear domain, no clear entity match), so instead of guessing, Jarvis asks a clarifying follow-up: *"Is this a task, or something for a specific project?"* — Daniel answers "task, tag it urgent," and *then* a normal single-item confirmation card appears.

**Design requirement:** Multi-entity batches must never force an all-or-nothing confirmation, and low-confidence input must never silently produce a bad guess — it must ask, per [01_Product_Vision.md](01_Product_Vision.md) §6's "not an autonomous agent" guardrail. See [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §6.

## Journey I: A Cross-Domain Question via the Context Engine

1. Priya asks Jarvis, *"Which medicines expire before my doctor's appointment?"* — she names no module.
2. Jarvis briefly states what it's checking ("Checking your medicines against your upcoming appointments...") before answering, per docs/36 §4's transparency principle — this is a *read*, so there is no confirmation screen to review; the transparency happens in the answer itself, not a separate step.
3. It replies with the specific medicines and the specific appointment, by name and date — not a vague "some medicines may be expiring."
4. Priya separately asks, *"Can I safely cancel any subscriptions this month?"* Jarvis answers the financial half confidently (which subscriptions' cost is meaningfully affecting an over-budget category) and is explicit about the half it can't answer ("I don't know how often you actually use Netflix, though") rather than guessing at "safely."

**Design requirement:** A cross-domain answer must read as one synthesized sentence or short paragraph, not a concatenation of separate per-domain paragraphs (contrast with the "every matching rule contributes" combination style used for genuinely separate topics, e.g. "Projects: ... / Reminders: ..." in earlier journeys) — the whole point of the Context Engine is that the *relationship* between the two pieces of data is the answer, not each piece on its own. See [38_Context_Engine.md](38_Context_Engine.md) §3–5.
