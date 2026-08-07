import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchAccountBundle } from '@/features/settings/api/account';
import { useProfileStore } from '@/features/settings/store';
import { useAuthStore } from '@/stores/useAuthStore';
import { useJarvisStore } from '@/stores/useJarvisStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';

export const accountBundleKey = (userId: string) => ['account', userId];

/**
 * Runs once per session, right after auth resolves — fetches
 * profile/settings/plan from Supabase and hydrates the local stores that
 * already drive the UI (`useProfileStore` for Home's greeting/Jarvis's
 * `firstName`, `usePreferencesStore` for theme, `useJarvisStore` for
 * voice) so a returning user on a fresh device sees their real data
 * immediately, not stale/default local state. `AuthLayout` reads this
 * hook's `data`/`isLoading` to decide Home vs. `/onboarding`.
 */
export function useAccountBootstrap() {
  const userId = useAuthStore((state) => state.user?.id);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const voiceEnabled = useJarvisStore((state) => state.voiceEnabled);
  const toggleVoice = useJarvisStore((state) => state.toggleVoice);

  const query = useQuery({
    queryKey: userId ? accountBundleKey(userId) : ['account', 'none'],
    queryFn: () => fetchAccountBundle(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const { profile, settings } = query.data;
    const fullName =
      profile.displayName ||
      [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    if (fullName) setProfile({ name: fullName, email: profile.email });
    setTheme(settings.theme);
    if (voiceEnabled !== settings.jarvisVoiceEnabled) toggleVoice();
    // Only re-run when the fetched bundle itself changes — not on every
    // voiceEnabled toggle the user makes afterward, which would fight
    // their own in-app choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, setProfile, setTheme]);

  return query;
}
