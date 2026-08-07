# 08 — Design System

This is the single source of truth for every visual and interaction primitive in LifyQ. No screen is designed or built by referencing values outside this document. It is implemented as Tailwind v4 theme tokens (`@theme` in CSS) plus shadcn/ui component configuration — see [13_Technical_Architecture.md](13_Technical_Architecture.md) for the implementation seam.

## 1. Design Principles

1. **Calm by default, expressive on purpose.** The base UI is quiet — neutral surfaces, restrained color — so that color and motion can be used meaningfully (progress, success, streaks, celebration) instead of competing for attention everywhere.
2. **Depth through elevation and blur, not borders.** Premium software (Apple, Arc, Linear) separates surfaces with shadow, translucency, and subtle contrast — hard 1px borders are used sparingly, mostly on dense data tables and inputs.
3. **Motion communicates, never decorates.** Every animation exists to show a relationship (this became that), provide feedback (this worked), or guide attention (look here). See §7.
4. **One system, every surface.** Mobile, tablet, and desktop share the same tokens and components; layout adapts, the design language does not fork.

## 2. Color System

Color is defined as **semantic tokens**, never raw hex values, in components. Raw values are defined once, here, and mapped to semantic names in Tailwind theme config.

### 2.1 Brand Palette

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `brand-50`…`brand-950` | Indigo scale, base `#4F46E5` (brand-600) | same scale | Primary actions, active states, focus rings, brand moments |
| `accent-50`…`accent-950` | Warm coral scale, base `#F97066` (accent-500) | same scale | Streaks, celebrations, highlights — used sparingly, never for primary actions |

Brand indigo was chosen over the more common "productivity blue" (#2563EB-family, used by nearly every task app) to feel more distinct, intelligent, and slightly premium/luxury-adjacent without tipping into the purple that already reads as "Linear." The warm coral accent exists specifically for moments of warmth and human reward (habit streaks, goal completion, celebratory micro-interactions) so the palette doesn't read as cold or purely corporate.

### 2.2 Neutral Palette

A true neutral gray scale (not blue- or warm-tinted) — `neutral-0` (white) through `neutral-950` (near-black, not pure black) — used for all surfaces, text, and borders. Pure black (`#000000`) and pure white (`#FFFFFF`) are never used directly as surface colors; dark mode's deepest surface is `neutral-950` (`#0A0A0C`) to avoid OLED-smear and to allow shadow/elevation to read.

### 2.3 Semantic Tokens

| Token | Purpose |
|---|---|
| `background` | App canvas |
| `surface` | Card/panel base |
| `surface-raised` | Modals, popovers, elevated cards |
| `surface-overlay` | Glass/translucent overlay surfaces (see §2.5) |
| `border-subtle` / `border-default` | Hairline separators |
| `text-primary` / `text-secondary` / `text-tertiary` / `text-disabled` | Content hierarchy |
| `foreground-on-brand` | Text/icons placed on brand-colored surfaces |
| `success` / `warning` / `danger` / `info` | Status, each with a matching `-subtle` background variant for badges/banners |

### 2.4 Dark Mode

Dark mode is a first-class design target, not an inverted afterthought. Both themes are designed simultaneously; every component is verified in both. Theme is selectable (Light / Dark / System) in Settings → Appearance, default **System**.

### 2.5 Glassmorphism Policy

Translucency + backdrop-blur is used **only** for: the command palette overlay, bottom sheets, modal scrims, and the floating navigation bar on scroll. It is never used for primary content surfaces (cards, list items) where it would hurt legibility or performance. Implementation: `backdrop-filter: blur(20px)` over `surface-overlay` at 72–85% opacity, with a `border-subtle` hairline to keep edges legible on busy backgrounds.

### 2.6 Contrast Requirement

All text/background pairings meet WCAG AA (4.5:1 body text, 3:1 large text/UI components) in both themes — enforced per [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md).

## 3. Typography

- **Typeface:** Inter (variable font), self-hosted subset. Chosen for its exceptional legibility at small UI sizes, native-feeling numeric tabular figures (critical for Finance/Analytics later), enormous adoption in premium SaaS (reduces risk, huge tooling/hinting maturity), and free/open licensing (no font-licensing cost or legal overhead).
- **Fallback stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` so the app still feels native before the webfont paints.
- **Weights used:** 400 (body), 500 (emphasis/labels), 600 (headings, buttons), 700 (display/large numerals only). Limiting to four weights keeps the font subset small (see [18_Performance_Strategy.md](18_Performance_Strategy.md)).

### Type Scale (mobile-first, fluid between breakpoints)

| Token | Size (mobile → desktop) | Line height | Usage |
|---|---|---|---|
| `text-display` | 32px → 44px | 1.1 | Onboarding hero, empty-state headlines |
| `text-h1` | 26px → 32px | 1.2 | Page titles |
| `text-h2` | 20px → 24px | 1.25 | Section headers |
| `text-h3` | 17px → 18px | 1.3 | Card titles, list group headers |
| `text-body` | 15px → 16px | 1.5 | Default body/UI text |
| `text-body-sm` | 13px → 14px | 1.45 | Secondary text, metadata |
| `text-caption` | 12px | 1.4 | Timestamps, tags, micro-labels |
| `text-numeral` | context-dependent | 1.1 | Tabular-nums variant for streaks, amounts, stats |

## 4. Spacing & Layout

- **Base unit:** 4px. All spacing values are multiples of 4 (4, 8, 12, 16, 20, 24, 32, 40, 48, 64...) — exposed as Tailwind's default spacing scale, no custom overrides needed.
- **Content max-width:** 640px for single-column reading contexts (note editor, journal entry), 1120px for dashboard/collection grids on large screens — content never stretches edge-to-edge on wide desktop viewports.
- **Grid:** 4-column on mobile (16px gutter), 8-column on tablet (24px gutter), 12-column on desktop (24px gutter), using CSS Grid utility patterns, not a legacy 12-col float grid.

## 5. Radius System

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Inputs, small buttons, checkboxes |
| `radius-md` | 10px | Buttons, chips, tags |
| `radius-lg` | 16px | Cards, list items |
| `radius-xl` | 20px | Modals, panels |
| `radius-2xl` | 28px | Bottom sheets, hero cards |
| `radius-full` | 9999px | Avatars, pills, FAB |

Generous rounding is used deliberately (per the brief's "rounded corners, soft shadows" mandate) but scaled to element size — small controls get small radii so they don't look overly pill-shaped at tiny sizes.

## 6. Elevation System

Shadows are **tinted with the brand hue at very low opacity** rather than pure black, a small but deliberate premium detail (Linear and Arc both do this).

| Token | Composition | Usage |
|---|---|---|
| `elevation-0` | none, `border-subtle` only | Flat list rows |
| `elevation-1` | `0 1px 2px hsl(var(--brand-950)/0.06)` | Resting cards |
| `elevation-2` | `0 4px 12px hsl(var(--brand-950)/0.08)` | Hover/raised cards |
| `elevation-3` | `0 12px 24px hsl(var(--brand-950)/0.12)` | Popovers, dropdowns |
| `elevation-4` | `0 24px 48px hsl(var(--brand-950)/0.16)` | Modals |
| `elevation-5` | `0 32px 64px hsl(var(--brand-950)/0.20)` | Command palette, full overlays |

## 7. Motion System

- **Durations:** `duration-fast` 100ms (micro feedback: checkbox, toggle), `duration-base` 180ms (default transitions: hover, small state changes), `duration-moderate` 250ms (panel/sheet open, page-section transitions), `duration-slow` 400ms (full-screen/route transitions, celebratory moments).
- **Easings:** `ease-standard` `cubic-bezier(0.4, 0, 0.2, 1)` (default), `ease-decelerate` `cubic-bezier(0, 0, 0.2, 1)` (entrances), `ease-accelerate` `cubic-bezier(0.4, 0, 1, 1)` (exits), `ease-spring` (Framer Motion spring, `stiffness: 300, damping: 30`) for playful/organic moments (streak completion, FAB press, drag-drop settle).
- **Rules:** Animate `transform` and `opacity` only wherever possible (GPU-cheap); avoid animating `width`/`height`/`top`/`left` — use `layout` animations (Framer Motion) instead. Route transitions use a shared fade+slight-slide, capped at `duration-moderate`. All motion respects `prefers-reduced-motion` — reduced-motion users get instant or opacity-only transitions, detailed in [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md).

## 8. Iconography

- **Icon set:** Lucide (open-source, matches shadcn/ui's default integration, consistent 24×24 grid, 1.5–2px stroke weight matching Inter's optical weight).
- **Sizes:** 16px (inline/dense UI), 20px (default UI), 24px (navigation, empty states), 32–48px (illustrative/empty-state feature icons).
- **Rule:** Icon-only interactive elements always carry an accessible label (see [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md)); icons never convey status via color alone (paired with shape/label).

## 9. Illustration & Empty States

Empty states use a small custom set of line-based, brand-colored illustrations (single-weight stroke, matching icon stroke weight, brand/accent color fills at low opacity) rather than generic stock illustrations or emoji. Each MVP domain has one empty-state illustration. Full behavioral spec in [05_User_Journeys.md](05_User_Journeys.md) Journey F.

## 10. Component Elevation Patterns (surface hierarchy in practice)

- **Base page:** `background`
- **Cards/list items:** `surface` + `elevation-1`, `elevation-2` on hover/focus
- **Modals/dialogs:** `surface-raised` + `elevation-4`
- **Popovers/dropdowns/tooltips:** `surface-raised` + `elevation-3`
- **Bottom sheets/command palette:** `surface-overlay` (glass) + `elevation-5`

## 11. Density Modes

Settings → Appearance offers **Comfortable** (default) and **Compact** density, adjusting vertical padding on list/table rows by roughly 25% via a CSS custom property multiplier, not a second component set — keeps the component library single-sourced.

## 12. Accessibility Baseline (see full doc: [19_Accessibility_Guidelines.md](19_Accessibility_Guidelines.md))

All tokens above are chosen to satisfy WCAG 2.1 AA by construction: contrast ratios validated per pairing, focus-ring token (`focus-ring`: 2px `brand-600` outline with 2px offset) applied consistently, and touch targets sized per [20_Responsive_Design_Guidelines.md](20_Responsive_Design_Guidelines.md) regardless of visual density mode.
