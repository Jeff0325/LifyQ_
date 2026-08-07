# 10 — Navigation Architecture

## 1. Principle

Navigation must feel native to whatever device it's on — bottom tabs on mobile, a persistent sidebar on desktop — while resolving to the exact same routes and information architecture ([06_Information_Architecture.md](06_Information_Architecture.md)). One route tree, multiple chrome presentations.

## 2. Breakpoint-Specific Navigation Shells

### 2.1 Mobile (< 1024px / `lg` breakpoint down)
- **Bottom Tab Bar**, fixed, glass surface (`surface-overlay` + blur, per [08_Design_System.md](08_Design_System.md) §2.5), safe-area-inset-aware.
- 5 slots max (hard constraint for thumb reach and visual clarity): **Home, Tasks, Jarvis, Goals, More**. Jarvis is not a routed tab like the other four — it's a distinctive, elevated, brand-gradient center button that opens the floating companion (§4, docs/39 addendum) rather than navigating anywhere. "More" opens a sheet listing remaining Tier-1/Tier-2 domains (Habits, Notes, Calendar, and post-MVP additions).
- **Floating Action Button (FAB)**, positioned above the tab bar (bottom-right, thumb-reachable), opens Quick Add. Present on Dashboard, Tasks, Notes, Calendar.
- Domain switch = full-bleed screen transition (slide, `duration-moderate`); drill-in to detail = push transition (slide-from-right, back-swipe enabled).

### 2.2 Tablet (1024px – 1279px)
- **Collapsible/icon-only left rail** (72px wide, icons only, tooltips on hover/long-press) by default, expandable to labeled sidebar via a persistent toggle — tablet users get desktop-like navigation without sacrificing canvas width, since tablet is often used in split-view/landscape.
- Quick Add accessible via a persistent rail button, not a FAB (FAB is a mobile-only pattern).

### 2.3 Desktop (≥ 1280px)
- **Persistent left sidebar**, 240px expanded / 72px collapsed (user-toggleable, state persisted), grouped: primary domains, then a divider, then Settings/Profile at the bottom.
- **Global command palette** (⌘K / Ctrl+K) is the primary desktop navigation accelerant — search + navigate + quick-create in one surface, glass overlay, `elevation-5`.
- Secondary/contextual domains (Tier 2) appear in the sidebar under a collapsible "More" group rather than being hidden behind a sheet (desktop has room; mobile does not).

## 3. Global Systems Present at Every Breakpoint

| System | Mobile | Tablet/Desktop |
|---|---|---|
| Quick Add | FAB | Rail/sidebar button + keyboard shortcut (`Q`) |
| Search | Icon in top bar → full-screen search sheet | ⌘K command palette |
| Jarvis | Center tab-bar button → floating companion | Sidebar row + TopBar Sparkles trigger → floating companion |
| Notifications (post-MVP) | Icon in top bar → sheet | Icon in sidebar/topbar → popover |
| Profile/Settings | Inside "More" sheet | Bottom of sidebar |

## 4. Jarvis Placement — the Floating Companion (supersedes the original "docked panel + full page" plan)

**Superseded by docs/39 addendum ("Jarvis as the Center of LifyQ").** The original plan below (a docked side panel plus a dedicated `/assistant` full page) was replaced before either shipped as separate surfaces — Jarvis is instead **one persistent, minimizable floating companion**, mounted once at the app root (`JarvisRoot`, sibling of the routed content) so it survives every navigation without losing conversation state:

- **Minimized**: a small brand-gradient chat-head bubble, fixed above the bottom tab bar (mobile) or bottom-right (desktop) — reachable from literally any screen.
- **Expanded**: a bottom-sheet (mobile) or floating card (desktop) conversation panel, opened by the chat head, the BottomNav center button, the Sidebar's Jarvis row, or `TopBar`'s Sparkles trigger — every entry point opens the *same* panel, not different surfaces.
- **First launch only**: a one-time animated introduction plays before the conversation view, never again after (`hasSeenIntro`, persisted).
- `/assistant` and `/capture` remain valid, deep-linkable URLs for backward compatibility, but both now redirect to the floating companion rather than rendering their own page — see [06_Information_Architecture.md](06_Information_Architecture.md) §7.

This is a stronger claim than the original "fast, contextual, always one keystroke/tap away" framing — Jarvis is not a mode you enter and leave per-screen, it is one continuous session for the whole app visit.

## 5. Top Bar (contextual per screen)

Persists across breakpoints as a slim contextual header: current section title, primary contextual action (e.g., "New Task" on Tasks), view toggles (List/Board), and search entry point. On mobile it collapses/hides on scroll-down and reappears on scroll-up to maximize content area (a native-feeling pattern), respecting `prefers-reduced-motion` by disabling the hide/show transition when set.

## 6. Bottom Sheets & Modals — When Each Is Used

- **Bottom sheet** (slides from bottom, draggable-to-dismiss, glass scrim): used on mobile for Quick Add, filters, item detail previews, and any "temporary focused task" that shouldn't leave the current screen's context.
- **Full modal/dialog** (centered, scrim): used on tablet/desktop for the same interactions where a bottom sheet pattern isn't native; used on all breakpoints for confirmations (delete, discard) and forms that require full attention (create Goal, create Habit).
- **Full page/route**: used for primary content editing that deserves its own back-stack entry (Note editor, Task/Goal/Habit detail, Settings sub-pages) — never modal-only, so these are always deep-linkable and shareable via URL.

## 7. Wayfinding & Breadcrumbing

Because entities are cross-linked (Goal → Project → Task), every detail view shows a lightweight parent-chain breadcrumb/back-context (e.g., a small pill above a Task's title reading "Project: Marathon Training" that is itself tappable) so the user always understands *why* an item exists, reinforcing the entity-graph principle from [06_Information_Architecture.md](06_Information_Architecture.md).

## 8. Navigation State Persistence

Scroll position, active filters/sort, and expanded/collapsed card states persist when navigating away and back within a session (via route state / Zustand UI store, see [14_State_Management_Strategy.md](14_State_Management_Strategy.md)) — directly supporting Priya's journey requirement in [05_User_Journeys.md](05_User_Journeys.md) Journey D.

## 9. Keyboard Navigation (desktop)

Full keyboard operability is required, not optional: `⌘K` command palette, `Q` quick add, `/` focus search, `Esc` closes any overlay, arrow-key list navigation, `Enter` to open focused item. Detailed in [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md).
