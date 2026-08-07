import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteTransaction } from '@/features/finance/hooks/useFinance';
import {
  TRANSACTION_CATEGORY_LABELS,
  type Transaction,
} from '@/features/finance/types';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const deleteTransaction = useDeleteTransaction();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    await deleteTransaction.mutateAsync(transaction.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Transaction deleted' });
  };

  return (
    <div className="gap-3 px-1 py-3 flex items-center border-b border-border-subtle">
      <div className="min-w-0 flex-1">
        <div className="gap-2 flex items-center">
          <Badge variant="neutral">
            {TRANSACTION_CATEGORY_LABELS[transaction.category]}
          </Badge>
          {transaction.note && (
            <p className="truncate text-body-sm text-foreground">
              {transaction.note}
            </p>
          )}
        </div>
        <p className="mt-1 text-caption text-foreground-tertiary">
          {new Date(`${transaction.date}T00:00:00`).toLocaleDateString(
            undefined,
            { month: 'short', day: 'numeric', year: 'numeric' },
          )}
        </p>
      </div>

      <span
        className={cn(
          'font-semibold shrink-0 text-body-sm tabular-nums',
          isIncome ? 'text-success' : 'text-foreground',
        )}
      >
        {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for transaction on ${transaction.date}`}
            className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(transaction)}>
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
        title="Delete this transaction?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteTransaction.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
