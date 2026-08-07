/**
 * JS-side motion constants mirroring the CSS custom properties in
 * src/styles/tokens.css §7 (docs/08_Design_System.md §7). Framer/Motion
 * transition props need real numbers and bezier arrays, not `var(...)`
 * strings, so these are kept here and hand-synced with tokens.css — if you
 * change one, change the other.
 */
export const DURATION = {
  fast: 0.1,
  base: 0.18,
  moderate: 0.25,
  slow: 0.4,
} as const;

export const EASE = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
} as const;

/** For organic/playful moments only (streak completion, drag settle, FAB press) — never default UI chrome. */
export const SPRING = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;
