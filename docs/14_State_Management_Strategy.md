# 14 — State Management Strategy

## 1. Principle: Split by State Category, Not One Global Store

A common mistake in apps this size is reaching for a single global store for everything. LifyQ instead classifies state into four categories, each with the tool best suited to it. This keeps each tool doing one job well and avoids the boilerplate and staleness bugs that come from forcing async/server-shaped data into a client store (or vice versa).

| Category | Tool | Examples |
|---|---|---|
| Async/"server" state (even though the server is mocked) | **TanStack Query** | Tasks, Goals, Habits, Calendar events, Notes — anything from a repository |
| Global client/UI state | **Zustand** | Sidebar collapsed, active modal/sheet, command palette open, theme, mock session/user, onboarding progress |
| Form state | **React Hook Form** (+ Zod) | Any create/edit form across all domains |
| URL state | **React Router search params** | Active filters, sort order, selected tab, calendar view/date |
| Local/ephemeral component state | `useState` / `useReducer` | Hover states, input focus, transient animation flags |

## 2. Async State — TanStack Query

Every feature exposes hooks like `useTasks(filter)`, `useTask(id)`, `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`, each a thin wrapper around `useQuery`/`useMutation` calling the domain's repository (see [13_Technical_Architecture.md](13_Technical_Architecture.md) §4).

**Why TanStack Query even though there's no real server:** it is the mechanism that makes mock data *feel* like real async data — caching, background refetch, loading/error states, retries, and optimistic updates all come for free and behave identically whether the repository underneath is mock or Supabase. This is what allows Phase 4's backend swap to be invisible at the component layer: components already only know how to render `isLoading`, `isError`, and `data`, regardless of source.

- **Query keys:** namespaced by feature and params, e.g. `['tasks', 'list', filter]`, `['tasks', 'detail', id]` — centralized in each feature's `queryKeys.ts` to avoid key-typo cache bugs.
- **Mutations:** use optimistic updates for high-frequency, low-risk actions (completing a task, checking off a habit) so the UI feels instant even against simulated latency; rollback on simulated error injection is implemented and tested now so the pattern is proven before it matters for real network failures.
- **Cache invalidation:** mutations invalidate their own list/detail query keys; cross-domain invalidation (e.g., completing a Task updates a Goal's progress) is handled explicitly per relationship, documented alongside each mutation hook.
- **Stale time:** short default (30s) reflecting that this is personal, frequently-changing data; adjusted per-domain where appropriate (e.g., Settings data can be longer).

## 3. Global Client State — Zustand

A small number of narrowly-scoped stores, not one monolithic store:

- `useUIStore` — sidebar collapsed/expanded, active sheet/modal identifier, command palette open, density mode
- `useSessionStore` — mock "current user" object, onboarding completion flag, selected domain preferences from onboarding
- `usePreferencesStore` — theme (light/dark/system), notification preference toggles (UI-only in this phase)

**Why Zustand over React Context:** no provider-tree nesting, selective subscriptions avoid unnecessary re-renders (critical for something like `useUIStore` read by many components), and minimal API surface keeps the pattern easy for any engineer joining the project to learn in minutes. **Why Zustand over Redux Toolkit:** the UI-state slice here is small and doesn't need Redux's middleware/devtools ceremony; TanStack Query already owns the complex async-state half of what Redux would otherwise be asked to do.

**Persistence:** `useSessionStore` and `usePreferencesStore` persist to `localStorage` via Zustand's `persist` middleware (theme and onboarding state should survive a refresh); `useUIStore` does not persist (transient by nature).

## 4. Form State — React Hook Form + Zod

Every create/edit form (Task, Goal, Habit, Event, Note, and every post-MVP domain) is built with React Hook Form for performant, uncontrolled-by-default field management, and a Zod schema per form for validation. The Zod schema is co-located with the domain's `types.ts` and is intentionally the **same shape** used to validate repository input — meaning form validation and (future) API payload validation share one schema, eliminating drift between client and eventual server validation.

## 5. URL State — React Router Search Params

Any state that affects *what the user sees in a collection view* (filters, sort, active tab, calendar date/view) lives in the URL via `useSearchParams`, not in Zustand or component state. This makes every filtered/sorted view shareable and back-button-correct, and is the same pattern already implied by the URL structure in [06_Information_Architecture.md](06_Information_Architecture.md) §7 and [15_Routing_Strategy.md](15_Routing_Strategy.md).

## 6. What Explicitly Does Not Get Global State

Hover/focus/open-close-of-a-single-dropdown, drag state during a single interaction, and animation-trigger flags stay local `useState` inside the component that owns them. Promoting these to a global store is treated as an architecture smell during code review.

## 7. Decision Table (quick reference for engineers)

> "Does this state come from (or feel like it comes from) the data layer?" → TanStack Query.
> "Should this be shareable via URL / survive a back-button press?" → URL search params.
> "Is this UI chrome/preference shared across many unrelated components?" → Zustand.
> "Is this only relevant to a single form?" → React Hook Form.
> "Is this only relevant to a single component instance?" → local `useState`.
