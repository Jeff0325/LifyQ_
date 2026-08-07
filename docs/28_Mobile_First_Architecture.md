# 28 — Mobile-First Application Shell (Milestone 3)

This document records what was built for the mobile-first application shell and why. It extends [10_Navigation_Architecture.md](10_Navigation_Architecture.md) and [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) (which set the intent during planning) with what was actually implemented, plus the platform-target decisions specific to this milestone: React Web, installable PWA, and future Android/iOS via Capacitor.

## 1. Scope Reconciliation: Navigation IA Update

The founder's brief for this milestone specifies six primary sections — **Home, AI, Tasks, Goals, Calendar, Profile** — which differs from the seven-item MVP set in [22_MVP_Definition.md](22_MVP_Definition.md) (which included Habits and Notes, and used "Settings" rather than "Profile"). This milestone follows the explicit, more recent brief:

- `PRIMARY_NAV_ITEMS` (`src/constants/navigation.ts`) is now exactly Home, AI, Tasks, Goals, Calendar, Profile — all six `enabled: true`, each with a real placeholder route and page.
- Habits, Notes, and Settings are **not deleted from the architecture** — they simply aren't in the nav right now. The `enabled: false` rendering path (disabled row + "Soon" badge, in both `Sidebar` and `BottomNav`'s "More" panel) is kept fully intact specifically so these — or Finance, Health, or any future pillar — can be reintroduced the same way Assistant/Tasks/Goals/Calendar were in Milestone 1, without touching the navigation component code.
- `ROUTES` (`src/constants/routes.ts`) was correspondingly narrowed to: `splash`, `onboarding`, `home`, `ai`, `tasks`, `goals`, `calendar`, `profile`. The AI route path is `/ai` (renamed from Milestone 1's `/assistant`) to match the founder's terminology exactly.

## 2. Application Layout

### 2.1 Root layout & providers
Unchanged in structure from Milestone 1/2 (`RootLayout` → `AuthLayout` → `AppShell`, see [15_Routing_Strategy.md](15_Routing_Strategy.md) §2), with two additions this milestone:
- `useKeyboardInset()` (new, `src/hooks/useKeyboardInset.ts`) — mounted once in `RootLayout`.
- Two new public, full-bleed routes (`/splash`, `/onboarding`) that render **outside** `AppShell` entirely — see §4.

### 2.2 Mobile viewport handling
`index.html`'s viewport meta gained `viewport-fit=cover`. Without it, `env(safe-area-inset-*)` — already used throughout the shell since Milestone 1 (`BottomNav`, `Sheet`, `Toast`) — silently resolves to `0` on notched devices; the safe-area CSS was present but inert. This was a real gap, fixed now.

### 2.3 Safe area support
Every edge is now covered, not just the bottom:
- **Bottom:** `BottomNav`, `Sheet` (bottom variant), `ToastViewport`, `Splash`, `Onboarding` — via `env(safe-area-inset-bottom)` (already present since Milestone 1/2, extended to the two new screens).
- **Top:** `TopBar` gained `pt-[env(safe-area-inset-top)]` — new this milestone. Without it, a notch/status bar (in standalone PWA or Capacitor mode, where there's no browser chrome) would overlap the page title. `Splash`/`Onboarding` also pad both top and bottom since they render full-bleed with no `TopBar`.
- **Sidebar** intentionally does not add top/bottom safe-area padding — it's a desktop/tablet-only surface (`hidden lg:flex`) where notch overlap isn't a realistic concern at this breakpoint.

### 2.4 Responsive containers / mobile page wrapper
New: **`PageContainer`** (`src/components/shared/PageContainer.tsx`) — `size="sm"` (640px, reading/forms/placeholders) or `size="lg"` (1120px, dashboards/collections), per the content max-widths already specified in [08_Design_System.md](08_Design_System.md) §4 but never actually implemented as a component until now. Used by `Home`, `PlaceholderPage` (and therefore every placeholder route), and `Onboarding`. `AppShell`'s `<main>` keeps owning the outer edge padding (`px-4 sm:px-6`); `PageContainer` is the inner max-width constraint — two distinct, composable concerns.

New: **`PlaceholderPage`** (`src/components/shared/PlaceholderPage.tsx`) — the single component every application-route placeholder (`Ai`, `Tasks`, `Goals`, `Calendar`, `Profile`) renders. It takes only `icon`/`title`/`description` — no data, no interaction — so a placeholder route can never accidentally accrue feature logic before its real milestone begins.

### 2.5 Desktop & tablet adaptation
Unchanged mechanism from Milestone 1 (`Sidebar` rail collapsed at `lg`–`xl`, expanded at `xl`+, user-toggleable) — see [10_Navigation_Architecture.md](10_Navigation_Architecture.md) §2. This milestone adds the active-item indicator animation (§3.2) on top of that existing structure.

## 3. Navigation

### 3.1 Structure (unchanged from Milestone 1)
Bottom tabs + FAB-less tab bar below `lg`, persistent sidebar rail at `lg`+ — one route tree, two chrome presentations, per [10_Navigation_Architecture.md](10_Navigation_Architecture.md) §2. `MOBILE_TAB_ITEM_IDS` now selects **Home, AI, Tasks, Goals** as the four direct tabs (the four highest-frequency-touch sections); **Calendar and Profile** live in the "More" disclosure. This is a judgment call, not a mandate from any doc — flagged here for the founder to override if Calendar deserves a direct slot instead of Goals.

### 3.2 Active-state animations (new)
Both `Sidebar` and `BottomNav` now animate the active-item highlight sliding between destinations, using Motion's shared-layout `layoutId` technique (`motion.span layoutId="sidebar-active-pill"` / `"bottom-nav-active-pill"`, transitioning with the `SPRING` config from `src/lib/motion.ts`). Concretely: the active nav row/tab renders an absolutely-positioned `motion.span` behind its icon/label; when the active route changes, Motion detects the same `layoutId` moving to a new DOM position and animates a smooth slide between them rather than a hard cut. This is what makes switching tabs "feel native" rather than like a website.

The two surfaces intentionally use **different visual treatments** for the same underlying technique: Sidebar's pill is a solid `bg-brand-600` fill (appropriate for a full-width row), while BottomNav's pill is a soft `bg-brand-50`/`dark:bg-brand-950` tint behind a brand-colored icon (matching the iOS/Android convention for compact tab bars, where a solid fill on a small icon-sized target reads as too heavy).

### 3.3 Navigation state handling
Unchanged from Milestone 1: `useUIStore` (Zustand) holds `sidebarCollapsed` and `mobileMoreOpen`; `AppShell` closes the mobile "More" disclosure on every route change via a `pathname`-keyed `useEffect`.

### 3.4 Route-content transition: attempted, found broken, reverted
A route-level cross-fade (`PresenceRoute`: `AnimatePresence` + `motion.div` keyed on `location.pathname`, wrapping `useOutlet()`) was built in Milestone 2 alongside the other motion wrappers, but Milestone 2 only ever had one real app route (`/`) to test it against — there was nothing to navigate *between*. This milestone added five more, and live-testing actual navigation surfaced a real bug: clicking a nav item updated the URL and the `TopBar` title correctly, but the routed content stayed on the previous page indefinitely.

Root-caused (partially) and fixed attempts, in order:
1. Removed `mode="wait"` from `AnimatePresence` (hypothesis: sequential exit-then-enter was gated on an exit-animation completion that wasn't resolving, similar in spirit to the Radix Presence bug in [27_Design_System_Implementation.md](27_Design_System_Implementation.md) §2.1) — **did not fix it.**
2. Moved the `Suspense` boundary from wrapping `<PresenceRoute />` externally to wrapping just `{element}` inside the `motion.div` (hypothesis: a lazy chunk suspending was swapping out the whole `AnimatePresence` subtree to the fallback and back, desyncing its child tracking) — **did not fix it either.**
3. Verified a plain `<Outlet />` (no `AnimatePresence` at all) navigates correctly in the exact same route tree — confirming the bug is specific to the `AnimatePresence`/`useOutlet` combination, not React Router, not `Suspense` alone, and not any one primitive in isolation.

Given two fix attempts targeting the two most likely explanations both failed, continuing to guess against Motion/React internals wasn't a good use of time against a mobile-shell milestone. `PresenceRoute` was **deleted** rather than left in a "known broken, don't use" state — `AppShell` renders route content via a plain `Outlet` (proven correct), and the active-nav-indicator animation (§3.2) is what currently signals a navigation change, not a content transition. [11_Component_Library.md](11_Component_Library.md), [15_Routing_Strategy.md](15_Routing_Strategy.md), and [27_Design_System_Implementation.md](27_Design_System_Implementation.md) were updated to stop describing `PresenceRoute` as shipped.

**If revisited:** root-cause the actual interaction before re-attempting — likely candidates are how `motion`'s `AnimatePresence` clones/tracks children identity across a `useOutlet()`-sourced element specifically (as opposed to a manually-authored child), or a version-specific issue in the installed `motion` release. Reproduce in isolation (two static routes, no lazy-loading, no Suspense at all) before adding complexity back.

## 4. Routing

### 4.1 Public routes: Splash & Onboarding
Both render as siblings of `/design-system` — direct children of `RootLayout`, outside `AuthLayout`/`AppShell` — full-bleed, no nav chrome, per the "reserved auth gate" pattern already anticipated in [15_Routing_Strategy.md](15_Routing_Strategy.md) §5.

- **`/splash`** (`src/pages/Splash.tsx`) — brand-colored full-screen moment (`BrandMark`, name, tagline), auto-advances to `/onboarding` after 1.4s, with an explicit keyboard/screen-reader-reachable "Skip" button (not a whole-screen click target — that pattern fails `jsx-a11y/no-static-element-interactions` for good reason: a giant anonymous clickable div is a real accessibility regression, not just a lint nag).
- **`/onboarding`** (`src/pages/Onboarding.tsx`) — static placeholder for the real flow described in [05_User_Journeys.md](05_User_Journeys.md) Journey A, with a "Continue to LifyQ" button to `/`.
- **Deliberately not wired into an automatic boot redirect.** A real cold-start flow (check session → check onboarding-completion → route accordingly) requires actual persisted state, which is explicitly out of scope ("do not add feature logic"). The routes exist and are reachable — proving the pattern — but `/` still loads `Home` directly today. Wiring the real redirect is a Phase 4/auth-adjacent concern per [07_Feature_Roadmap.md](07_Feature_Roadmap.md).

### 4.2 Application routes
`Home` (existing), plus five new placeholder routes — `Ai`, `Tasks`, `Goals`, `Calendar`, `Profile` — each a ~10-line component rendering `PlaceholderPage`. All are lazy-loaded exactly like every other route ([15_Routing_Strategy.md](15_Routing_Strategy.md) §4); the production build confirms each gets its own sub-1KB chunk, so visiting `/tasks` never downloads `Goals`' code.

## 5. Mobile UX Foundation

### 5.1 Touch targets & spacing
No regression from Milestone 1's 44px-minimum commitment ([19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) §7): `BottomNav` tabs remain ~56×64px. Verified, not just asserted — see §8.

### 5.2 Typography scaling
Unchanged — the fluid `clamp()` type scale from [08_Design_System.md](08_Design_System.md) §3 already handles mobile→desktop scaling; nothing new needed this milestone.

### 5.3 Scroll behavior
`PullToRefresh` (§6) adds `overscroll-y-contain` on its own scroll container to stop rubber-band scroll from propagating to the page behind it during a pull gesture — the one place this milestone needed explicit overscroll control.

### 5.4 Keyboard-safe layouts
New: **`useKeyboardInset()`** (`src/hooks/useKeyboardInset.ts`) listens to the `VisualViewport` API and reflects the on-screen-keyboard height as a `--keyboard-inset` CSS custom property on `<html>`. Most keyboard-safety already comes for free from using `dvh`/`svh` units throughout the shell (already the case since Milestone 1); this hook exists for the remaining case — a fixed-position element (e.g. a future Quick Add bar) that needs to actively nudge itself above the keyboard rather than just relying on viewport-unit resizing. Not consumed by anything yet this milestone (no such fixed input exists); documented here as ready infrastructure.

### 5.5 Responsive breakpoints
Unchanged — Tailwind's default `sm`/`md`/`lg`/`xl`/`2xl` scale, per [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) §2, with `lg` (1024px) remaining the one breakpoint that changes navigation *paradigm* (tabs → sidebar), not just layout.

## 6. Gesture Architecture (new)

Two reusable, dependency-light primitives built on `motion`'s drag system (already an installed dependency since Milestone 2 — no new package added):

- **`Swipeable`** (`src/components/shared/Swipeable.tsx`) — horizontal drag-to-reveal with `leftAction`/`rightAction` slots and `onSwipeLeft`/`onSwipeRight` callbacks; always springs back to rest (`dragSnapToOrigin`) after release, so committing an action is entirely the caller's responsibility. `touch-pan-y` is set on the draggable element so vertical page scroll keeps working normally alongside the horizontal gesture.
- **`PullToRefresh`** (`src/components/shared/PullToRefresh.tsx`) — owns its own scroll container and only enables the vertical drag when that container's `scrollTop` is `0` (`drag={atTop ? 'y' : false}`), so it never fights normal scrolling — this was the one genuinely tricky part of the implementation; a naive `drag="y"` on a scrollable element competes with native scroll at every scroll position, not just the top. A rotating `RefreshCw` indicator tracks pull distance via `useTransform`; a `role="status"` live region announces "Refreshing…" for screen readers.

**Known gap, documented rather than silently shipped:** both are gesture-only. `Swipeable` has no keyboard/screen-reader equivalent for triggering its actions, and `PullToRefresh` has no manual "Refresh" button fallback. Per [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md), a real feature adopting either of these must ship the non-gesture equivalent alongside it (e.g., an overflow-menu "Archive"/"Delete" action next to a swipeable Task row; a visible refresh button next to a pull-to-refresh list) — flagged here so it isn't forgotten when Tasks/Notes actually adopt these.

Both are demonstrated live in `/design-system` under a new **"Mobile gestures"** section (drag the row; pull down inside the boxed list) — not on any real product page yet, since there's no real list data to attach them to without writing feature logic.

**Bottom sheets** (`Sheet`) were already built in Milestone 2 and need no changes here — they're already part of the "native mobile interactions" set.

## 7. PWA Preparation

Metadata and install-readiness only — **no service worker, no offline caching, no `vite-plugin-pwa` registration**. The app is not installable-with-offline-support yet; it's install-*metadata*-ready.

- **`public/manifest.webmanifest`** — name, short_name, description, `start_url: "/"`, `display: "standalone"`, `orientation: "portrait-primary"`, theme/background colors matching the design tokens (`#4F46E5` / `#fafafa`), and an icons array.
- **`index.html`** — manifest link, `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `mobile-web-app-capable`, `color-scheme`.
- **App icon placeholders** (`public/icons/`) — `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180). These are **real, valid PNGs** (verified: correct PNG signature, correct declared dimensions), generated programmatically (brand-indigo background, white circle, coral accent dot — the same compositional idea as `favicon.svg`/`BrandMark`, simplified to shapes a small script can rasterize without a graphics library). They are explicitly placeholders, consistent with the standing decision in [09_Brand_Guidelines.md](09_Brand_Guidelines.md) §4 that a commissioned final mark is separate, non-blocking work — real exported PNGs (ideally from the eventual final logo, plus a true maskable-safe-zone variant) should replace these before any real install push.

## 8. Verification Performed

Beyond `tsc -b`, `eslint`, `prettier --check`, and `vite build` (all clean) — live-browser checks against the running dev server:
- Sidebar ↔ BottomNav breakpoint switch still correct at 1024px (unchanged mechanism, re-verified after the nav rewrite).
- All six primary destinations navigate correctly and render their placeholder content; the active-pill animation was visually confirmed sliding between tabs on both Sidebar and BottomNav.
- `/splash` auto-advances to `/onboarding`; the Skip button and "Continue to LifyQ" button both navigate correctly.
- `PullToRefresh` and `Swipeable` were exercised on `/design-system` (drag interactions) and correctly triggered their toast callbacks without interfering with page scroll.
- Light/dark theme parity re-checked on the new screens (Splash's brand-600 background, Onboarding, all five placeholders).

## 9. Future Android/iOS (Capacitor) Considerations

Capacitor itself is **not installed** this milestone — per the brief, the goal is an architecture that *will later support* it, not standing it up now. What was specifically kept compatible:

- **No SSR, no hard navigation.** Every route change goes through React Router; nothing calls `window.location.href =` or forces a full page reload — required for a Capacitor WebView, which has no server to round-trip to.
- **Safe-area CSS, not hardcoded offsets.** Every notch/status-bar/home-indicator accommodation uses `env(safe-area-inset-*)`, which Capacitor's WKWebView (iOS) and Android equivalent both populate correctly out of the box — no native bridge code needed for basic safe-area layout.
- **Touch-first interaction already the default**, not a desktop-first afterthought — bottom tabs, swipe/pull gesture primitives, 44px touch targets, and `touch-action` hints (`touch-pan-y` on `Swipeable`) all transfer directly to a WebView with no adaptation.
- **The splash-screen route (`/splash`) is deliberately not the *only* splash mechanism.** Capacitor shows a **native** splash screen (configured via `capacitor.config.json`, a future step) before the WebView and JS bundle have even loaded; `/splash` (this milestone's React route) is the *web/PWA* equivalent for browser and installed-PWA contexts where no native splash exists. When Capacitor is added, the two are configured to hand off smoothly (native splash → WebView loads → optionally skip the React `/splash` entirely via a Capacitor-only config flag) rather than showing both back-to-back — noted here so it isn't rediscovered as a surprise later.
- **PWA manifest icons and Capacitor app icons are separate asset sets** (Capacitor generates its own native icon/splash resources from source images via its own tooling, `@capacitor/assets` or manual Xcode/Android Studio assets) — the placeholders in §7 cover web/PWA install only; they are a reasonable source image once a real logo exists, not a shortcut around Capacitor's own icon pipeline.
- **What's intentionally deferred, not solved now:** native push notifications, biometric unlock, deep-linking configuration, and the actual `capacitor.config.json`/native project scaffolding are Phase 6 per [07_Feature_Roadmap.md](07_Feature_Roadmap.md) — correctly sequenced *after* the web app is feature-complete, per the roadmap's own reasoning (Capacitor wraps a finished responsive web app; it shouldn't be stood up prematurely against a shell with no real screens yet).
