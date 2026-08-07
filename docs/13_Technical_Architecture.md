# 13 — Technical Architecture

## 1. Architectural Goal

Build a frontend that is **structurally indistinguishable from a fully backed application** — every screen, hook, and component talks to an abstracted data layer through typed async interfaces. Swapping mock data for Supabase later is a matter of writing new implementations of existing interfaces, not rewriting UI. This single idea — the **Repository Pattern** — is the backbone of the entire technical architecture and is what makes the "no backend now, real backend later, no rewrite" requirement achievable.

## 2. Confirmed Technology Stack

| Layer | Choice | Why |
|---|---|---|
| UI Library | React 19 | Given; modern concurrent features, Actions/`useOptimistic` useful even against mock async data |
| Build tool | Vite 6+ | Given; fastest DX-to-build pipeline for a React SPA, first-class Vercel support |
| Language | TypeScript (strict mode) | Non-negotiable for a data-modeled app this size; catches domain-shape drift at compile time |
| Styling | Tailwind CSS v4 | Given; CSS-first `@theme` config maps cleanly to the design token system in [08_Design_System.md](08_Design_System.md) |
| Component primitives | shadcn/ui (Radix) | Given; see [11_Component_Library.md](11_Component_Library.md) |
| Motion | Framer Motion (`motion/react`) | Given; layout animations + gesture support needed for bottom sheets, drag-to-dismiss, drag-reorder |
| Routing | React Router v7 (declarative/data mode, client-side) | Given ecosystem choice; v7's data APIs (loaders-compatible shape) ease a future migration to server data-loading if ever needed, without requiring SSR now |
| Server-state / async data | **TanStack Query v5** | See §4 — the critical seam for the mock→real swap |
| Client/UI state | **Zustand** | Minimal boilerplate, no context-provider tree needed, ideal for cross-cutting UI state (sidebar, theme, active sheet, mock session) |
| Forms | **React Hook Form + Zod** | Performant uncontrolled forms, schema validation reusable for both client-side checks now and API payload validation later |
| Network mocking | **MSW (Mock Service Worker)** | Intercepts at the network layer so the app *behaves* as if calling real HTTP endpoints, even in mock phase — see §5 |
| Icons | Lucide | Pairs natively with shadcn/ui |
| Dates | date-fns | Tree-shakeable, immutable, no Moment.js legacy weight |
| Package manager | pnpm | Fast, disk-efficient, strict dependency resolution (catches phantom-dependency bugs early) |
| Lint/format | ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier | Enforces the architectural rules in this doc set (e.g., no cross-feature deep imports) via custom lint rules |
| Testing | Vitest, React Testing Library, Playwright, Storybook | See [25_Testing_Strategy.md](25_Testing_Strategy.md) |
| Hosting | Vercel | Given; zero-config Vite SPA deploys, preview deployments per PR, edge network |
| Future backend | Supabase (Postgres, Auth, Storage, Realtime) | Given; see §6 |
| Future native | Capacitor | Given; see §8 |
| Future payments | Stripe (Billing + Customer Portal) | Standard, PCI burden offloaded entirely to Stripe — see [17_Security_Plan.md](17_Security_Plan.md), [21_Monetization_Strategy.md](21_Monetization_Strategy.md) |

## 3. Layered Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Pages / Feature Components (React)          │  ← UI, no data-fetching logic itself
├─────────────────────────────────────────────┤
│  Feature Hooks (TanStack Query)              │  ← useTasks(), useCreateTask(), etc.
├─────────────────────────────────────────────┤
│  Repository Interfaces (per domain)          │  ← TasksRepository, GoalsRepository, ...
├─────────────────────────────────────────────┤
│  Repository Implementations                  │  ← MockTasksRepository (now) / SupabaseTasksRepository (later)
├─────────────────────────────────────────────┤
│  Data Source                                 │  ← In-memory + localStorage (now) / Postgres via Supabase client (later)
└─────────────────────────────────────────────┘
```

Components never import a repository implementation directly — they call feature hooks, which call whatever implementation the repository factory currently resolves to.

## 4. The Repository Pattern (the core seam)

Every domain defines an interface, e.g.:

```ts
// features/tasks/repository.ts
export interface TasksRepository {
  list(filter?: TaskFilter): Promise<Task[]>;
  get(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, input: UpdateTaskInput): Promise<Task>;
  remove(id: string): Promise<void>;
}
```

In this phase, `MockTasksRepository` implements this interface over in-memory/localStorage-persisted seed data, with **simulated network latency (150–600ms randomized)** and **simulated occasional error injection (configurable, off by default)** so that loading and error states are exercised honestly during development rather than only in theory. A repository factory (`getTasksRepository()`) resolves which implementation to hand back, gated by an environment flag (`VITE_DATA_SOURCE=mock`, later `=supabase`). Feature hooks (`useTasks`) call the factory, never a concrete class — so Phase 4 backend work is: write `SupabaseTasksRepository`, flip the flag, done. No component, hook signature, or page changes.

Full data shapes and the per-domain interface list are in [16_Data_Model_Plan.md](16_Data_Model_Plan.md). State-layer usage of these repositories is detailed in [14_State_Management_Strategy.md](14_State_Management_Strategy.md).

## 5. Why MSW in Addition to the Repository Pattern

The repository pattern abstracts *how components ask for data*. MSW additionally simulates *the network itself* for any code path that should behave as if it's hitting HTTP (useful for the AI Assistant's mocked "API calls," and for realistic Storybook/Playwright fixtures independent of the repository's in-memory state). Using both means the app's runtime behavior — loading spinners, retry logic, offline handling — is validated against real request/response semantics now, not invented in Phase 4 under deadline pressure.

## 6. Forward Compatibility: Supabase (Phase 4)

The data model ([16_Data_Model_Plan.md](16_Data_Model_Plan.md)) is deliberately shaped to map cleanly onto normalized Postgres tables (one table per entity, foreign keys for the relationships in [06_Information_Architecture.md](06_Information_Architecture.md) §4). When Phase 4 begins: Supabase Auth replaces the mock session store, Row-Level Security policies enforce per-user data isolation, and `Supabase{Domain}Repository` classes are implemented against the same interfaces. Realtime subscriptions (Supabase Realtime) later back the "Cloud Sync" UI affordance that already exists visually in this phase.

## 7. Forward Compatibility: AI Assistant (Jarvis) and the Intelligent Capture Engine

**Superseded/expanded by [34_AI_Architecture.md](34_AI_Architecture.md) and [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) — read those for the current architecture.** Summary: the AI Assistant, renamed Jarvis under the AI-first repositioning ([01_Product_Vision.md](01_Product_Vision.md) §7), is built against an `AIProvider` interface with two methods — `converse()` (this section's original `sendMessage`, unchanged in shape) and `extract()` (new, serves the Intelligent Capture Engine). `MockICEEngine` implements both now with scripted/pattern-matched logic; Phase 5 swaps in a real vendor implementation (`OpenAIProvider`, `AnthropicProvider`, etc., selected by config) behind the same interface — the chat UI, streaming-reveal animation, conversation state management, and (new) the ICE confirmation-sheet UI require no changes when that swap happens.

The `AssistantEngine` name and its original single-method shape are retired in favor of `AIProvider` — this is a rename/extension of the same seam described in this section originally, not a competing architecture.

## 8. Forward Compatibility: Capacitor (Phase 6)

Because the app is a standard responsive SPA with no server-rendering dependency, Capacitor can wrap the built static output directly. Architectural precautions taken now: no direct `window`/`document` assumptions that break in a WebView, all navigation via React Router (no hard page reloads), and touch-first interaction patterns already in place per [10_Navigation_Architecture.md](10_Navigation_Architecture.md) — meaning Phase 6 is primarily a packaging and native-API-bridging effort (push notifications, biometrics), not a UI rebuild.

## 9. Environment & Configuration

A single `/src/config` module reads `import.meta.env` variables (`VITE_DATA_SOURCE`, `VITE_APP_ENV`, future `VITE_SUPABASE_URL`, etc.) and exposes a typed, validated config object (Zod-parsed at boot, fails fast with a clear error rather than undefined-propagating through the app). No `import.meta.env` access occurs outside this module.

## 10. Reminder Engine (Cross-Cutting Service) and New Domain Module Design

Added when LifyQ expanded from a productivity tool into a life-management platform (Life Records, Bills, Subscriptions, Documents, Health, Grocery Lists). Both concerns below are **design-only in this phase** — no code exists yet for either; they're documented now so implementation, when it happens, has one agreed shape instead of six ad hoc ones.

### 10.1 Reminder Engine
A module with a future-relevant date (`LifeRecord.expiresAt`, `Bill.dueDate`, `Subscription.nextRenewalAt`, `Medicine.refillReminderAt`, `HealthEvent.nextDueDate`) never schedules its own notification. Instead, it's read by one shared service — conceptually `src/lib/reminderEngine.ts`, a peer to the existing `src/lib/date.ts` utility — that materializes `Reminder` entities ahead of the trigger date. This is the same "one shared implementation, not six copies" reasoning that produced `src/lib/date.ts` during Milestone 4 (see [30_Core_Feature_Implementation.md](30_Core_Feature_Implementation.md) §6), applied proactively this time instead of discovered via a lint pass.

In the mock phase, this is a pure derived computation (like `Goal.progress` or `Habit.currentStreak` — computed at read time via `deriveOnRead`, never stored, per [16_Data_Model_Plan.md](16_Data_Model_Plan.md) §6), not a real scheduler. The Reminders domain, Calendar, and Notifications Inbox are three different **views** over the same engine output — none of them owns reminder logic itself.

### 10.2 Repository Pattern — unchanged for new modules
Life Records, Bills, Subscriptions, Documents, Health (Medicine/HealthEvent/VitalReading/Allergy), and Grocery Lists each get a repository satisfying the identical `Repository<T, TCreate, TUpdate>` interface every existing domain already uses (§4). No new pattern was introduced for them — this is a deliberate constraint, not an oversight: a module that needed bespoke data-access architecture would be a signal it doesn't actually fit the domain model, not a reason to special-case it.

### 10.3 API & Resource Design (Phase 4 preview)
Since no real backend exists yet, "API design" at this phase is the repository interface (§4) plus the future Supabase resource shape each mock repository will map onto directly:

| Module | Mock `storageKey` | Future Supabase table | Key relationships |
|---|---|---|---|
| Life Records | `lifyq.life-records` | `life_records` | `document_ids[]` → `documents` |
| Bills | `lifyq.bills` | `bills` | embedded `paid_history` (jsonb) |
| Subscriptions | `lifyq.subscriptions` | `subscriptions` | none required |
| Documents | `lifyq.documents` | `documents` | `linked_entities` (polymorphic, jsonb or join table) |
| Health — Medicines | `lifyq.medicines` | `medicines` | none required |
| Health — Events | `lifyq.health-events` | `health_events` | none required |
| Health — Vitals | `lifyq.vitals` | `vital_readings` | none required |
| Health — Allergies | `lifyq.allergies` | `allergies` | none required |
| Grocery Lists | `lifyq.grocery-lists` | `grocery_lists` | embedded `items` (jsonb, mirrors `Task.subtasks`) |

Every row above gets Supabase Row-Level Security scoped to `user_id` identically to the existing MVP domains (§6) — nothing here needs a different auth/isolation model.

### 10.4 AI Engine (ICE / Jarvis)
No new interface — §7's `AIProvider` already generalizes. Each new module's repository becomes another sanctioned data source Jarvis's `converse()` can query *and* another sanctioned write target `extract()` proposals can route to (always confirm-gated, [34_AI_Architecture.md](34_AI_Architecture.md) §2–3), the same way `mockAssistantEngine.ts`/`MockICEEngine` already reads Tasks/Goals/Habits/Calendar directly (per the cross-feature exception in [12_Folder_Architecture.md](12_Folder_Architecture.md) §5). A new module's only ICE-specific addition is one row in [35_Intelligent_Capture_Engine_Spec.md](35_Intelligent_Capture_Engine_Spec.md) §5's routing table — its existing Zod schema and mutation hook, required regardless of ICE, are all extraction needs.

## 11. Non-Goals of This Architecture (explicitly rejected approaches)

- **Not Next.js / SSR.** No server-rendering requirement exists yet (no auth-gated SEO content, no backend to render against); adopting SSR now would add deployment and data-fetching complexity for no present benefit, and can be revisited if marketing/SEO needs emerge later without blocking this phase.
- **Not Redux.** Given the async-state/UI-state split described in §2, Redux's centralized-store model is unnecessary ceremony; TanStack Query + Zustand covers both concerns with far less boilerplate.
- **Not a monorepo.** A single Vite app is sufficient at this scope; monorepo tooling (Turborepo/Nx) is deferred until/unless a second deployable (e.g., a marketing site or admin tool) actually exists.
