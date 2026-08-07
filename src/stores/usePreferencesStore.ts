import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

interface PreferencesState {
  theme: ThemePreference;
  density: Density;
  setTheme: (theme: ThemePreference) => void;
  setDensity: (density: Density) => void;
}

/**
 * Persisted, cross-cutting appearance preferences. Zustand + localStorage
 * per docs/14_State_Management_Strategy.md §3 — deliberately small and
 * narrowly scoped rather than one monolithic app store.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      density: 'comfortable',
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
    }),
    { name: 'lifyq-preferences' },
  ),
);
