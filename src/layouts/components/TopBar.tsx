import { LogOut, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { PRIMARY_NAV_ITEMS } from '@/constants/navigation';
import { ThemeToggle } from '@/layouts/components/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { useJarvisStore } from '@/stores/useJarvisStore';

/**
 * Slim contextual header, persistent across breakpoints. Owns the page
 * title, the global theme control, and the global ICE capture trigger. See
 * docs/10_Navigation_Architecture.md §5.
 *
 * `pt-[env(safe-area-inset-top)]` keeps the title clear of the notch/status
 * bar when running installed (PWA standalone) or wrapped natively
 * (Capacitor) — see docs/28_Mobile_First_Architecture.md.
 *
 * The Sparkles trigger opens the global floating companion
 * (`useJarvisStore.openPanel`, docs/39 addendum) rather than navigating
 * anywhere — Jarvis is reached the same way from every entry point now.
 * Still "reachable from anywhere" (docs/06 §5) — one tap away on every page.
 */
export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const openPanel = useJarvisStore((state) => state.openPanel);
  const signOut = useAuthStore((state) => state.signOut);
  const current = PRIMARY_NAV_ITEMS.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  );

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <header className="top-0 h-14 px-4 backdrop-blur-xl sm:px-6 sticky z-30 flex items-center justify-between border-b border-border bg-background/80 pt-[env(safe-area-inset-top)]">
      <h1 className="font-semibold text-h3 text-foreground">
        {current?.label ?? 'LifyQ'}
      </h1>
      <div className="gap-1 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ask Jarvis"
          onClick={openPanel}
        >
          <Sparkles aria-hidden="true" />
        </Button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => void handleSignOut()}
        >
          <LogOut aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
