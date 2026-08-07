import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  useDeleteBudget,
  useTransactions,
} from '@/features/finance/hooks/useFinance';
import {
  TRANSACTION_CATEGORY_LABELS,
  type Budget,
} from '@/features/finance/types';
import { computeSpent } from '@/features/finance/utils';
import { useToast } from '@/hooks/useToast';

export interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const { data: transactions } = useTransactions();
  const deleteBudget = useDeleteBudget();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const spent = computeSpent(budget, transactions ?? []);
  const percent =
    budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
  const overBudget = spent > budget.limit;

  const handleDelete = async () => {
    await deleteBudget.mutateAsync(budget.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Budget deleted' });
  };

  return (
    <Card className="min-w-0 gap-3 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 gap-1 flex flex-col">
          <h3 className="font-semibold text-body-sm text-foreground">
            {TRANSACTION_CATEGORY_LABELS[budget.category]}
          </h3>
          <p className="text-caption text-foreground-tertiary">
            {budget.period === 'monthly' ? 'Monthly' : 'Weekly'} limit $
            {budget.limit.toFixed(2)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${TRANSACTION_CATEGORY_LABELS[budget.category]} budget`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(budget)}>
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Progress value={Math.min(percent, 100)} />

      <div className="flex items-center justify-between text-caption">
        <span className="text-foreground-secondary">
          ${spent.toFixed(2)} of ${budget.limit.toFixed(2)}
        </span>
        {overBudget && <Badge variant="danger">Over budget</Badge>}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this budget?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteBudget.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
