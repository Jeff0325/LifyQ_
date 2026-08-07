import { Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { BillFormDialog } from '@/features/bills/components/BillFormDialog';
import { BillRow } from '@/features/bills/components/BillRow';
import { BillsSkeleton } from '@/features/bills/components/BillsSkeleton';
import { useBills } from '@/features/bills/hooks/useBills';
import type { Bill, BillFilters } from '@/features/bills/types';

function matchesFilters(bill: Bill, filters: BillFilters): boolean {
  if (filters.status !== 'all' && bill.status !== filters.status) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!bill.title.toLowerCase().includes(needle)) return false;
  }
  return true;
}

export interface BillsListProps {
  filters: BillFilters;
  onCreate: () => void;
}

export function BillsList({ filters, onCreate }: BillsListProps) {
  const { data: bills, isLoading, isError, refetch } = useBills();
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);

  const visible = useMemo(() => {
    if (!bills) return [];
    return [...bills]
      .filter((bill) => matchesFilters(bill, filters))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [bills, filters]);

  if (isLoading) return <BillsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your bills"
        onRetry={() => void refetch()}
      />
    );
  }

  if (bills && bills.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No bills yet"
        description="Track a recurring or one-time bill so nothing slips past due."
        module="bills"
        action={<Button onClick={onCreate}>New bill</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No bills match your filters"
        description="Try a different search or status."
      />
    );
  }

  return (
    <>
      <StaggerList className="flex flex-col">
        {visible.map((bill) => (
          <StaggerItem key={bill.id}>
            <BillRow bill={bill} onEdit={setEditingBill} />
          </StaggerItem>
        ))}
      </StaggerList>

      <BillFormDialog
        open={!!editingBill}
        onOpenChange={(open) => !open && setEditingBill(undefined)}
        bill={editingBill}
      />
    </>
  );
}
