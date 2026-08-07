import { CreditCard, IdCard, Receipt, ShoppingCart } from 'lucide-react';

import { useBills } from '@/features/bills';
import { StatTile } from '@/features/dashboard/components/StatTile';
import { useGroceryLists } from '@/features/grocery-lists';
import { describeExpiry, useLifeRecords } from '@/features/life-records';
import { useSubscriptions } from '@/features/subscriptions';
import { todayIso } from '@/lib/date';

function monthlyCost(cost: number, cycle: 'monthly' | 'yearly'): number {
  return cycle === 'yearly' ? cost / 12 : cost;
}

/**
 * The household-administration modules' stat row (Bills, Subscriptions,
 * Life Records, Grocery Lists). Trimmed to stats only — the "Needs
 * attention" list this used to render is now part of the merged
 * `UrgencyFeed` on the redesigned Home (docs/37_Dashboard_Design_Philosophy.md
 * §7's migration table), so it isn't duplicated in two places on the same
 * screen. This row lives in the "See everything" disclosure layer now.
 */
export function LifeAdminOverview() {
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();
  const { data: records, isLoading: recordsLoading } = useLifeRecords();
  const { data: lists, isLoading: listsLoading } = useGroceryLists();

  const today = todayIso();
  const overdueOrTodayBills = (bills ?? []).filter(
    (b) => b.status !== 'paid' && b.dueDate <= today,
  );
  const monthlySpend = (subscriptions ?? []).reduce(
    (sum, sub) => sum + monthlyCost(sub.cost, sub.billingCycle),
    0,
  );
  const urgentRecords = (records ?? []).filter((r) => {
    const status = describeExpiry(r.expiresAt);
    return status === 'expired' || status === 'expiring_soon';
  });
  const activeLists =
    lists?.filter((l) => l.items.some((item) => !item.checked)).length ?? 0;

  return (
    <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
      <StatTile
        icon={Receipt}
        label="Bills due"
        value={String(overdueOrTodayBills.length)}
        loading={billsLoading}
        tone={overdueOrTodayBills.length > 0 ? 'danger' : 'brand'}
      />
      <StatTile
        icon={CreditCard}
        label="Subscriptions / mo"
        value={`$${monthlySpend.toFixed(0)}`}
        loading={subsLoading}
        tone="warning"
      />
      <StatTile
        icon={IdCard}
        label="Records expiring"
        value={String(urgentRecords.length)}
        loading={recordsLoading}
        tone={urgentRecords.length > 0 ? 'danger' : 'brand'}
      />
      <StatTile
        icon={ShoppingCart}
        label="Active grocery lists"
        value={String(activeLists)}
        loading={listsLoading}
        tone="success"
      />
    </div>
  );
}
