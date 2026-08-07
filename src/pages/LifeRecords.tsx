import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  LifeRecordFilterBar,
  LifeRecordFormDialog,
  LifeRecordsGrid,
} from '@/features/life-records';
import {
  DEFAULT_LIFE_RECORD_FILTERS,
  type LifeRecordFilters,
} from '@/features/life-records/types';

export function LifeRecords() {
  const [filters, setFilters] = useState<LifeRecordFilters>(
    DEFAULT_LIFE_RECORD_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Life Records</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New record
        </Button>
      </div>

      <LifeRecordFilterBar filters={filters} onChange={setFilters} />

      <LifeRecordsGrid filters={filters} onCreate={() => setFormOpen(true)} />

      <LifeRecordFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
