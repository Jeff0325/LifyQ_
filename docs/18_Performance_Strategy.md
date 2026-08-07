# 18 — Performance Strategy

## 1. Targets

| Metric | Target | Notes |
|---|---|---|
| Lighthouse Performance | ≥ 95 | On Dashboard, Tasks, and Calendar (the three highest-traffic routes) |
| Lighthouse Accessibility | ≥ 95 | See [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) |
| Lighthouse Best Practices | ≥ 95 | |
| Largest Contentful Paint (LCP) | < 2.0s on 4G / mid-tier mobile | |
| Interaction to Next Paint (INP) | < 200ms | Critical given the frequency of quick interactions (check off habit, complete task) |
| Cumulative Layout Shift (CLS) | < 0.1 | Skeletons must reserve real layout space, not pop content in |
| Initial JS bundle (route entry, gzipped) | < 150KB | Enforced via bundle-size CI check, per route chunk |

## 2. Code Splitting & Lazy Loading

- **Route-level splitting**, one chunk per feature domain, per [15_Routing_Strategy.md](15_Routing_Strategy.md) §4 — a user who only ever uses Tasks and Calendar never downloads Notes, Goals, or (later) Finance/Health code.
- **Component-level splitting** for heavy, infrequently-shown UI: rich-text editor (Notes), any future charting library (Analytics, Phase 3), the command palette's fuzzy-search index — all lazy-loaded on first interaction, not in the initial bundle.
- **Vendor chunking** configured in Vite/Rollup to separate rarely-changing large dependencies (React, Radix primitives) from frequently-changing app code, maximizing long-term browser cache hits across deploys.

## 3. Rendering Performance

- **Virtualization** (TanStack Virtual) for any list realistically expected to exceed ~50 rendered rows: Tasks list, Notes list, and (Phase 2+) Transactions — prevents DOM bloat and keeps scroll performance smooth regardless of mock dataset size.
- **Memoization discipline:** `React.memo` on list-row components whose props are stable across unrelated parent re-renders; `useMemo`/`useCallback` used purposefully (derived, non-trivial computations and stable callback identities passed to memoized children) rather than reflexively on every value, which itself has a cost.
- **React 19 features leveraged:** automatic batching, `useOptimistic` for instant-feeling mutations (habit check-off, task complete) layered on top of TanStack Query's own optimistic-update support, `useTransition` for non-blocking UI updates when switching filters/views on large collections.

## 4. Asset & Font Performance

- **Fonts:** Inter variable font, self-hosted (not Google Fonts CDN, to avoid an extra DNS/connection hop and third-party dependency), subset to Latin + common punctuation, `font-display: swap`, preloaded for the two weights used above the fold.
- **Images/illustrations:** the empty-state illustration set ([08_Design_System.md](08_Design_System.md) §9) ships as optimized SVG (scalable, tiny, theme-color-adaptable via `currentColor`/CSS variables) rather than raster images — eliminates responsive-image complexity entirely for this content type.
- **Icons:** Lucide icons are imported individually (tree-shaken), never as a full icon-font or sprite-sheet bundle.

## 5. Animation Performance

- Framer Motion usage restricted to `transform`/`opacity` animation wherever possible (per [08_Design_System.md](08_Design_System.md) §7), which run on the compositor thread and don't trigger layout/paint — keeping animation smooth even on mid-tier mobile hardware.
- `will-change` applied surgically (only on actively-animating elements, removed after), not broadly, to avoid unnecessary GPU layer memory cost.
- `prefers-reduced-motion` is checked once globally (a `useReducedMotion` hook backing the shared motion primitives in [11_Component_Library.md](11_Component_Library.md) §9), not re-implemented per component.

## 6. Perceived Performance

- **Skeleton screens, not spinners**, for every primary content load — matches real layout shape to minimize CLS on content arrival, per [11_Component_Library.md](11_Component_Library.md) §6.
- **Optimistic UI** for common mutations (§3) so the interface never waits on the simulated network latency for actions the user expects to feel instant.
- **Instant route shell paint:** navigation chrome (sidebar/tab bar) never re-fetches or re-suspends on route change (layout-route architecture, [15_Routing_Strategy.md](15_Routing_Strategy.md) §3) — only the content area shows loading state, so the app never feels like it "reloads."

## 7. Build & CI Enforcement

- **Bundle-size budget check** in CI (e.g., `size-limit` or Vite's own build report parsed in a CI step) fails the build if a route chunk exceeds its budget — prevents silent regression as domains are added over time.
- **Lighthouse CI** runs against key routes on every PR against a Vercel preview deployment, with the targets in §1 as hard gates for merge on performance-sensitive PRs (soft warning otherwise, to avoid blocking unrelated work on flaky network variance).

## 8. Scaling Consideration

Because every domain follows the identical lazy-loaded feature-chunk pattern (§2), adding 8 more domains post-MVP (Phase 2–3) grows total possible app size without growing what any single user actually downloads for their typical session — performance targets in §1 are expected to hold steady across the full roadmap, not just at MVP scope.
