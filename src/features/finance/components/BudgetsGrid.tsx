import { Wallet } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetCard } from '@/features/finance/components/BudgetCard';
import { BudgetFormDialog } from '@/features/finance/components/BudgetFormDialog';
import { useBudgets } from '@/features/finance/hooks/useFinance';
import type { Budget } from '@/features/finance/types';

export interface BudgetsGridProps {
  onCreate: () => void;
}

export function BudgetsGrid({ onCreate }: BudgetsGridProps) {
  const { data: budgets, isLoading, isError, refetch } = useBudgets();
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(
    undefined,
  );

  if (isLoading) {
    return (
      <div className="gap-3 sm:grid-cols-2 grid grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your budgets"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No budgets yet"
        description="Set a spending limit for a category to track it here."
        module="finance"
        action={<Button onClick={onCreate}>New budget</Button>}
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-3 sm:grid-cols-2 grid grid-cols-1">
        {budgets.map((budget) => (
          <StaggerItem key={budget.id}>
            <BudgetCard budget={budget} onEdit={setEditingBudget} />
          </StaggerItem>
        ))}
      </StaggerList>

      <BudgetFormDialog
        open={!!editingBudget}
        onOpenChange={(open) => !open && setEditingBudget(undefined)}
        budget={editingBudget}
      />
    </>
  );
}
