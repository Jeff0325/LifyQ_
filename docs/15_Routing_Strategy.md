# 15 — Routing Strategy

## 1. Approach

**React Router v7, in client-side "declarative/data" library mode** (`createBrowserRouter`), not the SSR-oriented "framework mode." This is a pure client-rendered SPA — consistent with [13_Technical_Architecture.md](13_Technical_Architecture.md)'s decision against Next.js/SSR for this phase — while still using React Router's data-router APIs (`loader`-compatible route objects, `useNavigation`) so route-level loading states and a future migration path to server data-loading remain open without a rewrite.

## 2. Route Tree Structure

```
<RootLayout>                          — providers: QueryClientProvider, ThemeProvider, TooltipProvider
  <AuthLayout>                        — stubbed gate; in this phase always "authenticated" via mock session
    <AppShell>                        — navigation chrome (10_Navigation_Architecture.md)
      /                     → Dashboard
      /assistant            → AI Assistant full view
      /tasks                → Tasks collection
      /tasks/:taskId         → Task detail
      /goals                → Goals collection
      /goals/:goalId         → Goal detail
      /habits               → Habits collection
      /habits/:habitId       → Habit detail
      /calendar             → Calendar (redirects to /calendar/month/:today)
      /calendar/:view/:date  → Calendar explicit view
      /notes                → Notes collection
      /notes/:noteId          → Note editor
      /settings              → Settings (nested routes: profile, appearance, notifications, subscription, privacy)
    </AppShell>
    /onboarding             → Onboarding flow (renders outside AppShell chrome)
  </AuthLayout>
  /* future, Phase 4 */
  /login, /signup, /forgot-password    → rendered outside AuthLayout entirely
</RootLayout>
* → NotFound
```

## 3. Layout Routes

React Router's nested layout-route capability is used deliberately so chrome (navigation shell) is not re-mounted on every navigation — only the routed content swaps, preserving animation continuity and avoiding remount-cost on things like the persistent AI Assistant docked panel or command palette state.

## 4. Lazy Loading Per Route

Every top-level feature route is code-split via `React.lazy` + `Suspense`, one chunk per domain (`tasks.chunk.js`, `goals.chunk.js`, etc.), so a user who never opens Finance or Health never downloads that code. Suspense fallbacks use the skeleton components from [11_Component_Library.md](11_Component_Library.md) §6, never a bare spinner, to keep perceived-performance consistent with [18_Performance_Strategy.md](18_Performance_Strategy.md).

## 5. Protected Route Pattern (forward-compatible with real auth)

`AuthLayout` in this phase unconditionally renders its children (there is no real auth to gate against), but it is structured as the single choke point future auth logic will occupy:

```tsx
function AuthLayout() {
  const session = useSessionStore((s) => s.mockSession); // Phase 4: real Supabase session
  if (!session) return <Navigate to="/login" replace />;   // inert in this phase; mockSession always present
  return <Outlet />;
}
```

This means Phase 4 auth work is a change *inside* `AuthLayout` plus adding the `/login` etc. routes — the rest of the route tree, and every feature route within it, is untouched.

## 6. URL as State Source for Collections

Filter, sort, tab, and view-mode state for collection screens (Tasks list/board toggle, Calendar view/date, Notes filter) is read/written via `useSearchParams`, per [14_State_Management_Strategy.md](14_State_Management_Strategy.md) §5 — never held only in component state — so every filtered view is a shareable, bookmarkable, back-button-correct URL.

## 7. Navigation Transitions

**Revised in Milestone 3 (see [28_Mobile_First_Architecture.md](28_Mobile_First_Architecture.md)):** an `AnimatePresence`-based cross-fade (wrapped as a `<PresenceRoute>` primitive) was built and then removed after live testing showed it could leave navigation stuck on the previous page — the URL and page title updated but the routed content did not, reproduced independent of `AnimatePresence` mode and `Suspense` boundary placement. Route transitions currently render via a plain `Outlet`, with no route-level animation; the active-nav-item indicator (sliding pill in `Sidebar`/`BottomNav`, [10_Navigation_Architecture.md](10_Navigation_Architecture.md)) is what currently signals navigation, not a content cross-fade. Revisiting a route-transition animation is possible but needs root-causing the `AnimatePresence`/`useOutlet` interaction first, not another guess-and-check pass.

## 8. Deep Linking & Detail Views

Every entity detail (Task, Goal, Habit, Note, Event) is always a real route with its own URL, never a modal-only presentation with no addressable state (per [10_Navigation_Architecture.md](10_Navigation_Architecture.md) §6) — required for shareability, browser back/forward correctness, and eventual notification deep-linking (Phase 4, tapping a notification must be able to route directly to the relevant entity).

## 9. Not-Found & Error Boundaries

A route-level `errorElement` is attached at the `AppShell` layout level, rendering a branded error state (not a raw stack trace) for any unhandled render error within a feature route, plus a dedicated `NotFound` route for unmatched paths — both styled per [08_Design_System.md](08_Design_System.md) and voiced per [09_Brand_Guidelines.md](09_Brand_Guidelines.md) §3.
