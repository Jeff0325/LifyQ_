# 12 — Folder Architecture

## 1. Guiding Principle

**Feature-based (domain-driven), not type-based.** Code is organized primarily by what it's about (tasks, goals, habits) rather than what kind of file it is (all hooks together, all components together). This scales to 15 pillars without any single folder becoming unmanageable, and it means a domain can be added, removed, or handed to a new engineer as a near-self-contained unit. Cross-cutting, domain-agnostic code lives in clearly separated shared locations.

## 2. Top-Level Structure

```
/src
  /app                 — application shell: root providers, router setup, global layout composition
  /pages               — thin route-level components; compose feature components, own no business logic
  /features            — one folder per domain pillar (see §3)
  /components
    /ui                — Tier 1 primitives (shadcn-derived design system atoms)
    /shared             — Tier 2 shared composites (AppCard, EmptyState, CommandPalette, motion wrappers, etc.)
  /layouts             — AppShell, AuthLayout (stubbed), MobileTabLayout, DesktopSidebarLayout
  /data                — repository pattern: interfaces + mock implementations (see 13, 16)
  /mocks               — MSW request handlers, seed/fixture generators
  /stores              — global Zustand stores (ui, session, preferences)
  /hooks               — global reusable hooks (useMediaQuery, useDebounce, useLocalStorage, etc.)
  /lib                 — pure utility functions (formatters, date helpers, class-name merge, id generation)
  /types               — shared/global TypeScript types and cross-domain entity relationship types
  /constants           — enums, route paths, feature flags, config constants
  /styles              — Tailwind entry, `@theme` token definitions, global CSS
  /assets              — static images, the illustration set, favicon, manifest icons
  /test                — test setup, shared test utilities, render helpers
  main.tsx
  App.tsx
```

## 3. Feature Folder Anatomy (applies identically to every domain — Tasks, Goals, Habits, Calendar, Notes, and every post-MVP domain)

```
/features/tasks
  /components         — TaskRow, TaskBoard, TaskDetail, TaskFormDialog, TaskEmptyState
  /hooks              — useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask (TanStack Query hooks)
  /types.ts           — Task, TaskStatus, TaskPriority, CreateTaskInput, etc.
  /repository.ts      — TasksRepository interface + repository-factory wiring (see 13)
  /mock/
    mockTasksRepository.ts
    seedTasks.ts
  /utils.ts           — domain-local pure helpers (sort/group logic specific to tasks)
  index.ts            — public exports consumed by /pages and other features
```

**Rule:** other features and `/pages` only ever import from a feature's `index.ts` (its public surface), never reach into another feature's internal files. This keeps domains decoupled enough that Finance (Phase 2) can be added without risk to Tasks (Phase 1).

## 4. Why Not Type-Based (`/components`, `/hooks`, `/services` all flat)

A flat, type-based structure is common in small apps but breaks down specifically at LifyQ's scale (15 domains): a single `/hooks` folder would eventually hold 60+ files with no natural grouping, and any engineer working on one domain would wade through unrelated code to find what they need. Feature-based structure is the industry-recommended pattern at this scale (used by Linear, and recommended in official React and Redux Toolkit style guides for non-trivial apps) and maps 1:1 to how the product itself is organized (pillars), which keeps the codebase's mental model identical to the product's mental model.

## 5. Where Cross-Domain Logic Lives

Logic that spans multiple domains (e.g., the Dashboard aggregating Tasks + Goals + Habits + Calendar, or Analytics aggregating everything) lives in `/pages` (for pure UI composition) or in a dedicated `/features/dashboard` / `/features/analytics` folder that is permitted to import from other features' public `index.ts` surfaces — this is the one sanctioned exception to feature isolation, since aggregation is these domains' entire purpose.

## 6. Path Aliases

TypeScript path aliases (`@/features/*`, `@/components/*`, `@/data/*`, `@/lib/*`, etc.) are configured in `tsconfig.json` and mirrored in `vite.config.ts` — no deep relative imports (`../../../..`) anywhere in the codebase.

## 7. Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Types/interfaces: `PascalCase`, file `types.ts` per feature
- Repository files: `{domain}Repository.ts` (interface), `mock{Domain}Repository.ts` (implementation)
- Test files: colocated as `ComponentName.test.tsx` / `hookName.test.ts` next to the file under test

## 8. Barrel Export Discipline

Only feature-root `index.ts` files act as barrels. Barrels are not used inside `/components/ui` (import shadcn primitives directly by file) to keep tree-shaking predictable and avoid circular-import risk as the primitive count grows.

## 9. Forward Compatibility Notes

- `/data` is the single seam that changes when Supabase is introduced (Phase 4) — see [13_Technical_Architecture.md](13_Technical_Architecture.md). No other folder should require structural change.
- `/layouts/AuthLayout` exists from day one as a stub even though there is no real auth yet, so the route tree's shape doesn't change when real auth lands (Phase 4) — see [15_Routing_Strategy.md](15_Routing_Strategy.md).
