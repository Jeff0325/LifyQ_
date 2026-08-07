import { useEffect } from 'react';

/**
 * Tracks how much the on-screen keyboard has shrunk the visible viewport
 * (via the VisualViewport API) and reflects it as a `--keyboard-inset` CSS
 * custom property on `<html>`. Mounted once in RootLayout.
 *
 * Usage in a form/sheet that must stay above the keyboard:
 * `pb-[max(var(--keyboard-inset,0px),env(safe-area-inset-bottom))]`.
 *
 * `100dvh`/`100svh` (already used throughout the shell) already handle most
 * keyboard-safe sizing automatically in modern mobile browsers — this hook
 * exists for the remaining case where a fixed-position element needs to
 * react to the keyboard explicitly (e.g. nudging a focused input's
 * container above it). See docs/28_Mobile_First_Architecture.md.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const root = document.documentElement;

    const update = () => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      root.style.setProperty('--keyboard-inset', `${inset}px`);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty('--keyboard-inset');
    };
  }, []);
}
