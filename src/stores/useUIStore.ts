import { create } from 'zustand';

interface UIState {
  /** Desktop/tablet sidebar collapsed to icon-rail width. Not persisted —
   * transient chrome state, per docs/14_State_Management_Strategy.md §3/§6. */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;

  /** Mobile "More" tab disclosure open/closed. */
  mobileMoreOpen: boolean;
  setMobileMoreOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () =>
    set({ sidebarCollapsed: !get().sidebarCollapsed }),

  mobileMoreOpen: false,
  setMobileMoreOpen: (open) => set({ mobileMoreOpen: open }),
}));
