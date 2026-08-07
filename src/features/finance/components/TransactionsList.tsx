import { Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionFormDialog } from '@/features/finance/components/TransactionFormDialog';
import { TransactionRow } from '@/features/finance/components/TransactionRow';
import { useTransactions } from '@/features/finance/hooks/useFinance';
import type { Transaction, TransactionFilters } from '@/features/finance/types';

function matchesFilters(
  transaction: Transaction,
  filters: TransactionFilters,
): boolean {
  if (filters.type !== 'all' && transaction.type !== filters.type) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!(transaction.note ?? '').toLowerCase().includes(needle)) return false;
  }
  return true;
}

export interface TransactionsListProps {
  filters: TransactionFilters;
  onCreate: () => void;
}

export function TransactionsList({ filters, onCreate }: TransactionsListProps) {
  const { data: transactions, isLoading, isError, refetch } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const visible = useMemo(() => {
    if (!transactions) return [];
    return [...transactions]
      .filter((t) => matchesFilters(t, filters))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filters]);

  if (isLoading) {
    return (
      <div className="gap-3 flex flex-col">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your transactions"
        onRetry={() => void refetch()}
      />
    );
  }

  if (transactions && transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Log an expense or income to start tracking your spending."
        module="finance"
        action={<Button onClick={onCreate}>New transaction</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions match your filters"
        description="Try a different search or type."
      />
    );
  }

  return (
    <>
      <StaggerList className="flex flex-col">
        {visible.map((transaction) => (
          <StaggerItem key={transaction.id}>
            <TransactionRow
              transaction={transaction}
              onEdit={setEditingTransaction}
            />
          </StaggerItem>
        ))}
      </StaggerList>

      <TransactionFormDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(undefined)}
        transaction={editingTransaction}
      />
    </>
  );
}
