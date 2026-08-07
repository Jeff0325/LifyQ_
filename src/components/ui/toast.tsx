import * as ToastPrimitive from '@radix-ui/react-toast';
import { type VariantProps, cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'bottom-0 gap-2 p-4 fixed z-[100] flex max-h-screen w-full flex-col-reverse',
      'sm:bottom-4 sm:right-4 sm:w-96 sm:pb-[max(env(safe-area-inset-bottom),1rem)]',
      // Clear of the mobile bottom tab bar (~64px) on small screens.
      'sm:pb-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  'border-border bg-surface-raised shadow-elevation-3 relative flex w-full items-start gap-3 rounded-xl border p-4',
  {
    variants: {
      variant: {
        default: '',
        success: 'border-success/30',
        danger: 'border-danger/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface ToastRootProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

export const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      toastVariants({ variant }),
      // Entrance-only — see the "Known issue" note in docs/27. Radix's own
      // remove-after-duration + swipe-dismiss logic (not animationend)
      // still unmounts the toast correctly; only the exit *animation* is
      // dropped, so a toast disappears instantly instead of sliding out.
      'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
      className,
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('font-semibold text-body-sm text-foreground', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-body-sm text-foreground-secondary', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'right-3 top-3 absolute rounded-sm text-foreground-tertiary opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      className,
    )}
    aria-label="Close"
    {...props}
  >
    <X aria-hidden="true" className="size-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

export const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'font-medium shrink-0 text-body-sm text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;
