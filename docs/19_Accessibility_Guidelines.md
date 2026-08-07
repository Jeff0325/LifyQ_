# 19 — Accessibility Guidelines

## 1. Standard

**WCAG 2.1 Level AA** is the conformance target across the entire product, verified continuously (not just at launch) via the tooling in §7. This is a baseline requirement, not an enhancement — a life-management product handling tasks, finances, health, and journaling has an elevated obligation to be usable by everyone, including users with motor, visual, cognitive, and situational impairments.

## 2. Why Radix/shadcn Is Foundational Here

Building on Radix primitives (via shadcn/ui, per [11_Component_Library.md](11_Component_Library.md)) means correct ARIA roles, keyboard interaction patterns, and focus management for complex components (Dialog, Popover, Combobox, Menu, Tabs) are inherited rather than hand-built and hand-verified for every instance — this substantially de-risks AA conformance for the hardest category of components (interactive overlays).

## 3. Color & Contrast

- All text/background pairings meet **4.5:1** (body text) or **3:1** (large text ≥ 18px/14px-bold, and UI component boundaries/icons) in both light and dark themes — verified per-token in [08_Design_System.md](08_Design_System.md), not spot-checked per screen.
- **Color is never the sole carrier of meaning.** Status (overdue task, habit streak broken, budget over limit) always pairs color with an icon, label, or shape change.
- Focus indicators use the dedicated `focus-ring` token (2px solid, 2px offset, brand-600) at sufficient contrast against every surface color it can appear on.

## 4. Keyboard Operability

- Every interactive element is reachable and operable via keyboard alone, in a logical tab order matching visual order.
- Global shortcuts (`⌘K`/`Ctrl+K` command palette, `Q` quick add, `/` search focus, `Esc` to close any overlay) per [10_Navigation_Architecture.md](10_Navigation_Architecture.md) §9 are implemented via a single shared keyboard-shortcut manager (not duplicated per component) to guarantee consistent behavior and to allow one place to prevent shortcut conflicts with native browser/OS bindings or with a focused text input.
- Focus is trapped correctly within open modals/sheets/command palette (inherited from Radix, verified in Storybook interaction tests) and returned to the triggering element on close.
- Drag-and-drop interactions (Task board columns, drag-reorder) provide a keyboard-operable equivalent (e.g., a context-menu "Move to..." action), never drag-only.

## 5. Screen Reader Support

- Semantic HTML landmarks (`<nav>`, `<main>`, `<header>`, `<aside>`) structure every layout; heading levels (`h1`–`h3`) follow document-outline order per screen, matching the type-scale tokens in [08_Design_System.md](08_Design_System.md) §3.
- Icon-only interactive elements (icon buttons, FAB, nav tab icons) always carry an `aria-label` or equivalent accessible name — enforced via a custom ESLint rule (`jsx-a11y`) that flags icon-button components missing a label prop.
- Dynamic content changes that matter (toast confirmations, form validation errors, streak-completion celebrations) are announced via `aria-live` regions (polite by default; assertive reserved for errors that block progress) — implemented once in the shared Toast/Form-error components, not per feature.
- Form fields always have programmatically associated labels (never placeholder-as-label); required fields and validation errors are announced, not conveyed by color/asterisk alone.

## 6. Motion & Vestibular Safety

`prefers-reduced-motion: reduce` is respected globally (per [18_Performance_Strategy.md](18_Performance_Strategy.md) §5): parallax, large-scale layout animations, and auto-playing decorative motion are disabled; essential state-change feedback (e.g., a checkbox toggling) is preserved but reduced to instant or opacity-only transitions rather than removed entirely, since some feedback is necessary for usability itself.

## 7. Touch Target & Input Accessibility

Minimum touch target size of **44×44px** (iOS HIG / WCAG 2.5.5 alignment) for all interactive elements regardless of visual density mode (Comfortable/Compact, per [08_Design_System.md](08_Design_System.md) §11) — visual padding may shrink in Compact mode, but hit-target area does not. Full spec in [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md).

## 8. Cognitive Accessibility

Directly informed by the Daniel persona ([04_User_Personas.md](04_User_Personas.md)): minimal required fields on creation flows, strong sensible defaults, one primary action per screen/step, consistent terminology (per [09_Brand_Guidelines.md](09_Brand_Guidelines.md) §7), and undo affordances (toast with "Undo" action) on destructive/high-frequency actions rather than requiring a confirmation dialog for every single action — reduces both cognitive load and interruption frequency while still protecting against accidental data loss.

## 9. Testing & Enforcement

- **Automated:** `eslint-plugin-jsx-a11y` in CI (fails build on violations), `axe-core` integration in both Vitest/RTL component tests and Playwright E2E runs, catching regressions continuously rather than at a single pre-launch audit.
- **Manual:** keyboard-only navigation pass and screen reader spot-check (VoiceOver on macOS/iOS, NVDA on Windows) required in the PR checklist (see [24_Git_Workflow.md](24_Git_Workflow.md)) for any new Tier 2/3 component or new screen.
- **Storybook a11y addon** flags violations at the component-isolation level, before a component ever reaches a full page, per [11_Component_Library.md](11_Component_Library.md) §7.

## 10. Non-Negotiables

No PR introducing a new interactive component merges without: a visible focus state, an accessible name, correct keyboard operability, and a passing automated a11y check. This is treated with the same severity as a failing type-check, not as a follow-up ticket.
