import { useEffect } from 'react';

import { useJarvisStore } from '@/stores/useJarvisStore';

/**
 * Registers the entity a detail page is currently showing as Jarvis's
 * "what am I looking at" context (docs/41) — lets `useConversationManager`
 * resolve pronoun-only questions ("tell me more about this") without the
 * user naming the entity. `summary` should be a short natural-language
 * description built from fields the page already has loaded (e.g. a Goal's
 * title/progress/target date) — pass `undefined`/`null` while the entity is
 * still loading or wasn't found, so Jarvis never answers from stale context.
 *
 * Call once per detail page, after the entity's own data hook resolves —
 * see `src/pages/GoalDetail.tsx`, `ProjectDetail.tsx`, `GroceryListDetail.tsx`.
 * Clears itself on unmount, so navigating away always drops the context.
 */
export function useJarvisPageContext(
  label: string,
  summary: string | null | undefined,
  domain?: string,
): void {
  const setActiveContext = useJarvisStore((state) => state.setActiveContext);

  useEffect(() => {
    if (!summary) return;
    setActiveContext({ label, summary, domain });
    return () => setActiveContext(null);
  }, [label, summary, domain, setActiveContext]);
}
