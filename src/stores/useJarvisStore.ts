import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JarvisPanelState = 'chathead' | 'expanded' | 'listening';

/** What page/entity the user is currently looking at, registered by
 * `useJarvisPageContext` — lets Jarvis resolve pronoun-only questions
 * ("tell me more about this") without the user naming anything. */
export interface JarvisActiveContext {
  label: string;
  summary: string;
  /** The `CaptureDomain` this page/entity belongs to, when known — lets
   * the Conversation Manager bias a low-confidence capture toward this
   * domain instead of the generic task fallback. */
  domain?: string;
}

interface JarvisState {
  /** Persisted — gates which greeting `useConversationManager` types into
   * the chat on open: the full one-time introduction the first time ever,
   * a short contextual greeting every time after. */
  hasSeenIntro: boolean;
  /** Not persisted — every fresh load starts minimized. Panel only opens
   * on an explicit click (nav button, QuickCaptureBar, deep link). */
  panelState: JarvisPanelState;
  /** Not persisted, only meaningful while `panelState === 'expanded'` —
   * the full-screen conversation mode. Reset to `false` on minimize, so
   * reopening later always starts docked. */
  isFullscreen: boolean;
  /** Persisted — whether Jarvis speaks its replies aloud. Default on. */
  voiceEnabled: boolean;
  /** A query handed off from `QuickCaptureBar` or a deep link that should
   * be submitted once the panel reaches `'expanded'`. */
  pendingQuery: string | null;
  /** Set by whichever page is currently mounted, cleared on unmount. */
  activeContext: JarvisActiveContext | null;

  openPanel: () => void;
  completeIntro: () => void;
  minimizePanel: () => void;
  toggleFullscreen: () => void;
  toggleVoice: () => void;
  startListening: () => void;
  stopListening: () => void;
  queuePendingQuery: (text: string) => void;
  clearPendingQuery: () => void;
  setActiveContext: (context: JarvisActiveContext | null) => void;
}

/**
 * Jarvis's floating-companion presentation state + Application Context
 * (one of the Conversation Manager's separated responsibilities — see
 * `useConversationManager.ts`). Every entry point calls into this store
 * rather than navigating to a route or owning panel state itself.
 * Conversation history/session memory live in the Conversation Manager,
 * not here.
 */
export const useJarvisStore = create<JarvisState>()(
  persist(
    (set, get) => ({
      hasSeenIntro: false,
      panelState: 'chathead',
      isFullscreen: false,
      voiceEnabled: true,
      pendingQuery: null,
      activeContext: null,

      openPanel: () => set({ panelState: 'expanded' }),
      completeIntro: () => set({ hasSeenIntro: true }),
      minimizePanel: () => set({ panelState: 'chathead', isFullscreen: false }),
      toggleFullscreen: () =>
        set((state) => ({ isFullscreen: !state.isFullscreen })),
      toggleVoice: () =>
        set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      startListening: () => set({ panelState: 'listening' }),
      stopListening: () => set({ panelState: 'expanded' }),
      queuePendingQuery: (text) => {
        set({ pendingQuery: text });
        get().openPanel();
      },
      clearPendingQuery: () => set({ pendingQuery: null }),
      setActiveContext: (context) => set({ activeContext: context }),
    }),
    {
      name: 'lifyq-jarvis',
      partialize: (state) => ({
        hasSeenIntro: state.hasSeenIntro,
        voiceEnabled: state.voiceEnabled,
      }),
    },
  ),
);
