import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useJarvisStore } from '@/stores/useJarvisStore';

/**
 * Deep-link safety net for the old `/assistant` and `/capture` routes —
 * Jarvis is reached via the floating companion now, not a dedicated page
 * (docs/39 addendum). Hands an optional `?q=` param to the global panel via
 * `useJarvisStore` (the same "queue then open" path `QuickCaptureBar`'s
 * query fallback uses), then redirects home.
 */
export function JarvisRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queuePendingQuery = useJarvisStore((state) => state.queuePendingQuery);
  const openPanel = useJarvisStore((state) => state.openPanel);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const pending = searchParams.get('q');
    if (pending) {
      queuePendingQuery(pending);
    } else {
      openPanel();
    }
    navigate(ROUTES.home, { replace: true });
  }, [searchParams, queuePendingQuery, openPanel, navigate]);

  return null;
}
