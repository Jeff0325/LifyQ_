import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { RouteLoading } from '@/components/shared/RouteLoading';
import { BottomNav } from '@/layouts/components/BottomNav';
import { Sidebar } from '@/layouts/components/Sidebar';
import { TopBar } from '@/layouts/components/TopBar';
import { useUIStore } from '@/stores/useUIStore';

/**
 * The application chrome: responsive Sidebar/BottomNav + TopBar wrapping
 * routed content. One shell, adaptive per breakpoint — see
 * docs/10_Navigation_Architecture.md.
 *
 * Route content renders via plain `<Outlet />`, not an AnimatePresence
 * cross-fade. A `PresenceRoute` wrapper was built and then removed this
 * milestone after live testing found it left navigation stuck on the
 * previous page (URL and TopBar title updated; routed content did not) —
 * confirmed independent of `AnimatePresence` mode and of where the
 * `Suspense` boundary sat relative to it. Plain `Outlet` is the verified-
 * correct baseline; see docs/28_Mobile_First_Architecture.md for the full
 * account and what would need investigating before re-attempting this.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const setMoreOpen = useUIStore((state) => state.setMobileMoreOpen);

  // Close the mobile "More" disclosure whenever the route changes.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname, setMoreOpen]);

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex flex-1 flex-col">
        <TopBar />
        <main
          id="main-content"
          tabIndex={-1}
          className="px-4 pb-24 pt-4 sm:px-6 sm:pb-8 lg:pb-8 flex-1 outline-none"
        >
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
