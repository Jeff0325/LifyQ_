import { useEffect } from 'react';

import { usePreferencesStore } from '@/stores/usePreferencesStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Resolves the user's `theme` preference ('light' | 'dark' | 'system') to a
 * concrete light/dark value and reflects it onto <html class="dark">, which
 * is what the `@custom-variant dark` rule in styles/tokens.css keys off.
 * See docs/08_Design_System.md §2.4 and docs/13_Technical_Architecture.md.
 */
export function useAppliedTheme(): void {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia(DARK_QUERY);

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches);
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };

    apply();

    if (theme === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    return undefined;
  }, [theme]);
}
