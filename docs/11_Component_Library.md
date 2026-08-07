# 11 — Component Library

## 1. Foundation

The component library is built on **shadcn/ui** (Radix UI primitives + Tailwind CSS v4), not a closed component npm package. This is a deliberate architectural choice:

- shadcn/ui components are copied into the repo (`/src/components/ui`) as owned source code, not installed as an opaque dependency — meaning they can be themed, restructured, and deeply customized to avoid the "generic shadcn app" look the design mandate explicitly warns against.
- Radix primitives underneath provide correct accessibility behavior (focus trapping, ARIA roles, keyboard interaction) for free, which is otherwise expensive to get right for things like Dialog, Popover, Combobox, and Menu.
- Every shadcn primitive is re-themed against the tokens in [08_Design_System.md](08_Design_System.md) before first use — never used with default shadcn styling.

## 2. Three-Tier Component Model

| Tier | Location | Description | Examples |
|---|---|---|---|
| **Tier 1 — Primitives** | `/src/components/ui` | shadcn-derived, fully themed base elements. No domain knowledge. | Button, Input, Select, Dialog, Sheet, Popover, Tooltip, Badge, Avatar, Checkbox, Switch, Tabs, Toast |
| **Tier 2 — Shared Composites** | `/src/components/shared` | App-aware but domain-agnostic. Compose Tier 1. | AppCard, EmptyState, PageHeader, QuickAddBar, CommandPalette, StatTile, ProgressRing, StreakHeatmap, FilterBar, ConfirmDialog |
| **Tier 3 — Feature Components** | `/src/features/{domain}/components` | Domain-specific, compose Tiers 1–2. | TaskRow, TaskBoard, GoalCard, HabitStreakCard, CalendarMonthGrid, NoteEditor |

Full folder mapping in [12_Folder_Architecture.md](12_Folder_Architecture.md).

## 3. Tier 1 Primitive Inventory (initial set)

Button (variants: primary, secondary, ghost, destructive, icon — sizes: sm/md/lg), Input, Textarea, Select, Combobox, Checkbox, Radio Group, Switch, Slider, Date Picker, Tag/Chip, Badge, Avatar, Tooltip, Popover, Dropdown Menu, Context Menu, Dialog (Modal), Sheet (Bottom Sheet / Side Drawer), Tabs, Accordion, Toast/Notification, Skeleton, Progress Bar, Separator, Card, Table (for dense data, e.g. future Finance).

## 4. Tier 2 Shared Composite Specs

- **AppCard** — the base card used across every domain (task rows, note cards, goal cards inherit from it). Encodes elevation, radius, padding, and hover/press states once.
- **EmptyState** — icon/illustration slot, headline, subtext, primary action slot. Used by every domain per [05_User_Journeys.md](05_User_Journeys.md) Journey F.
- **PageHeader** — title, optional subtitle, contextual action slot (right-aligned), view-toggle slot. Used at the top of every collection screen.
- **QuickAddBar** — the natural-language capture input, used in the FAB sheet, sidebar, and command palette.
- **CommandPalette** — global ⌘K surface, described in [10_Navigation_Architecture.md](10_Navigation_Architecture.md).
- **StatTile** — a single metric with label, value, optional trend indicator; the atomic unit of Dashboard and future Analytics.
- **ProgressRing / ProgressBar** — used for Goal completion, Habit streak targets.
- **StreakHeatmap** — calendar-style heatmap for Habit history.
- **FilterBar** — consistent filter/sort/search control row for all collection views.
- **ConfirmDialog** — standardized destructive-action confirmation (delete task, delete note, etc.), single implementation reused everywhere so confirmation UX never diverges by domain.
- **SkeletonBlock variants** — matching skeleton shapes for each Tier 2/3 component that loads async data (see [18_Performance_Strategy.md](18_Performance_Strategy.md)).

## 5. Tier 3 Feature Component Pattern

Every domain follows the same internal composition pattern for predictability:

```
{Domain}CollectionView    → PageHeader + FilterBar + list/board of {Domain}Row/Card
{Domain}Row / {Domain}Card → AppCard + domain-specific content + quick actions
{Domain}DetailView        → breadcrumb + editable fields + related-entity section
{Domain}FormDialog/Sheet  → React Hook Form + Zod, used for both create and edit
{Domain}EmptyState        → EmptyState with domain copy/illustration
```

This means a new domain (e.g., Finance in Phase 2) is largely an exercise in filling a known template, not inventing new patterns — directly supporting the "designed so integrations/additions don't change the architecture" requirement.

## 6. Component States (mandatory for every interactive/data component)

Every Tier 2/3 component that displays data must explicitly design for: **Loading** (skeleton, never a spinner-only blank screen for primary content), **Empty**, **Populated**, **Error** (inline, actionable — never a silent failure), and where relevant, **Offline/stale** (a subtle indicator, forward-compatible with real sync). This is enforced as a component acceptance checklist, not left to individual implementation discretion.

## 7. Documentation & Isolation

Tier 1 and Tier 2 components are developed and visually verified in **Storybook** in isolation before being consumed by Tier 3 feature code (see [25_Testing_Strategy.md](25_Testing_Strategy.md)). This catches visual inconsistency before it reaches a full screen and gives design a review surface independent of application state/routing.

## 8. Theming Mechanism

All components consume color/spacing/radius/motion exclusively via CSS custom properties mapped from Tailwind v4 `@theme` tokens (see [08_Design_System.md](08_Design_System.md)) — never hard-coded Tailwind color utility classes like `bg-indigo-600` directly in feature code. This is enforced via lint rule (restricted Tailwind class patterns) so theming/rebranding or a future white-label variant never requires a component rewrite.

## 9. Motion Wrapper Convention

Framer Motion usage is standardized through a small set of shared primitives (`<FadeIn>`, `<SlideUp>`, `<StaggerList>`) built once in `/src/components/shared/motion` rather than ad-hoc `motion.div` configuration scattered per feature — keeping animation timing/easing consistent with [08_Design_System.md](08_Design_System.md) §7 and easy to globally tune. (A route-level `<PresenceRoute>` cross-fade was attempted and reverted — see [28_Mobile_First_Architecture.md](28_Mobile_First_Architecture.md); route content renders via a plain `Outlet`.)
