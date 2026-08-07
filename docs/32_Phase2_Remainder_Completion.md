# 32 — Phase 2 Remainder Completion: Build & QA Summary

This document records what was built to close out Phase 2 (Reminders, Journal, Projects, Finance — the four pillars [docs/07](07_Feature_Roadmap.md) originally scoped for Phase 2 alongside the six life-management modules covered in [docs/31](31_Life_Management_Expansion.md)) and the results of the live QA pass that followed. With this round, **Phase 2 is fully built** — the Feature-to-Phase Summary Table in docs/07 has been updated accordingly.

## 1. What Was Built

All four modules follow the identical repository/types/schema/hooks/components shape every existing domain uses (docs/13 §10.2) — no new architectural pattern was introduced:

- **Reminders** — standalone title/date/recurrence/notes reminders, independent of any task or habit, with a completed toggle and upcoming/completed filter.
- **Journal** — one entry per day, free-text content plus an optional five-point mood (great/good/okay/low/bad), mood filter, emoji mood-picker in the form.
- **Projects** — a full domain promoted from "task grouping," with its own list + detail page. A project optionally links to a Goal and links/unlinks any number of Tasks; progress is computed client-side from linked-task completion, matching the precedent Finance's `computeSpent` uses (see below).
- **Finance** — Transactions (income/expense, 10 categories) and Budgets (per-category monthly/weekly limits), tabbed under one page with an always-visible Overview (income/expenses/net this month).

**Two deliberate architectural extensions, documented in code rather than applied silently:**

1. **Cross-feature read precedent extended to feature-owned components.** Previously only Dashboard and the Assistant's mock engine were sanctioned to import across feature boundaries (docs/12 §5). `ProjectCard`/`ProjectDetail` now import `useTasks`/`useToggleTaskStatus` directly from Tasks, and `ProjectFormDialog` imports `useGoals` — justified by the pre-existing "Project contains Task(s)" relationship documented in docs/06 §4, and precedented by Notes' existing task/goal link-pickers.
2. **Client-side derived computation for cross-repository values.** `Budget.spent` is deliberately *not* a repository-derived field: `createMockRepository`'s `deriveOnRead` is synchronous, but computing spend requires reading the async `transactionsRepository`. Instead, `computeSpent(budget, transactions)` (`finance/utils.ts`) is called wherever a budget renders — the same pattern `ProjectCard` already uses for task-progress.

**Dashboard integration:** a new `PlanningOverview` component — a stat-tile row (Reminders due, Active projects, Budget health, Days since last journal entry) plus a "Reminders" card listing actual overdue/due-today reminders, color-coded red/amber, mirroring `LifeAdminOverview`'s pattern from the prior round.

**AI integration:** `mockAssistantEngine` gained `describeProjects`, `describeFinance`, `describeJournal`, and `describeReminders`, registered via the same `RULES` array + "every matching topic answers" loop established in the prior round.

## 2. QA Process

Every module was exercised live against the running dev server: create, edit, delete, toggle-completed (Reminders), task link/unlink (Projects), tab switching (Finance), inline validation, empty and filtered-empty states, mobile viewport (311px) for horizontal overflow, and the four new AI assistant integrations including a combined multi-topic query. `tsc -b`, `eslint`, `prettier --check`, and `vite build` were run clean both before this QA pass and again after the fix below.

## 3. Issues Found and Fixed

| # | Issue | Where | Fix |
|---|---|---|---|
| 1 | The Finance rule's regex (`\b(finance\|budget[s]?\|expense[s]?\|spending\|income)\b`) matched singular "finance" but not the plural "finances" — `\b` requires a boundary immediately after the literal, and "financeS" has no boundary there — so a natural question like *"give me an update on my finances"* silently fell through without a Finance answer | `mockAssistantEngine.ts` (Finance rule) | Added `[s]?` to match the pattern already used for `budget[s]?`/`expense[s]?` in the same regex: `finance[s]?` |
| 2 | Same class of bug, found by inspection while fixing #1: the Journal rule (`\b(journal\|diary\|mood)\b`) didn't match "journals", "diaries", or "moods" | `mockAssistantEngine.ts` (Journal rule) | Changed to `journal[s]?\|diar(y\|ies)\|mood[s]?` |

Both fixes were verified live: "How is my finance doing?" (singular, already worked) vs. a combined query "Give me an update on my finances and moods" — before the fix this produced no Finance/Journal content in a multi-topic response listing Projects and Reminders only; after the fix it correctly produced both `Finance: ...` and `Journal: ...` sections. `tsc`, `eslint`, `prettier`, and `vite build` were re-run clean after the fix.

Three additional issues were self-caught during the build phase (before this QA pass began) and are noted here for completeness, not re-litigated:

- An uncontrolled Radix `Select` in `ProjectDetail.tsx` ("Link a task") would have stuck on the last-picked task's label instead of resetting to the placeholder; fixed with a `linkSelectKey` remount trick before any live testing. **Re-verified live in this round** by linking two tasks in sequence — the trigger correctly reset to the placeholder each time, and the already-linked task correctly dropped out of the option list.
- A stray dead-code `export type { LucideIcon }` in `PlanningOverview.tsx`, removed.
- An import-order violation in `TransactionsList.tsx` (`Skeleton` import out of alphabetical position), fixed and confirmed clean on the next lint run.

## 4. Remaining Limitations (not fixed — flagged, not silently shipped)

- **Projects' task-progress and Finance's budget-spent are both computed client-side, not stored.** This is an intentional, documented consequence of `deriveOnRead` being synchronous (see §1) — not a gap to close, but worth knowing if a future domain needs the same cross-repository derived-value pattern.
- **Journal has no search** — only a mood filter. Reasonable at the expected scale (one entry per day); revisit if usage proves otherwise, same reasoning as Grocery Lists in docs/31.
- **Projects has no board/kanban view** — docs/07 Phase 2 describes Projects as promoted "with its own board view," but only a card-grid list + detail page shipped. Flagging as a scope note for a future pass, not a defect in what was built.
- **The main JS bundle is now ~526 kB (169 kB gzipped)**, up marginally from docs/31's ~522 kB — every new route (Projects, ProjectDetail, Finance, Journal, Reminders) still gets its own small code-split chunk (0.8–8.1 kB), so this only affects first load, unchanged in kind from the pre-existing flagged limitation.

## 5. Phase 2 Status

With Reminders, Journal, Projects, and Finance built this round (joining Life Records, Bills, Subscriptions, Documents, Grocery Lists, and Health from docs/31), **all nine Phase 2 pillars are now built**. The docs/07 Feature-to-Phase Summary Table has been updated from "IA reserved, not built" to "Build now" for all four. Phase 3 (Health — already built ahead of sequence per docs/31 — and Analytics) is the only remaining frontend phase before Phase 4's real backend integration.
