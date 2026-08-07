import type * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QUERY_LG, useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export interface ResponsiveFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * The one create/edit form shell every feature uses — a centered Dialog at
 * `lg`+, a native-feeling bottom Sheet below it, sharing the same form body
 * so validation/state logic is never duplicated per breakpoint. See
 * docs/10_Navigation_Architecture.md §6 and docs/30_Core_Feature_Implementation.md.
 */
export function ResponsiveFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ResponsiveFormSheetProps) {
  const isDesktop = useMediaQuery(QUERY_LG);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="gap-4 flex flex-col">{children}</div>
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="gap-4 py-1 flex flex-col">{children}</div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
