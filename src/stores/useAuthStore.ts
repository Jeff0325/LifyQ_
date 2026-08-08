import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { queryClient } from '@/app/queryClient';
import {
  useNotificationPrefsStore,
  useProfileStore,
} from '@/features/settings/store';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export interface AuthResult {
  error: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  /** False until the first session check (`getSession` +
   * `onAuthStateChange`) resolves — `AuthLayout` waits on this so a
   * returning user isn't flash-redirected to `/splash` before their
   * persisted Supabase session has had a chance to restore. */
  isInitialized: boolean;
  /** True from the moment Supabase fires `PASSWORD_RECOVERY` (user landed
   * back on the app via the reset-password email link) until `updatePassword`
   * succeeds or the user signs out. `Login` uses this to swap in the
   * "set a new password" screen instead of the normal login/signup form. */
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  /** Redirects the browser to Google's consent screen — there's no local
   * result to return; the app reloads at `redirectTo` once Google/Supabase
   * finish, and `onAuthStateChange` picks up the new session from there
   * same as any other sign-in. Only resolves early (with an error) if
   * kicking off the redirect itself fails, e.g. the provider isn't enabled
   * in Supabase yet. */
  signInWithGoogle: () => Promise<AuthResult>;
}

/**
 * Real Supabase Auth — email/password plus Google via
 * `supabase.auth.signInWithOAuth`. Apple Sign-In later is the exact same
 * shape (no store or screen changes needed, just another method here).
 * Session persistence and automatic restoration are handled entirely by
 * the Supabase client itself (`persistSession`/`autoRefreshToken`, both
 * default on) — this store only mirrors whatever `onAuthStateChange`
 * reports, it never reads or writes localStorage directly.
 */
export const useAuthStore = create<AuthState>()(() => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isPasswordRecovery: false,

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });
    if (error) return { error: error.message };
    // Supabase doesn't return an error for an email that's already
    // registered (avoids leaking which emails exist) — instead the
    // returned user has an empty `identities` array and no new
    // confirmation email is actually sent. This is the documented way to
    // detect it: https://supabase.com/docs/reference/javascript/auth-signup
    if (data.user && data.user.identities?.length === 0) {
      return {
        error: 'An account with this email already exists. Try logging in instead.',
      };
    }
    return { error: null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    // Every Supabase-backed query (domain lists, account bundle) and every
    // locally-cached mirror of per-account data is torn down here, in the
    // one place every sign-out path (TopBar, Sidebar, ProfileSection)
    // funnels through — so a different account signing in on this browser
    // never has a window where it sees the previous account's cached data.
    queryClient.clear();
    useProfileStore.getState().reset();
    useNotificationPrefsStore.getState().reset();
    useOnboardingStore.getState().reset();
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error: error?.message ?? null };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (!error) useAuthStore.setState({ isPasswordRecovery: false });
    return { error: error?.message ?? null };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  },
}));

// Registered once at module load — the earliest possible point — so the
// session has the most time to restore before any route decides whether
// to redirect. `onAuthStateChange` fires immediately on subscribe with the
// current state (INITIAL_SESSION), which is what flips `isInitialized`.
// `PASSWORD_RECOVERY` fires once, right after the user lands back on the
// app via the reset-password email link (Supabase auto-exchanges the
// token in the URL for a session before this callback runs) — `Login`
// watches `isPasswordRecovery` to show the "set a new password" screen
// instead of the normal form for that one session.
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isInitialized: true,
    ...(event === 'PASSWORD_RECOVERY' && { isPasswordRecovery: true }),
    ...(event === 'SIGNED_OUT' && { isPasswordRecovery: false }),
  });
});
