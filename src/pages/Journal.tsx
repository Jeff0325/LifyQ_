import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  JournalEntriesList,
  JournalEntryFormDialog,
  JournalFilterBar,
} from '@/features/journal';
import {
  DEFAULT_JOURNAL_FILTERS,
  type JournalFilters,
} from '@/features/journal/types';

export function Journal() {
  const [filters, setFilters] = useState<JournalFilters>(
    DEFAULT_JOURNAL_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Journal</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New entry
        </Button>
      </div>

      <JournalFilterBar filters={filters} onChange={setFilters} />

      <JournalEntriesList
        filters={filters}
        onCreate={() => setFormOpen(true)}
      />

      <JournalEntryFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
