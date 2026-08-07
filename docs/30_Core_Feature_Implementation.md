# 30 — Core LifyQ Application Functionality (Milestone 4)

This document records what was built for Milestone 4 — the six core application modules (Tasks, Goals, Habits, Calendar, AI Assistant, Dashboard) plus the shared frontend data-layer infrastructure that makes each of them swap-in-ready for a real backend (Supabase, Phase 4 per [07_Feature_Roadmap.md](07_Feature_Roadmap.md)) without a UI rewrite. Everything in this milestone is **frontend-only**: mock data, `localStorage` persistence, simulated network latency — no auth, no real accounts, no backend calls, no real AI model.

## 1. The Data-Layer Seam

The single decision that shapes this whole milestone: every feature talks to its mock data through the same narrow interface a real backend will later implement, so the swap is a file replacement, not a UI rewrite.

### 1.1 `Repository<T, TCreate, TUpdate>` (`src/data/types.ts`)
A generic interface — `list/get/create/update/remove` — plus `BaseEntity { id, createdAt, updatedAt }`. Deliberately **no `userId`** on `BaseEntity`: auth doesn't exist yet, and inventing a fake one now would just be a shim to delete later.

### 1.2 `createMockRepository` (`src/data/createMockRepository.ts`)
A generic factory over an in-memory array backed by `localStorage`, with simulated latency (150–500ms per call, so loading states are actually exercised in development, not just in theory) and two optional hooks used by the more complex features:

- **`deriveOnRead?: (entity: T) => T`** — computed fields that must never go stale in storage. Goals uses this to recompute `progress` from `milestones` on every read (`computeProgress`); Habits uses it to recompute `currentStreak`/`longestStreak` from `completions`. This guarantees derived data can never drift from its source, since it's never *stored* — only ever computed at read time.
- **`prepareCreate?: (input: unknown) => Partial<T>`** — expands a create-form's input shape into the full entity shape before persisting. Added specifically because Goals' create form only collects `title/description/category/targetDate` — without this hook, a created goal would persist with `milestones: undefined`, `status: undefined`, `progress: undefined`, none of which the form is responsible for. `goalsRepository` uses it to inject `{ status: 'active', milestones: [], progress: 0 }`.

Every feature's `repository.ts` is a thin, feature-specific configuration of this one factory — see §3.

### 1.3 TanStack Query as the async boundary
`QueryClientProvider` wraps the app in `RootLayout` (`src/app/queryClient.ts`: `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`). Each feature exposes its own `use*` hooks (`useTasks`, `useCreateTask`, …) built on `useQuery`/`useMutation`, with a query-key factory (`taskKeys`, `goalKeys`, `habitKeys`, `eventKeys`) so invalidation stays scoped and typo-proof. **This is the actual seam.** When Phase 4 replaces `tasksRepository` with a Supabase-backed implementation of the same `Repository` interface, `useTasks.ts` and every component that calls it are unaffected — they already only know about query keys and hook signatures, never the storage mechanism.

### 1.4 Optimistic mutations
Two hooks — `useToggleTaskStatus` and `useToggleHabitToday` — use the full `onMutate` (apply immediately) / `onError` (roll back to the pre-mutation snapshot) / `onSettled` (invalidate to reconcile with the source of truth) pattern, rather than waiting for the simulated round-trip before updating the UI. This is what makes checking off a task or a habit feel instant despite the artificial latency — and it's the same pattern a real network-backed mutation needs, so nothing here is mock-specific.

## 2. Shared Components (new this milestone)

- **`ResponsiveFormSheet`** (`src/components/shared/ResponsiveFormSheet.tsx`) — the single form shell every feature's create/edit dialog uses: a centered `Dialog` at `lg`+ (`useMediaQuery(QUERY_LG)`), a bottom `Sheet` (`max-h-[85dvh] overflow-y-auto`) below it. One component, one place to get the desktop/mobile form pattern right, instead of six features each reimplementing the breakpoint check.
- **`src/lib/date.ts`** — `toIsoDate(date)` / `todayIso()`. Extracted mid-milestone after a lint pass surfaced that Habits and Calendar had each independently written the same date-to-ISO-string helper (see §6). Both features now delegate to this and re-export `todayIso` for backward compatibility with their own internal imports.

## 3. Feature Modules

Each feature follows the same internal shape: `types.ts` (entity type, Zod form schema, derived-field types), `mock/seed*.ts` (seed data), `repository.ts` (a `createMockRepository` configuration), `hooks/use*.ts` (TanStack Query hooks), `components/*.tsx`, and an `index.ts` **public barrel** — the only import surface other code is meant to use (see §6 for how strictly that's actually enforced).

### 3.1 Tasks (`src/features/tasks/`)
List/create/edit/delete/complete, priority (`low/medium/high`), category, due dates, search + status/priority/category filters. `TaskRow` demonstrates the gesture-with-fallback pattern from [28_Mobile_First_Architecture.md](28_Mobile_First_Architecture.md) §6: a `Swipeable` right-action for delete, *and* a non-gesture `DropdownMenu` with the same actions, so nothing here is mouse/keyboard-inaccessible. `describeDueDate()` (`utils.ts`) produces the `Overdue`/`Today`/`Tomorrow`/weekday/date label + tone shown on each row. Wired into `src/pages/Tasks.tsx`.

### 3.2 Goals (`src/features/goals/`)
Dashboard grid → detail page (`/goals/:goalId`, `src/pages/GoalDetail.tsx`) with milestones, a big `ProgressRing`, and edit/delete. Progress is **never stored** — `computeProgress` (percentage of completed milestones) runs through `deriveOnRead` on every read, so it can't drift from the milestone list (see §1.2). `goalDetailPath(goalId)` (`src/constants/routes.ts`) is the one place the URL shape is defined, used by every card/link that navigates there.

### 3.3 Habits (`src/features/habits/`)
Daily check-off, streak counting (`computeCurrentStreak`/`computeLongestStreak` in `utils.ts`, both derived via `deriveOnRead` for the same never-stale reason as Goals' progress), a 7-day mini-dot strip on each card, and an 84-day/12-week heatmap (`HabitHistoryView`, `grid-flow-col` with 7 rows) in a dialog. Reintroduced to the primary nav this milestone (`src/constants/navigation.ts`) — it lives in the mobile bottom nav's "More" panel alongside Calendar and Profile, since `MOBILE_TAB_ITEM_IDS` only has room for four direct tabs (Home/AI/Tasks/Goals).

### 3.4 Calendar (`src/features/calendar/`)
Agenda-first, not month-grid: a horizontally-scrollable `DateStrip` day picker + a `DailyAgenda` for the selected day + an `UpcomingEvents` sidebar (`lg:sticky`) showing the next several days at a glance. No external calendar integration — this milestone's events are entirely local mock data, per the brief. `eventFormSchema` uses a Zod `.refine()` to reject an end time before the start time.

### 3.5 AI Assistant (`src/features/assistant/`)
A real chat UI (`ChatThread`, `MessageBubble`, `TypingIndicator`, `SuggestedPrompts`, `ChatInput`) over a **scripted, not-a-real-model** engine (`mock/mockAssistantEngine.ts`). `useAssistantChat` holds the thread in local `useState` (no persistence — a fresh page load starts a new conversation, which is the correct behavior for a mock with no backend session). `mockAssistantEngine.sendMessage()` simulates 500–1400ms of "thinking," then pattern-matches the message against a small `RULES` array (task/goal/habit-streak/calendar-schedule keywords) and calls into `tasksRepository`/`goalsRepository`/`habitsRepository`/`eventsRepository` **directly** to produce a real-data-aware reply (e.g. "You have 10 open tasks. 2 are overdue…") — not a canned string. Unmatched messages fall back to one of two generic responses. This is a **sanctioned cross-feature import** (see §6) because the assistant's entire value is aggregating across every other domain; `AssistantEngine` (the interface it satisfies) is written so a real `LiveAssistantEngine` can later implement the identical `sendMessage(thread, message)` signature against a real model, without `useAssistantChat` or any chat component changing.

### 3.6 Dashboard (`src/features/dashboard/`)
The one page explicitly sanctioned to aggregate across every other feature's public barrel ([12_Folder_Architecture.md](12_Folder_Architecture.md) §5): welcome section, an AI-assistant teaser card, a 4-tile daily overview (tasks due today, habits done, active goals, events today), today's-tasks/habit-progress/goals-progress/calendar-summary cards, a 7-day completed-tasks sparkline with a best-streak callout, and quick-action buttons that open each feature's own create dialog. Composed in `src/pages/Home.tsx`.

**Not wrapped in `PullToRefresh`**, despite that being a natural fit for a dashboard: `PullToRefresh` owns a bounded-height scroll container and only arms its drag gesture at that container's own `scrollTop === 0` ([28_Mobile_First_Architecture.md](28_Mobile_First_Architecture.md) §6). `AppShell`'s `<main>` is a normal document-flow scroll region with no fixed height — nesting `PullToRefresh` there would give it a container that never actually overflows, so its internal `scrollTop` would never move and the gesture would perpetually fight the page's native scroll instead of complementing it. Caught and reverted before shipping; demonstrated correctly instead on `/design-system`, where the demo container's height is deliberately bounded.

## 4. Loading / Empty / Error / Success States

Every list-rendering feature component follows the same four-state shape, driven directly off TanStack Query's `isLoading`/`isError`/data flags — nothing bespoke per feature:

- **Loading:** a feature-specific `*Skeleton` component (`TasksSkeleton`, `GoalsSkeleton`, `HabitsSkeleton`, `CalendarSkeleton`) shaped like the real content, not a generic spinner.
- **Empty:** the shared `EmptyState` component with a feature-appropriate icon/title/description and a primary action (usually "New \_\_\_", opening that feature's form dialog).
- **Error:** the shared `ErrorState` component with a retry action wired to that query's `refetch()`.
- **Success:** the real list/grid, wrapped in `StaggerList`/`StaggerItem` (existing motion primitives from Milestone 2) for the entrance animation.

## 5. Mobile & Responsive Behavior

All six modules render through `PageContainer` (`size="lg"` for collection/dashboard views, `size="sm"` for the chat and goal-detail pages) inside the existing `AppShell`, so they inherit safe-area handling, the bottom-nav/sidebar breakpoint switch, and touch-target sizing from Milestone 3 with no extra work. Feature-specific mobile behavior added this milestone:
- `DateStrip` scrolls horizontally with hidden scrollbars (`[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` — Tailwind v4 has no built-in `scrollbar-none` utility).
- `TaskRow`'s `Swipeable` delete action is the first real product usage of the Milestone 3 gesture primitives (previously demonstrated only on `/design-system`).
- Grids collapse to a single column below `sm`/`lg` throughout (Goals grid, Habits grid, Dashboard's two-column card row) — verified in a live 375×812 mobile viewport check (§8), not just assumed from the Tailwind classes.

## 6. Cross-Feature Import Boundary: What Shipped vs. What Was Attempted

[12_Folder_Architecture.md](12_Folder_Architecture.md) §3 states the intended convention: other code should only import a feature through its `index.ts` barrel, never its internals directly. Two sanctioned exceptions exist by design (§5 of that doc): the Dashboard and the AI Assistant's mock engine, both of which exist specifically to aggregate across features.

An ESLint `no-restricted-imports` rule enforcing this (written in Milestone 1, before any feature code existed to test it against) was tried this milestone and **removed** after proving unworkable: it fired 91 warnings, of which manual triage found only 4 were genuine violations (Dashboard components reaching into `@/features/habits/utils` and `@/features/calendar/utils` directly instead of each feature's barrel) — the other ~87 were false positives, because plain `no-restricted-imports` glob patterns can't express "except when the importing file is itself inside that feature," so every legitimate same-feature internal import (e.g. `features/tasks/hooks/useTasks.ts` importing `../repository`) also tripped the rule.

The 4 real violations were fixed directly (plus the root cause — a duplicated `todayIso()`/`toIsoDate()` implementation in both `habits/utils.ts` and `calendar/utils.ts` — extracted into `src/lib/date.ts`, §2). The unworkable rule itself was deleted from `eslint.config.js` rather than left in place generating noise; a comment there explains the limitation and names `eslint-plugin-import`'s `no-restricted-paths` (which supports per-zone `target`/`from`/`except` globs) as the properly-scoped tool for a future pass, if the convention needs machine enforcement rather than code-review discipline.

## 7. Future Supabase Integration Points

Everything below is designed to be a **file-level swap**, not a rewrite, because of the seam in §1:

- **Per feature:** replace `repository.ts`'s `createMockRepository(...)` call with a Supabase-backed implementation of the same `Repository<T, TCreate, TUpdate>` interface (real `list/get/create/update/remove` against Postgres tables/RLS policies). `hooks/use*.ts` and every component are unaffected — they only import the repository's public shape, never `createMockRepository` itself.
- **`BaseEntity`** gains a `userId` once auth exists; every table's row-level-security policy scopes to it. No feature type needs to change beyond that one addition (plus whatever join-relevant fields a real schema needs that seed data didn't require).
- **`deriveOnRead`/`prepareCreate`** either move server-side (a Postgres generated column or trigger for `Goal.progress`/`Habit.currentStreak`, a database default for `Goal.status`) or stay client-side as a thin transform over the real response shape — whichever proves cleaner once the actual schema is designed; the interface doesn't force the choice now.
- **AI Assistant:** `LiveAssistantEngine` implements `AssistantEngine.sendMessage(thread, message)` against a real model API instead of `mockAssistantEngine`'s regex rules; `useAssistantChat` and every chat component are unaffected.
- **Realtime:** TanStack Query's existing `invalidateQueries` calls are the natural place to add Supabase realtime subscription-triggered refetches later — no restructuring needed, just an additional invalidation source.

## 8. Verification Performed

Beyond `tsc -b`, `eslint`, `prettier --check`, and `vite build` (all clean — one build warning, noted below, not an error) — live-browser checks against the running dev server:

- **Dashboard:** all data tiles, cards, and the sparkline render real seeded data; toggling a task's checkbox live-updated the "tasks due today" count, the today's-tasks list, and the productivity-insights completed-count in the same render — confirming the optimistic-update + query-invalidation chain works across independently-mounted components reading the same query key.
- **Tasks:** created a task via the form dialog (appeared immediately in the list), deleted it via the row's overflow menu → `ConfirmDialog` → confirm (removed immediately, confirming the full create/delete round-trip against `localStorage`).
- **Goals:** navigated dashboard → grid → `/goals/:goalId` detail page; toggled a milestone checkbox and confirmed the `ProgressRing` percentage recomputed live via `deriveOnRead` (60% → 40% → 60% on toggle/untoggle), with no manual refresh.
- **Habits:** checked off a habit for today on `/habits`; streak count incremented immediately (0 → 1) confirming `computeCurrentStreak`'s `deriveOnRead` recomputation.
- **Calendar:** date strip, daily agenda, and upcoming-events sidebar all render correctly with real seeded events.
- **AI Assistant:** exercised all four suggested prompts and free-text input. **Found and fixed a real bug during this check:** the "What's on my plate today?" suggested prompt didn't match any rule in `mockAssistantEngine.ts`'s `RULES` array (no literal "task" keyword in that phrasing), so it fell through to the generic fallback response instead of the intended data-aware task summary — one of the app's own four curated prompts was silently broken. Fixed by broadening the tasks rule to `/\b(task|to-?do)s?\b|on my plate\b/i`; re-verified live afterward — the prompt now correctly returns `"You have 10 open tasks. 2 are overdue — ..."`.
- **Dark mode:** toggled via the theme control; confirmed `dark` class applied to `<html>` and persisted correctly across a client-side route navigation.
- **Mobile viewport (375×812):** re-checked Home; bottom nav (Home/AI/Tasks/Goals/More) renders correctly, dashboard cards stack to a single column, dark mode state persists.
- **`localStorage` persistence:** confirmed all four data-backed features (`lifyq.tasks`, `lifyq.goals`, `lifyq.habits`, `lifyq.events`) actually persist to `localStorage`, not just in-memory state that would reset on reload.

**Build warning, not fixed this milestone:** `vite build` reports the main JS chunk (`index-*.js`, ~518 kB / 166 kB gzipped) exceeds the 300 kB chunk-size-warning threshold — it's the shared vendor bundle (React, TanStack Query, Radix primitives, Motion, React Hook Form, Zod) pulled in by the app's own entry point. Every route already code-splits correctly (each of Tasks/Goals/Habits/Calendar/Ai/GoalDetail gets its own small chunk, confirmed in the build output), so this is a vendor-bundling concern, not a routing regression — a reasonable Phase-5-adjacent follow-up (manual `rolldownOptions.output` chunking, or accepting the warning threshold as too conservative for this dependency set) rather than a Milestone 4 blocker.

## 9. Scalability, Performance, and Maintainability Self-Review

- **Scalability:** the repository-factory + query-hook pattern means a 7th feature (e.g. Notes, already reserved in the nav's `enabled: false` slots) is a copy of an existing feature's five files, not a new architectural decision. Cross-feature aggregation stays confined to two sanctioned call sites (§6), so the dependency graph between features stays a strict one-way fan-in (Dashboard/Assistant → features), never feature-to-feature.
- **Performance:** route-level code-splitting already isolates each feature's bundle (§8); the one open item is the shared vendor chunk size (§8), which affects initial load but not per-route navigation cost. Optimistic mutations keep perceived interaction latency near-zero despite the artificial mock delay.
- **Maintainability:** the lint-rule removal (§6) is deliberately not a "fixed forward" story — it's documented as diagnosed-and-reverted, matching the same honest pattern applied twice before in this project (Radix `Presence` animations in Milestone 2, `PresenceRoute` in Milestone 3): prefer a simpler, verified-working approach over defending a clever one that doesn't hold up against real usage.
- **Future Android/iOS (Capacitor) conversion:** no feature built this milestone introduces anything Capacitor-incompatible — no hard navigation, no non-`env(safe-area-inset-*)` offsets, no desktop-only interaction assumptions. `localStorage` (this milestone's persistence) works identically inside a Capacitor WebView with no adaptation; only the eventual Supabase swap (§7) is genuinely platform-relevant, and that seam already exists.
