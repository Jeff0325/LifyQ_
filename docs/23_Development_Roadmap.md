# 23 — Development Roadmap

This document sequences *how* the MVP (and beyond) gets built, in milestones — the execution plan underneath [07_Feature_Roadmap.md](07_Feature_Roadmap.md)'s *what*. Milestones are sized for planning purposes, not calendar-committed, since actual velocity depends on team size (not yet known at documentation time).

## Milestone 0 — Project Foundation
- Vite + React 19 + TypeScript strict scaffold, pnpm workspace
- Tailwind v4 configured with the full token set from [08_Design_System.md](08_Design_System.md) (`@theme`)
- ESLint/Prettier configured with the architectural lint rules referenced throughout (no deep cross-feature imports, no raw Tailwind color utilities, `jsx-a11y` enabled)
- Folder skeleton per [12_Folder_Architecture.md](12_Folder_Architecture.md) committed with placeholder `index.ts` files
- Router shell (`RootLayout` → `AuthLayout` → `AppShell`) per [15_Routing_Strategy.md](15_Routing_Strategy.md), rendering an empty Dashboard placeholder
- Vercel project connected, preview deployments verified working
- CI pipeline: install, typecheck, lint, test, build, on every PR

**Exit criteria:** an empty but deployed, correctly-chrome'd, theme-toggleable app shell live on a Vercel preview URL.

## Milestone 1 — Design System & Component Library
- Tier 1 primitives themed (shadcn components re-skinned per design tokens)
- Tier 2 shared composites built: AppCard, EmptyState, PageHeader, QuickAddBar (non-functional shell), CommandPalette (shell), StatTile, ProgressRing, FilterBar, ConfirmDialog, Skeleton variants
- Storybook set up, every Tier 1/2 component documented with states (default, hover, focus, disabled, loading where relevant)
- Motion wrapper primitives (`FadeIn`, `SlideUp`, `StaggerList`) built — a fourth, `PresenceRoute` (route-level cross-fade), was attempted in Milestone 3 and reverted; see [28_Mobile_First_Architecture.md](28_Mobile_First_Architecture.md)

**Exit criteria:** a designer/engineer can assemble a plausible new screen entirely from Storybook-documented components without writing new primitive styles.

## Milestone 2 — Data Layer Foundation
- Repository pattern scaffolding: base interfaces, repository factory, config module (`VITE_DATA_SOURCE`)
- MSW configured with baseline handler structure
- TanStack Query provider + devtools wired into `RootLayout`
- Zustand stores scaffolded (`useUIStore`, `useSessionStore`, `usePreferencesStore`)
- One reference domain (Tasks) fully implemented end-to-end (types, Zod schema, mock repository, seed data, query/mutation hooks) as the template for every subsequent domain

**Exit criteria:** Tasks domain works end-to-end against the mock repository with realistic latency/loading/error states, serving as the copy-paste template for all remaining domains.

## Milestone 3 — MVP Domain Build-Out
Built in this order (dependency-aware — Goals before Habits/Calendar since both link to Goals; Calendar last among these since it aggregates Task/Habit data):
1. Goals
2. Habits
3. Calendar
4. Notes
5. Dashboard (built after the above exist, since it aggregates all of them)
6. AI Assistant (mock engine + chat UI)
7. Onboarding
8. Settings

**Exit criteria:** full MVP acceptance criteria from [22_MVP_Definition.md](22_MVP_Definition.md) §4 met for all nine domains/flows.

## Milestone 4 — Hardening
- Full responsive QA pass against the device matrix ([20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) §8)
- Full accessibility audit (automated + manual, [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) §9)
- Performance pass against Lighthouse targets ([18_Performance_Strategy.md](18_Performance_Strategy.md) §1), bundle-size budget verification
- E2E test suite covering all journeys in [05_User_Journeys.md](05_User_Journeys.md) (see [25_Testing_Strategy.md](25_Testing_Strategy.md))
- Cross-browser verification (Chrome, Safari, Firefox, Edge — Safari specifically for iOS-safe-area and backdrop-blur correctness)

**Exit criteria:** MVP is demo-ready and defensible against the design mandate in the founding brief — "looks like a premium app I'd happily use every day."

## Milestone 5+ — Post-MVP (see [07_Feature_Roadmap.md](07_Feature_Roadmap.md) for phase content)
- Phase 2 — Life Administration (Projects, Finance, Bills, Subscriptions, Life Records, Documents, Grocery Lists, Journal, Reminders), Phase 3 — Insight & Wellness Layer (Health, Analytics), Phase 4 (Supabase backend integration), Phase 5 (Stripe payments, real AI), Phase 6 (Capacitor native) — each phase repeats the Milestone 2→4 pattern (data layer → build-out → hardening) at its own scope, since the architecture is designed for exactly this repeatable cycle. Phase 2 grew from four modules to nine when LifyQ's scope expanded from a productivity tool to a life-management platform; the repeatable cycle absorbed that without changing shape.

## Definition of Done (applies to every feature/PR, not just milestones)

A unit of work is "done" only when it satisfies, together: design-system token compliance ([08_Design_System.md](08_Design_System.md) §12 checklist / [09_Brand_Guidelines.md](09_Brand_Guidelines.md) §8 checklist), all component states implemented ([11_Component_Library.md](11_Component_Library.md) §6), responsive verification, accessibility checks passing, tests written per [25_Testing_Strategy.md](25_Testing_Strategy.md), and code review approval per [24_Git_Workflow.md](24_Git_Workflow.md).
