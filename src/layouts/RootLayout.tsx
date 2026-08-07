import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { Outlet } from 'react-router-dom';

import { queryClient } from '@/app/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { JarvisRoot } from '@/features/assistant/components/JarvisRoot';
import { useAppliedTheme } from '@/hooks/useAppliedTheme';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

/**
 * Top-level layout: applies the resolved theme, mounts app-wide providers
 * (data, motion, tooltip, toast), and provides a skip-to-content link. See
 * docs/12_Folder_Architecture.md §2.
 *
 * `QueryClientProvider` is the async-state seam described in
 * docs/13_Technical_Architecture.md §4 — every feature's hooks call it
 * transparently whether the repository underneath is mock (now) or
 * Supabase (later).
 *
 * `MotionConfig reducedMotion="user"` is the single global switch that
 * makes every `motion.*` element and shared motion wrapper
 * (components/shared/motion) automatically drop transform/layout animation
 * for users with `prefers-reduced-motion: reduce` — docs/19 §6.
 *
 * `JarvisRoot` mounts here — a sibling of `<Outlet/>`, not inside
 * `AppShell` — so it survives every route change as one persistent global
 * instance (docs/39 addendum, "Jarvis as the Center of LifyQ").
 */
export function RootLayout() {
  useAppliedTheme();
  useKeyboardInset();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>
          <a
            href="#main-content"
            className="px-4 py-2 font-medium focus:left-4 focus:top-4 sr-only rounded-md bg-brand-600 text-body-sm text-foreground-on-brand focus:not-sr-only focus:fixed focus:z-50"
          >
            Skip to content
          </a>
          <Outlet />
          <JarvisRoot />
          <Toaster />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
