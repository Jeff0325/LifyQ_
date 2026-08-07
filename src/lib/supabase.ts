import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !publishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — see .env.local',
  );
}

/**
 * The one Supabase client for the whole app. `persistSession`/
 * `autoRefreshToken` (both default true) are what makes session
 * persistence + automatic restoration on app boot work — `useAuthStore`
 * just mirrors whatever this client reports via `onAuthStateChange`, it
 * never manages the session itself. Swapping in Google/Apple Sign-In
 * later is `supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' })`
 * against this same client — no architecture change.
 */
export const supabase = createClient(url, publishableKey);
