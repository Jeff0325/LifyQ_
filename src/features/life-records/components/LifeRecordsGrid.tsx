import { IdCard } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { LifeRecordCard } from '@/features/life-records/components/LifeRecordCard';
import { LifeRecordFormDialog } from '@/features/life-records/components/LifeRecordFormDialog';
import { LifeRecordsSkeleton } from '@/features/life-records/components/LifeRecordsSkeleton';
import { useLifeRecords } from '@/features/life-records/hooks/useLifeRecords';
import type {
  LifeRecord,
  LifeRecordFilters,
} from '@/features/life-records/types';

function matchesFilters(
  record: LifeRecord,
  filters: LifeRecordFilters,
): boolean {
  if (filters.category !== 'all' && record.category !== filters.category)
    return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack =
      `${record.title} ${record.identifier ?? ''} ${record.issuingAuthority ?? ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export interface LifeRecordsGridProps {
  filters: LifeRecordFilters;
  onCreate: () => void;
}

export function LifeRecordsGrid({ filters, onCreate }: LifeRecordsGridProps) {
  const { data: records, isLoading, isError, refetch } = useLifeRecords();
  const [editingRecord, setEditingRecord] = useState<LifeRecord | undefined>(
    undefined,
  );

  const visible = useMemo(() => {
    if (!records) return [];
    return [...records]
      .filter((record) => matchesFilters(record, filters))
      .sort((a, b) =>
        (a.expiresAt ?? '9999').localeCompare(b.expiresAt ?? '9999'),
      );
  }, [records, filters]);

  if (isLoading) return <LifeRecordsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your life records"
        onRetry={() => void refetch()}
      />
    );
  }

  if (records && records.length === 0) {
    return (
      <EmptyState
        icon={IdCard}
        title="No records yet"
        description="Track a passport, license, insurance policy, or anything with an expiration date."
        module="life-records"
        action={<Button onClick={onCreate}>New record</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={IdCard}
        title="No records match your filters"
        description="Try a different search or category."
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
        {visible.map((record) => (
          <StaggerItem key={record.id}>
            <LifeRecordCard record={record} onEdit={setEditingRecord} />
          </StaggerItem>
        ))}
      </StaggerList>

      <LifeRecordFormDialog
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(undefined)}
        record={editingRecord}
      />
    </>
  );
}
