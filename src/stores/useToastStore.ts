import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'danger';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastItem[];
  show: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

/**
 * Global toast queue. Zustand client state per
 * docs/14_State_Management_Strategy.md §3 — toasts are transient UI state,
 * not async/server data. `Toaster` (components/ui/toaster.tsx) renders this
 * queue through the Radix Toast primitive; call `useToast()` to enqueue.
 */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
