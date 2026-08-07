import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  name: string;
  email: string;
  setProfile: (profile: { name: string; email: string }) => void;
  reset: () => void;
}

/**
 * Locally-cached mirror of the Supabase-sourced profile (hydrated by
 * `useAccountBootstrap`). Persisted for instant paint on next load, but
 * `reset` is called from `useAuthStore.signOut` so a different account
 * signing in on this browser never briefly sees the previous account's
 * name/email before its own bootstrap query resolves.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      setProfile: (profile) => set(profile),
      reset: () => set({ name: '', email: '' }),
    }),
    { name: 'lifyq-profile' },
  ),
);

interface NotificationPrefsState {
  taskReminders: boolean;
  habitReminders: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  setPref: (
    key: keyof Omit<NotificationPrefsState, 'setPref' | 'reset'>,
    value: boolean,
  ) => void;
  reset: () => void;
}

/** UI-only — no real delivery exists yet, per docs/02 §3.8. */
export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      taskReminders: true,
      habitReminders: true,
      weeklyDigest: false,
      productUpdates: false,
      setPref: (key, value) => set({ [key]: value }),
      reset: () =>
        set({
          taskReminders: true,
          habitReminders: true,
          weeklyDigest: false,
          productUpdates: false,
        }),
    }),
    { name: 'lifyq-notification-prefs' },
  ),
);
