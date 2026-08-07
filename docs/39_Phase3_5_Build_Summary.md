# 39 — Phase 3.5 Build & QA Summary

This document records what was built for Phase 3.5 (the AI-first repositioning specified in docs/01 §7 and docs/34–38) and the results of the live QA pass that followed. Planning-phase decisions are already recorded in place across docs/01, 06, 07, and 34–38 — this doc is the build/QA record, not a restatement of those.

## 1. What Was Built

Three stages, built and live-QA'd in sequence, per the approved plan (order: ICE/Jarvis → Dashboard → Context Engine).

### Stage 1 — Intelligent Capture Engine + Jarvis
- **`AIProvider`** ([docs/34](34_AI_Architecture.md) §1) — `AssistantEngine.sendMessage` renamed to `converse` (same signature), plus a new `extract()` method. `MockICEEngine` composes the untouched existing `converseMock` (the original 15-rule `mockAssistantEngine.ts`, byte-for-byte unchanged) with a new `extractMock`.
- **ICE routing wired for 6 domains** ([docs/35](35_Intelligent_Capture_Engine_Spec.md) §5) — Task (simple create), Bill (recurring/date-heavy), Reminder (simple+recurring), Health-Medicine (update-by-fuzzy-match, via a new `MedicineFormDialog` extracted from the previously-inline form in `MedicinesSection.tsx`), Finance-Transaction, and Grocery-List-Item (multi-entity-from-one-utterance, via a new `GroceryCaptureCard`). The remaining ~12 `CaptureDomain` values follow the identical mechanical pattern and are the explicit fast-follow (§4).
- **Confirm-before-save UI** — `TaskFormDialog`, `BillFormDialog`, `ReminderFormDialog`, `TransactionFormDialog`, and the new `MedicineFormDialog` each gained additive `initialValues`/`description`/`lowConfidenceFields` props; the Save button remains the only mutation call site. `CaptureConfirmSheet` steps through every proposal from one capture independently.
- **Real relative-date parsing** — `resolveRelativeDate`/`resolveRecurrencePhrase` added to `src/lib/date.ts`, recognizing "tomorrow," "in N days," "next weekend," weekday names, and "every Nth."
- **Genuinely functional voice input** — `useSpeechRecognition` wraps the browser-native Web Speech API (new ambient types in `src/types/speech-recognition.d.ts`, since this repo's TS lib config didn't include them).
- **`QuickCaptureBar`** — the primary ICE entry point, mounted on the redesigned Home and reachable from `TopBar`'s new "Ask Jarvis" trigger, which navigates to a new full-screen `/capture` route rather than opening a nested dialog (see §3's design note).
- **Routes/nav renamed** — `ROUTES.ai` → `ROUTES.assistant`, nav label "AI" → "Jarvis," new `ROUTES.capture`.

### Stage 2 — Dashboard Redesign
- **`buildUrgencyFeed()`** (`dashboard/utils.ts`) — consolidates the urgency-list logic that used to live separately inside `LifeAdminOverview` and `PlanningOverview` into one date/severity-sorted feed, plus two additions those never covered (expiring medicines, subscriptions renewing within 7 days).
- **`UrgencyFeed`, `DailyBriefingCard`, `SeeEverythingSection`** — new components. `generateDailyBriefing()` (in `assistant/mock/`, same shape as every `describeX()`) produces the 1–2 sentence narrative in Jarvis's voice.
- **`Home.tsx` restructured** to: `WelcomeSection` → `DailyBriefingCard` → `QuickCaptureBar` → `UrgencyFeed` → `SeeEverythingSection` (collapsed by default) wrapping the original domain-card grid, trimmed `LifeAdminOverview`/`PlanningOverview` (stat rows only, their lists now redundant with `UrgencyFeed`), `ProductivityInsights`, `AnalyticsTeaser`. `AssistantEntryCard` removed outright (superseded, confirmed `Home.tsx` was its only importer). `DailyOverview`'s usage dropped from Home (its stats now feed `UrgencyFeed`); the component file itself is untouched.

### Stage 3 — Context Engine
- **`RELATIONSHIP_GRAPH`** (`context-engine/relationshipGraph.ts`) — the full structural + inferred relationship table as typed data.
- **`MockContextEngine`** — 4 inferred relationships wired: Bill↔Budget, Subscription↔Transaction (financial half only, by design — [docs/38](38_Context_Engine.md) §6), Medicine↔HealthEvent, Life Record↔Calendar Event (travel keyword-matched, standing in for a real Travel pillar).
- **`useAssistantChat`** now tries `answerCrossDomain()` before `converse()`; a `null` result (the common case) falls through to the exact pre-existing single-domain path, unchanged.

## 2. QA Process

Every stage was exercised live against the running dev server before moving to the next: all 6 wired ICE domains (create + the one update-by-match case), reject/discard (verified nothing writes), the query-vs-capture fork, voice-input wiring, the redesigned Dashboard (feed sorting, disclosure toggle, capture bar), and all 4 Context Engine relationships plus a single-domain regression check. `tsc -b`, `eslint`, `prettier --check`, and `vite build` were run clean after every stage, not just once at the end.

## 3. Issues Found and Fixed

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | **`toIsoDate` used `.toISOString()` (UTC)**, silently shifting the calendar date by one day for any timezone ahead of UTC — surfaced live when "tomorrow" resolved to today's date during Stage 1 QA in a UTC+8 test environment. This was a pre-existing bug in a foundational shared helper, duplicated independently in 3 other files instead of importing it. | `src/lib/date.ts`, `mockAssistantEngine.ts`, `seedTasks.ts`, `ProductivityInsights.tsx`, `UpcomingEvents.tsx` | Rewrote `toIsoDate` to use local `Date` getters instead of UTC conversion; the 4 duplicate implementations were replaced with imports of the (now-correct) shared helper |
| 2 | **`GroceryCaptureCard`'s multi-item save used the same stale `list` reference for every `addItem` call** — since each mutation started from the same pre-loop `items` array, only the last item in a batch survived; earlier items were silently overwritten. Found live testing a 2-item capture ("coffee and chicken" → only chicken saved), confirmed and fixed before it could reach a 3-item batch | `GroceryCaptureCard.tsx` | Threaded each mutation's returned (updated) list into the next iteration instead of reusing the original reference; re-verified with 2-item and 3-item batches |
| 3 | **The Life Record × Calendar Event Context Engine rule matched *any* upcoming calendar event**, not just travel-shaped ones — live-tested it paired a passport with an unrelated dentist appointment, and the "before/after" phrasing was backwards (implied renewal was needed when the record was actually still valid through the trip) | `mockContextEngine.ts` | Restricted the match to event titles containing travel keywords (trip/flight/travel/vacation/offsite/conference); fixed the before/after branch to correctly distinguish "covers the trip" from "expires before it" |

Two additional issues were caught before any live testing, during the build itself: a React lint rule (`react-hooks/set-state-in-effect`) flagged a `setState` call inside a `useEffect` in `CaptureConfirmSheet` (resetting the step index on a new capture) and in `QuickCaptureBar` (mirroring the live speech transcript into local state) — both were rewritten using the React-docs "adjust state during render" pattern instead of an effect, per this project's existing lint configuration.

## 4. Remaining Limitations (not fixed — flagged, not silently shipped)

- **12 of 18 `CaptureDomain` values have no wired extraction rule yet** (goal, habit, calendar-event, note, life-record, subscription, document, health-event, health-vital, health-allergy, project, finance-budget, journal-entry). Each needs exactly one `ICE_DOMAIN_CONFIG` entry, one `ExtractionRule`, and (where none exists yet) an `initialValues` prop on its FormDialog — no new architecture, called out explicitly as the fast-follow rather than silently scoped out.
- **Camera OCR, image, PDF, and email capture are UI-stubbed only** — reachable, honest "coming in a later phase" toasts, no real parsing. This is the documented scope for this phase (docs/35 §2), not a gap.
- **The Subscription × Transaction Context Engine rule only answers the financial half of "can I safely cancel this."** No entity tracks subscription usage/engagement, so the "will I miss it" half is honestly declined rather than guessed — a known, previously-documented gap (docs/38 §6), unchanged by this build.
- **`DailyOverview.tsx` and the old `AssistantEntryCard.tsx`** — `DailyOverview` is no longer used on Home (its stats now feed `UrgencyFeed`) but the file is left in place as a still-valid isolated primitive; `AssistantEntryCard` was deleted outright since nothing else referenced it.
- **The main JS bundle is ~528 kB (170 kB gzipped)**, up marginally from the pre-Phase-3.5 baseline — every new route still gets its own small code-split chunk, so this remains a first-load-only concern, unchanged in kind from the pre-existing flagged limitation (docs/30 §8, docs/31 §5).

## 5. Phase 3.5 Status

All three stages (ICE/Jarvis, Dashboard redesign, Context Engine) are built against mock providers and live-QA'd, per the sequencing this phase existed to protect (docs/07's Sequencing Rule #8 — product/UX/architecture finalized before backend). Real-provider integration (a real `AIProvider` implementation) remains Phase 5, unchanged from the original plan — this build's `AIProvider` interface and `CaptureProposal`/`StructuredCapture` types are exactly what a real provider will need to satisfy, with no UI-layer changes anticipated at that swap.
