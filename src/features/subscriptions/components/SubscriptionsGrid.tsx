import { CreditCard } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { SubscriptionCard } from '@/features/subscriptions/components/SubscriptionCard';
import { SubscriptionFormDialog } from '@/features/subscriptions/components/SubscriptionFormDialog';
import { SubscriptionsSkeleton } from '@/features/subscriptions/components/SubscriptionsSkeleton';
import { useSubscriptions } from '@/features/subscriptions/hooks/useSubscriptions';
import type {
  Subscription,
  SubscriptionFilters,
} from '@/features/subscriptions/types';

function matchesFilters(
  sub: Subscription,
  filters: SubscriptionFilters,
): boolean {
  if (filters.category !== 'all' && sub.category !== filters.category)
    return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!sub.serviceName.toLowerCase().includes(needle)) return false;
  }
  return true;
}

function monthlyCost(sub: Subscription): number {
  return sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
}

export interface SubscriptionsGridProps {
  filters: SubscriptionFilters;
  onCreate: () => void;
}

export function SubscriptionsGrid({
  filters,
  onCreate,
}: SubscriptionsGridProps) {
  const { data: subs, isLoading, isError, refetch } = useSubscriptions();
  const [editingSub, setEditingSub] = useState<Subscription | undefined>(
    undefined,
  );

  const visible = useMemo(() => {
    if (!subs) return [];
    return [...subs]
      .filter((sub) => matchesFilters(sub, filters))
      .sort((a, b) => a.nextRenewalAt.localeCompare(b.nextRenewalAt));
  }, [subs, filters]);

  const totalMonthly = useMemo(
    () => (subs ?? []).reduce((sum, sub) => sum + monthlyCost(sub), 0),
    [subs],
  );

  if (isLoading) return <SubscriptionsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your subscriptions"
        onRetry={() => void refetch()}
      />
    );
  }

  if (subs && subs.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No subscriptions yet"
        description="Track what you're paying for so nothing renews as a surprise."
        module="subscriptions"
        action={<Button onClick={onCreate}>New subscription</Button>}
      />
    );
  }

  return (
    <>
      {subs && subs.length > 0 && (
        <p className="text-body-sm text-foreground-secondary">
          <span className="font-semibold text-foreground tabular-nums">
            ${totalMonthly.toFixed(2)}
          </span>{' '}
          / month across {subs.length} subscription
          {subs.length === 1 ? '' : 's'}
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions match your filters"
          description="Try a different search or category."
        />
      ) : (
        <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
          {visible.map((sub) => (
            <StaggerItem key={sub.id}>
              <SubscriptionCard subscription={sub} onEdit={setEditingSub} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <SubscriptionFormDialog
        open={!!editingSub}
        onOpenChange={(open) => !open && setEditingSub(undefined)}
        subscription={editingSub}
      />
    </>
  );
}
