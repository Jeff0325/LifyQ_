import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  SubscriptionFilterBar,
  SubscriptionFormDialog,
  SubscriptionsGrid,
} from '@/features/subscriptions';
import {
  DEFAULT_SUBSCRIPTION_FILTERS,
  type SubscriptionFilters,
} from '@/features/subscriptions/types';

export function Subscriptions() {
  const [filters, setFilters] = useState<SubscriptionFilters>(
    DEFAULT_SUBSCRIPTION_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Subscriptions</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New subscription
        </Button>
      </div>

      <SubscriptionFilterBar filters={filters} onChange={setFilters} />

      <SubscriptionsGrid filters={filters} onCreate={() => setFormOpen(true)} />

      <SubscriptionFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
