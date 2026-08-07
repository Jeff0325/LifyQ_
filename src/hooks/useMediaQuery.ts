import { useSyncExternalStore } from 'react';

/**
 * SSR-safe (returns `false` until mounted), reactive media query hook built
 * on useSyncExternalStore so it never tears in concurrent React 19
 * rendering. Backs the breakpoint-driven layout switches described in
 * docs/20_Responsive_Design_Guidelines.md §2.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind `lg` breakpoint (1024px) — the nav-pattern switch point. */
export const QUERY_LG = '(min-width: 1024px)';
/** Tailwind `xl` breakpoint (1280px) — sidebar defaults to expanded. */
export const QUERY_XL = '(min-width: 1280px)';
