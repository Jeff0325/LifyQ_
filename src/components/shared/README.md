# components/shared

Tier 2 shared composites — app-aware but domain-agnostic, per
`docs/11_Component_Library.md` §4.

**Built:** `EmptyState`, `ErrorState`, `ConfirmDialog`, `ProgressRing`,
`Sparkline`, `BarChart`, `PageContainer`, `PlaceholderPage`, `BrandMark`,
`RouteLoading`, `Swipeable`, `PullToRefresh`, and the motion wrappers in
`./motion` (`FadeIn`, `SlideUp`, `StaggerList`). `PresenceRoute` (route-level
cross-fade) was built and removed in Milestone 3 after live testing found
it left navigation stuck on the previous page — see
`docs/28_Mobile_First_Architecture.md`. Route content renders via a plain
`Outlet` instead. `BarChart` was built when the Analytics domain shipped
(docs/07 Phase 3) — a hand-rolled categorical bar chart using the
`--color-chart-N` palette, same "no external charting library" approach as
`Sparkline`.

**Not yet built** — added when a domain screen actually needs them, so
their API is shaped by real usage rather than guessed: `AppCard` (Tier 1
`Card` in `components/ui` covers this need for now), `PageHeader`,
`QuickAddBar`, `CommandPalette`, `StatTile`, `StreakHeatmap`, `FilterBar`.
