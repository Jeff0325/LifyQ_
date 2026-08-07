# 33 — Analytics: Build & QA Summary

This document records what was built for Analytics — the last planned frontend pillar (docs/07_Feature_Roadmap.md Phase 3, alongside Health which shipped ahead of sequence in docs/31) — and the results of the live QA pass that followed. With this module, **every frontend domain in the original roadmap is built**, aside from Notifications (Phase 4, real backend territory).

## 1. What Was Built

Analytics is architecturally different from every prior module: it has **no repository, no mock data, and no CRUD** of its own (docs/16_Data_Model_Plan.md has no Analytics entity). It's a read-only cross-domain aggregation view — pure functions over data every other domain's repository already owns.

- **`src/features/analytics/utils.ts`** — pure aggregation functions (task completion trend, habit consistency, goal progress, spending by category, daily spending trend, bills-paid rate, subscription monthly cost, ...) that take plain domain arrays (`Task[]`, `Habit[]`, `Transaction[]`, ...) and return numbers or chart-ready data. No side effects, no fetching.
- **`src/pages/Analytics.tsx`** — four sections, each a component in `src/features/analytics/components/`: an overview stat row (`AnalyticsOverview`), `ProductivitySection` (task trend, goal progress, habit consistency), `FinanceSection` (30-day income/expenses/net, spending by category, daily spending trend), and a compact `LifeAdminSection` (bills paid, subscription cost — no chart, see §4).
- **A new shared chart primitive, `BarChart`** (`src/components/shared/BarChart.tsx`) — a hand-rolled SVG categorical bar chart, matching `Sparkline`'s "no charting library" approach (docs/11_Component_Library.md §4 flagged this as deferred until Analytics shipped). Cycles through the existing 8-hue CVD-safe `--color-chart-N` palette (tokens.css, unused by any component until now).
- Each section reads its source domains' hooks directly (`useTasks`, `useGoals`, `useHabits`, `useTransactions`, `useBills`, `useSubscriptions`) — the same cross-feature-read approach `ProductivityInsights` already used on the Dashboard, just applied at page scope. Analytics is the clearest-yet case for the precedent this session already extended to Projects (docs/32) — its entire purpose is aggregating every other domain.

**Dashboard integration:** `AnalyticsTeaser`, a compact card with a "View all" link and one summary sentence (tasks completed / habit consistency / net cash flow, 30 days) — deliberately not a repeat of `ProductivityInsights`' 7-day sparkline, so the two Dashboard cards complement rather than duplicate each other.

**AI integration:** `describeAnalytics` added to `mockAssistantEngine`, triggered by `analytics`, `insight(s)`, `trend(s|ing)`, or "how am I doing" — reusing the same `analytics/utils.ts` functions the page uses, read via `.list()` against the repositories directly (the pattern every other `describeX` function already follows).

## 2. Scope Decisions

- **Trailing 30-day windows, not calendar-month.** Finance's own page (`FinanceOverview`) is anchored to the current billing month; Analytics uses a rolling 30-day window instead, since "how am I trending" is a different question from "how does this month look so far." Both are correct for their context, not a duplicate.
- **Goal progress and habit consistency shown as full bar charts**, not repeats of Dashboard's top-3 lists — Dashboard teases, Analytics shows everything.
- **Life Records, Documents, and Grocery Lists have no Analytics section.** None of their fields carry an obvious numeric trend worth charting (a count is already the whole story), so `LifeAdminSection` stays a two-tile stat row rather than forcing a chart where one doesn't add information. Flagged explicitly rather than silently omitted.

## 3. QA Process

Exercised live against the running dev server: real data flowing from every source repository into every stat tile and chart (cross-checked the numbers by hand — e.g. spending-by-category bars summed to $1,801, the $15 gap against the $1,816 expense total accounted for by a 7th category outside the top-6 cutoff), the Dashboard teaser's numbers matching the Analytics page exactly, the "View all" link navigating correctly, the AI query (including a combined multi-topic query alongside Reminders), dark-mode chart colors resolving to the correct token values, and mobile viewport testing down to 300px. `tsc -b`, `eslint`, `prettier --check`, and `vite build` were run clean after the initial build and again after the fix below.

## 4. Issues Found and Fixed

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | **`BarChart`'s SVG used a fixed pixel `width` (320) with no responsive CSS** — at a 300px mobile viewport, three of the four charts on the Analytics page forced the page 57px wider than the viewport (confirmed via `document.body.scrollWidth` vs. the actual requested viewport width), a real horizontal-overflow bug. `Sparkline` had the same latent gap, just not yet triggered because every current usage picks a width narrow enough to fit its container | `BarChart.tsx`, `Sparkline.tsx` | Added `h-auto max-w-full` to both SVGs' `className` — the standard responsive-SVG technique: the `viewBox` preserves the aspect ratio while CSS lets the rendered box shrink below its intrinsic `width`/`height` attributes when the container is narrower. Verified live: 320px-wide charts render at full size on desktop and scale down to fit (measured 226px) at a 300px viewport, with `scrollWidth` matching the viewport exactly in both cases |

This was caught by explicitly comparing `document.body.scrollWidth` against the real requested viewport width (`window.outerWidth`) rather than `window.innerWidth` — in this test environment, `window.innerWidth` reported a stale/incorrect value that would have hidden the bug had it been used as the overflow check instead.

## 5. Remaining Limitations (not fixed — flagged, not silently shipped)

- **No date-range picker** — every window (14 or 30 days) is fixed in code. Reasonable for a first pass; a real range selector is natural follow-up scope if usage shows people want to compare different periods.
- **`BarChart` truncates labels over 10 characters with an ellipsis** (e.g. long goal titles), matching Sparkline's "no chrome" minimalism rather than adding tooltips — full labels are still available on the source page (Goals, Habits, Finance) one click away.
- **No Health, Life Records, Documents, or Grocery Lists analytics section** — see §2's scope decision; `useLifeRecords`/`useGroceryLists`/health hooks were deliberately not pulled in for this pass.
- **The main JS bundle is ~526 kB (169 kB gzipped)**, unchanged in kind from docs/31 and docs/32's flagged limitation — Analytics itself ships as its own ~7.5 kB code-split chunk, so this only affects first load.

## 6. Roadmap Status

With Analytics built, docs/07's Feature-to-Phase Summary Table now marks every Phase 1–3 pillar "Build now" except Notifications (Phase 4, correctly deferred — it requires real backend delivery, not a frontend affordance). Phase 4 (real Supabase backend, real Cloud Sync, real Notifications) is the next roadmap phase, per docs/07's own sequencing rules.
