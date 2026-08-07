import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const FOCUS_AREAS = [
  'productivity',
  'health',
  'finance',
  'habits',
  'personal-organization',
] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

export interface OnboardingPersonal {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  timeZone: string;
  country: string;
  preferredLanguage: string;
}

export interface OnboardingProductivity {
  workStart: string;
  workEnd: string;
  wakeUpTime: string;
  bedTime: string;
  firstDayOfWeek: 'monday' | 'sunday';
}

export interface OnboardingHealth {
  heightCm: string;
  weightKg: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface OnboardingPreferences {
  notificationsEnabled: boolean;
  jarvisVoiceEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultCalendarView: 'day' | 'week' | 'month' | 'agenda';
}

const DEFAULT_PERSONAL: OnboardingPersonal = {
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  gender: '',
  timeZone:
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Asia/Manila',
  country: '',
  preferredLanguage: 'English',
};

const DEFAULT_PRODUCTIVITY: OnboardingProductivity = {
  workStart: '09:00',
  workEnd: '17:00',
  wakeUpTime: '07:00',
  bedTime: '22:00',
  firstDayOfWeek: 'monday',
};

const DEFAULT_HEALTH: OnboardingHealth = {
  heightCm: '',
  weightKg: '',
  bloodType: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

const DEFAULT_PREFERENCES: OnboardingPreferences = {
  notificationsEnabled: true,
  jarvisVoiceEnabled: true,
  theme: 'system',
  defaultCalendarView: 'agenda',
};

interface OnboardingState {
  /** True once First-Time Setup has been finished — the one flag
   * `AuthLayout` checks to decide Home vs. `/onboarding`. Deliberately
   * separate from `useAuthStore.isAuthenticated`: a user can be signed in
   * with setup still incomplete (interrupted mid-flow), and this flag is
   * the only thing that should ever gate re-entering the wizard. */
  completed: boolean;
  personal: OnboardingPersonal;
  productivity: OnboardingProductivity;
  health: OnboardingHealth;
  preferences: OnboardingPreferences;
  focusAreas: FocusArea[];
  updatePersonal: (patch: Partial<OnboardingPersonal>) => void;
  updateProductivity: (patch: Partial<OnboardingProductivity>) => void;
  updateHealth: (patch: Partial<OnboardingHealth>) => void;
  updatePreferences: (patch: Partial<OnboardingPreferences>) => void;
  toggleFocusArea: (area: FocusArea) => void;
  markCompleted: () => void;
  reset: () => void;
}

/**
 * First-Time Setup's own data — deliberately isolated from
 * `useAuthStore` (login/session) so a real backend can replace auth
 * without this flow (or the data it collects) changing shape. Everything
 * here is local/mock; nothing is sent anywhere. See docs/22 for the
 * eventual real-backend migration note.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      personal: DEFAULT_PERSONAL,
      productivity: DEFAULT_PRODUCTIVITY,
      health: DEFAULT_HEALTH,
      preferences: DEFAULT_PREFERENCES,
      focusAreas: [],
      updatePersonal: (patch) =>
        set((state) => ({ personal: { ...state.personal, ...patch } })),
      updateProductivity: (patch) =>
        set((state) => ({
          productivity: { ...state.productivity, ...patch },
        })),
      updateHealth: (patch) =>
        set((state) => ({ health: { ...state.health, ...patch } })),
      updatePreferences: (patch) =>
        set((state) => ({
          preferences: { ...state.preferences, ...patch },
        })),
      toggleFocusArea: (area) =>
        set((state) => ({
          focusAreas: state.focusAreas.includes(area)
            ? state.focusAreas.filter((a) => a !== area)
            : [...state.focusAreas, area],
        })),
      markCompleted: () => set({ completed: true }),
      reset: () =>
        set({
          completed: false,
          personal: DEFAULT_PERSONAL,
          productivity: DEFAULT_PRODUCTIVITY,
          health: DEFAULT_HEALTH,
          preferences: DEFAULT_PREFERENCES,
          focusAreas: [],
        }),
    }),
    { name: 'lifyq-onboarding' },
  ),
);
