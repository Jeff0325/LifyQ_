import * as DialogPrimitive from '@radix-ui/react-dialog';
import { type VariantProps, cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'inset-0 bg-black/50 backdrop-blur-sm fixed z-50',
      // Entrance-only — see the "Known issue" note in docs/27 (exit
      // animations never fire animationend, which stalls Presence unmount).
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Entrance-only animation (see the dialog.tsx / docs/27 "Known issue" note).
const sheetVariants = cva(
  'bg-surface-overlay border-border shadow-elevation-4 fixed z-50 flex flex-col gap-4 backdrop-blur-xl transition ease-standard data-[state=open]:animate-in data-[state=open]:duration-moderate',
  {
    variants: {
      side: {
        // Bottom is the mobile-native default — docs/10_Navigation_Architecture.md §6.
        bottom:
          'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] data-[state=open]:slide-in-from-bottom',
        top: 'inset-x-0 top-0 rounded-b-2xl border-b p-6 data-[state=open]:slide-in-from-top',
        left: 'inset-y-0 left-0 h-full w-full max-w-sm border-r p-6 data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full w-full max-w-sm border-l p-6 data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: { side: 'bottom' },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'bottom', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {side === 'bottom' && (
        <div
          aria-hidden="true"
          className="top-3 h-1 w-10 absolute left-1/2 -translate-x-1/2 rounded-full bg-border"
        />
      )}
      {children}
      <DialogPrimitive.Close className="right-4 top-4 absolute rounded-sm text-foreground-tertiary opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <X aria-hidden="true" className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('gap-1.5 flex flex-col text-left', className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'gap-2 sm:flex-row sm:justify-end flex flex-col-reverse',
        className,
      )}
      {...props}
    />
  );
}

export const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-semibold text-h3 text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-body-sm text-foreground-secondary', className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
