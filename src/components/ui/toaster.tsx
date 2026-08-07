import { AlertCircle, CheckCircle2 } from 'lucide-react';

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToastStore } from '@/stores/useToastStore';

const VARIANT_ICON = {
  default: null,
  success: CheckCircle2,
  danger: AlertCircle,
} as const;

/**
 * Mounted once in RootLayout (docs/12_Folder_Architecture.md §2). Renders
 * whatever `useToastStore` currently holds — enqueue via `useToast()`.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, variant = 'default', action }) => {
        const Icon = VARIANT_ICON[variant];
        return (
          <Toast
            key={id}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
          >
            {Icon && (
              <Icon
                aria-hidden="true"
                className={
                  variant === 'success'
                    ? 'mt-0.5 size-5 shrink-0 text-success'
                    : 'mt-0.5 size-5 shrink-0 text-danger'
                }
              />
            )}
            <div className="gap-1 flex flex-1 flex-col">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && (
              <ToastAction altText={action.label} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
