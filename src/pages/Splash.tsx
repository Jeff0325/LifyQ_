import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { BrandMark } from '@/components/shared/BrandMark';
import { ROUTES } from '@/constants/routes';

const AUTO_ADVANCE_MS = 1400;

/**
 * Public, full-bleed cold-start screen — the web/PWA equivalent of a native
 * splash screen (which Capacitor will show natively before this even
 * paints, per docs/28_Mobile_First_Architecture.md). Auto-advances once,
 * tap-to-skip via the explicit Skip control; no session/auth/onboarding-
 * completion check yet — that's real app-boot logic for a later milestone.
 */
export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTES.welcome, { replace: true });
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="gap-4 relative flex min-h-dvh w-full flex-col items-center justify-center bg-brand-600 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <BrandMark className="size-16" />
      <h1 className="font-semibold text-h1 text-foreground-on-brand">LifyQ</h1>
      <p className="text-body-sm text-foreground-on-brand/70">
        Your life, intelligently organized.
      </p>
      <button
        type="button"
        onClick={() => navigate(ROUTES.welcome, { replace: true })}
        className="absolute bottom-[max(env(safe-area-inset-bottom),1.5rem)] text-body-sm text-foreground-on-brand/70 underline-offset-4 hover:text-foreground-on-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Skip
      </button>
    </div>
  );
}
