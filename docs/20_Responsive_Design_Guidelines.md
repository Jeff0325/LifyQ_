# 20 — Responsive Design Guidelines

## 1. Principle: Mobile-First, Native-Feeling at Every Size

Every screen is designed starting from a 375px mobile canvas and progressively enhanced upward — never the reverse. "Progressive enhancement" here means more than reflowing a grid: navigation chrome, interaction patterns (sheets vs. modals, FAB vs. sidebar button), and information density all adapt per [10_Navigation_Architecture.md](10_Navigation_Architecture.md), not just layout width.

## 2. Breakpoint System

| Token | Min-width | Device class | Navigation pattern |
|---|---|---|---|
| `base` | 0px | Small phones | Bottom tabs, FAB, sheets |
| `sm` | 640px | Large phones (landscape-ish) | Bottom tabs, FAB, sheets |
| `md` | 768px | Small tablets (portrait) | Bottom tabs or icon rail (see below) |
| `lg` | 1024px | Tablets (landscape) / small laptops | Icon rail / collapsible sidebar |
| `xl` | 1280px | Desktop | Full sidebar, command palette primary |
| `2xl` | 1536px | Large desktop | Full sidebar, wider content max-width |

The navigation-pattern switch from bottom-tabs to rail/sidebar happens at `lg` (1024px), matching [10_Navigation_Architecture.md](10_Navigation_Architecture.md) §2 exactly — this is the single most important breakpoint in the system since it changes interaction paradigm, not just layout.

## 3. Touch vs. Pointer Considerations

- **Minimum touch target:** 44×44px on any viewport where touch input is plausible (base through `lg`, and `xl`/`2xl` too, since touch laptops/tablets exist) — see [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) §7.
- **Hover-dependent affordances are never the only way to reveal an action.** Any "reveal on hover" pattern (e.g., row quick-actions) also has a persistent, tap-accessible equivalent (overflow menu icon) on touch viewports, detected via `(hover: hover) and (pointer: fine)` media query, not viewport width alone (a touch laptop at desktop width still needs tap-accessible affordances).
- **Swipe gestures** (swipe-to-complete on Task rows, swipe-to-dismiss on notifications) are available on touch, with an always-visible equivalent action (checkbox, button) alongside — gestures are an accelerant, never the only path.

## 4. Layout Adaptation Patterns

- **List-detail views** (e.g., Notes, Tasks): single-column, full-screen push navigation on mobile/`md`; two-column list+detail split view from `lg` upward where screen width comfortably supports both without cramping either.
- **Collection grids** (Goals, Habits cards): 1 column (`base`), 2 columns (`sm`/`md`), 3 columns (`lg`), 4 columns (`xl`+) — using CSS Grid `auto-fit`/`minmax` rather than hard breakpoint-specific column counts, so intermediate widths never look awkwardly sparse or cramped.
- **Calendar:** agenda/list view by default on `base`/`sm` (a full month grid is unusable at phone width); week view from `md`; full month grid available from `lg` upward, with week view still selectable at any size.
- **Forms:** single-column field stacking at all sizes up to `md`; two-column field grouping permitted from `lg` upward only for genuinely paired short fields (e.g., start/end time) — never for primary content fields (title, description), which stay full-width for readability at any size.

## 5. Safe Areas & Native-Feeling Details

- All fixed bottom chrome (tab bar, FAB, bottom sheets) respects `env(safe-area-inset-bottom)` for iOS home-indicator clearance.
- Top chrome respects `env(safe-area-inset-top)` for notch/Dynamic-Island clearance when run as a installed PWA or (Phase 6) Capacitor-wrapped app.
- Scroll containers use native momentum scrolling (`-webkit-overflow-scrolling: touch` equivalent behavior, native by default in modern mobile browsers) and are designed to support pull-to-refresh patterns at the container level, ready for a real pull-to-refresh implementation once live data exists to refresh (this phase: the gesture space is reserved, not necessarily wired to a visible refresh action against static mock data).

## 6. Typography & Spacing Across Breakpoints

Type scale and spacing tokens in [08_Design_System.md](08_Design_System.md) §3–§4 already define fluid mobile→desktop sizing rather than a hard swap at breakpoints, so text and spacing feel continuous as the viewport resizes (e.g., resizing a browser window) rather than "jumping."

## 7. Orientation Handling

Tablet and mobile layouts are verified in both portrait and landscape — landscape phone width often lands functionally in the `sm`/`md` range and should use those patterns rather than assuming portrait-only phone usage; the Calendar and Task board views specifically benefit from and should be tested in landscape tablet use.

## 8. Testing Matrix (minimum device/viewport set for QA)

- 375×812 (small phone baseline, e.g., iPhone SE-class)
- 390×844 (standard modern phone)
- 768×1024 (tablet portrait)
- 1024×1366 (tablet landscape / small laptop)
- 1440×900 (standard desktop)
- 1920×1080 (large desktop)

Every MVP screen is verified against this full matrix before being considered done, per the Definition of Done in [23_Development_Roadmap.md](23_Development_Roadmap.md).

## 9. Explicitly Rejected Pattern

**No separate "mobile site" or device-specific component forks.** One responsive component tree serves every breakpoint (per [12_Folder_Architecture.md](12_Folder_Architecture.md), no `/mobile` vs `/desktop` component duplication) — divergent chrome (tab bar vs. sidebar) is handled by swapping layout-level shell components only, per [10_Navigation_Architecture.md](10_Navigation_Architecture.md), never by duplicating feature/content components per device class.
