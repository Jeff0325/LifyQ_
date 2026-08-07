import { Navigate, Outlet } from 'react-router-dom';

import { RouteLoading } from '@/components/shared/RouteLoading';
import { ROUTES } from '@/constants/routes';
import { useAccountBootstrap } from '@/features/settings/hooks/useAccountBootstrap';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * The app-boot gate every AppShell route sits behind: no session →
 * `/splash` (the Launch App moment, which itself auto-advances to
 * `/welcome`), signed in but First-Time Setup unfinished (per
 * `user_settings.onboarding_completed` in Supabase, not a local flag —
 * so this is correct per-account, not per-browser) → `/onboarding`,
 * otherwise through to the app. Waits on `isInitialized`
 * (`useAuthStore`) and the account bootstrap query before deciding
 * anything, so a returning user's real session/setup state has a chance
 * to restore before any redirect fires.
 */
export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const bootstrap = useAccountBootstrap();

  if (!isInitialized) return <RouteLoading />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.splash} replace />;
  }
  if (bootstrap.isLoading) return <RouteLoading />;
  if (bootstrap.data && !bootstrap.data.settings.onboardingCompleted) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }
  return <Outlet />;
}
