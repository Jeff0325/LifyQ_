# 25 — Testing Strategy

## 1. Testing Pyramid

```
        ▲
       / \        E2E (Playwright) — few, golden-path journeys
      /___\
     /     \      Integration (RTL + MSW) — feature flows
    /_______\
   /         \    Unit / Component (Vitest + RTL) — most tests
  /___________\
```

Most coverage lives at the unit/component level (fast, cheap, precise failure localization); integration tests validate that features work together against a realistic mocked network; a small, curated set of E2E tests protects the handful of flows that must never break. This shape is chosen over an inverted pyramid (E2E-heavy) because E2E suites are slow and flaky at scale — appropriate only for the highest-value paths.

## 2. Tooling

| Layer | Tool | Why |
|---|---|---|
| Unit / logic | **Vitest** | Native Vite integration (shared config/transform pipeline, fast), Jest-compatible API (low learning curve) |
| Component | **React Testing Library** (on Vitest) | Tests behavior/accessibility tree, not implementation detail — aligns with the accessibility-first mandate in [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) |
| Network simulation | **MSW** | Same handlers used in dev mock mode are reused in tests — one source of truth for mock network behavior, per [13_Technical_Architecture.md](13_Technical_Architecture.md) §5 |
| E2E | **Playwright** | Reliable cross-browser (including WebKit, important given iOS-Safari-specific concerns in [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md)), first-class trace/debugging tooling |
| Visual/isolation | **Storybook** (+ optional Chromatic later for visual regression) | Component-level verification independent of app routing/state, per [11_Component_Library.md](11_Component_Library.md) §7 |
| Accessibility | **axe-core** via `vitest-axe` (component level) and `@axe-core/playwright` (E2E level) | Continuous automated a11y verification, per [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md) §9 |

## 3. What Gets Tested at Each Layer

**Unit tests** — pure logic: domain utility functions (sort/group/derive-progress helpers), Zod schema validation, repository implementations (mock repositories tested for correct CRUD + error-injection behavior), Zustand store logic.

**Component tests** — Tier 1/2/3 components in isolation: renders correctly for each documented state (loading/empty/populated/error, per [11_Component_Library.md](11_Component_Library.md) §6), correct accessible roles/names, correct behavior on interaction (form submission, button clicks, keyboard operation).

**Integration tests** — a feature's hooks + components together against MSW-mocked network: e.g., "creating a Task via the form dialog updates the Tasks list and closes the dialog," "completing a Habit updates its streak count optimistically."

**E2E tests** — the golden-path journeys defined in [05_User_Journeys.md](05_User_Journeys.md), executed against a real browser and a real (preview-deployed) build: Onboarding completion, Quick Add capture, cross-domain Goal→Project→Task→Calendar flow, Dashboard morning check-in interactions, hitting and dismissing a paywall moment. Roughly 6–10 E2E specs at MVP scope — deliberately small and curated, not one per screen.

## 4. Coverage Targets

**No blanket 100% coverage mandate** — coverage percentage is not itself a quality goal. Targets instead:
- Domain logic (`/lib`, repository implementations, Zod schemas, derived-state calculations like Goal progress): **≥ 90%**, since these are pure, cheap to test, and bugs here are silent/dangerous.
- Shared components (`/components/ui`, `/components/shared`): **all documented states covered** (a state-coverage requirement, not a line-coverage percentage).
- Feature components: golden-path interaction covered; exhaustive edge-case UI permutations are not required at this layer if already covered by integration/E2E.
- Overall repo line-coverage is monitored (CI-reported) with a **70% floor** as a regression trip-wire, not a target to optimize toward for its own sake.

## 5. CI Enforcement

Every PR runs: typecheck → lint → unit/component tests → build → bundle-size check. Integration tests run on every PR. The full E2E suite runs on every PR against its Vercel preview URL (Playwright configured to target the preview deployment directly, catching environment-specific issues CI-only runs would miss) with a nightly full cross-browser (Chromium/WebKit/Firefox) run against `main` to catch flakier, slower cross-browser issues without blocking every PR on the slowest matrix.

## 6. Test Data

Integration and E2E tests use the same seed-data generators (`/mock/seed{Domain}.ts`, per [16_Data_Model_Plan.md](16_Data_Model_Plan.md) §7) as local development mock mode, ensuring tests exercise realistic, narratively-coherent data shapes rather than minimal/degenerate fixtures that wouldn't catch real UI issues (e.g., long titles, overflowing tag lists, empty-but-not-null fields).

## 7. Regression Discipline

Any bug found post-merge gets a failing test written that reproduces it *before* the fix is committed (test-first bug fixing) — the test is added to whichever layer (unit/component/integration/E2E) most precisely and cheaply captures the failure, preferring the lowest layer that can catch it.

## 8. Ownership

Test-writing is part of the Definition of Done in [23_Development_Roadmap.md](23_Development_Roadmap.md), not a separate QA-team responsibility — the engineer implementing a feature writes its tests, since they hold the most context on its edge cases at implementation time.
