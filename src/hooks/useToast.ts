import { type ToastItem, useToastStore } from '@/stores/useToastStore';

/**
 * Imperative toast API: `const { toast } = useToast(); toast({ title: '...' })`.
 * Kept as a tiny wrapper over `useToastStore` so call sites never import the
 * store directly — mirrors the shadcn/ui `useToast` ergonomics.
 */
export function useToast() {
  const show = useToastStore((state) => state.show);
  const dismiss = useToastStore((state) => state.dismiss);

  return {
    toast: (toast: Omit<ToastItem, 'id'>) => show(toast),
    dismiss,
  };
}
