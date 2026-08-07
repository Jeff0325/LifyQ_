import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import { BillFilterBar, BillFormDialog, BillsList } from '@/features/bills';
import { DEFAULT_BILL_FILTERS, type BillFilters } from '@/features/bills/types';

export function Bills() {
  const [filters, setFilters] = useState<BillFilters>(DEFAULT_BILL_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  useJarvisPageContext('Bills', 'your bills list', 'bill');

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Bills</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New bill
        </Button>
      </div>

      <BillFilterBar filters={filters} onChange={setFilters} />

      <BillsList filters={filters} onCreate={() => setFormOpen(true)} />

      <BillFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
