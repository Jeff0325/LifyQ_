import { useEffect, useRef } from 'react';

import { JarvisPanel } from '@/features/assistant/components/JarvisPanel';
import { useConversationManager } from '@/features/assistant/hooks/useConversationManager';
import { useJarvisStore } from '@/stores/useJarvisStore';

/**
 * Mounted once in `RootLayout`, sibling of `<Outlet/>` — the single global
 * instance of Jarvis's floating companion. Owns the one
 * `useConversationManager()` instance for the app's lifetime.
 *
 * No separate floating chat-head bubble and no full-screen intro splash —
 * the center Jarvis button already in `BottomNav`/`Sidebar`/`TopBar` is the
 * single open affordance, and the greeting is typed into the chat thread
 * itself (see `useConversationManager`'s greeting effect). When minimized,
 * this renders nothing.
 */
export function JarvisRoot() {
  const panelState = useJarvisStore((state) => state.panelState);
  const pendingQuery = useJarvisStore((state) => state.pendingQuery);
  const clearPendingQuery = useJarvisStore((state) => state.clearPendingQuery);
  const conversation = useConversationManager();
  const { sendMessage } = conversation;
  const consumedRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      panelState === 'expanded' &&
      pendingQuery &&
      consumedRef.current !== pendingQuery
    ) {
      consumedRef.current = pendingQuery;
      clearPendingQuery();
      void sendMessage(pendingQuery, 'text');
    }
  }, [panelState, pendingQuery, clearPendingQuery, sendMessage]);

  if (panelState === 'chathead') return null;
  return <JarvisPanel conversation={conversation} />;
}
