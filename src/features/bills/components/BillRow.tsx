import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDeleteBill,
  useToggleBillPaid,
} from '@/features/bills/hooks/useBills';
import { BILL_CATEGORY_LABELS, type Bill } from '@/features/bills/types';
import { describeDue, type DueTone } from '@/features/bills/utils';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const DUE_TONE_CLASS: Record<DueTone, string> = {
  overdue: 'text-danger',
  today: 'text-brand-600',
  soon: 'text-foreground-secondary',
  later: 'text-foreground-tertiary',
};

export interface BillRowProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
}

export function BillRow({ bill, onEdit }: BillRowProps) {
  const togglePaid = useToggleBillPaid();
  const deleteBill = useDeleteBill();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const paid = bill.status === 'paid';
  const due = describeDue(bill);

  const handleDelete = async () => {
    await deleteBill.mutateAsync(bill.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Bill deleted' });
  };

  return (
    <div className="gap-3 px-1 py-3 flex items-center border-b border-border-subtle bg-surface">
      <button
        type="button"
        onClick={() => togglePaid.mutate({ bill })}
        aria-pressed={paid}
        aria-label={
          paid ? `Mark ${bill.title} as unpaid` : `Mark ${bill.title} as paid`
        }
        className={cn(
          'size-8 duration-base ease-standard flex shrink-0 items-center justify-center rounded-full border transition-colors',
          paid
            ? 'border-success bg-success text-foreground-on-brand'
            : 'border-border text-foreground-tertiary hover:border-success hover:text-success',
        )}
      >
        <Check aria-hidden="true" className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-body-sm text-foreground',
            paid && 'text-foreground-tertiary line-through',
          )}
        >
          {bill.title}
        </p>
        <div className="mt-1 gap-2 flex flex-wrap items-center">
          <Badge variant="neutral">{BILL_CATEGORY_LABELS[bill.category]}</Badge>
          {!paid && (
            <span className={cn('text-caption', DUE_TONE_CLASS[due.tone])}>
              {due.label}
            </span>
          )}
          {typeof bill.amount === 'number' && (
            <span className="text-caption text-foreground-tertiary tabular-nums">
              ${bill.amount.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${bill.title}`}
            className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(bill)}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this bill?"
        description={`"${bill.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteBill.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
