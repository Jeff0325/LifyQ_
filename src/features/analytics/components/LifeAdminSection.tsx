import { CreditCard, Receipt } from 'lucide-react';

import { Card, CardTitle } from '@/components/ui/card';
import { AnalyticsStatTile } from '@/features/analytics/components/AnalyticsStatTile';
import {
  billsPaidRate,
  totalMonthlySubscriptionCost,
} from '@/features/analytics/utils';
import { useBills } from '@/features/bills';
import { useSubscriptions } from '@/features/subscriptions';

/**
 * A compact stat-only section for the household-admin cluster (docs/07
 * Phase 2) — Life Records, Documents, and Grocery Lists don't carry an
 * obvious numeric trend to chart, so this stays intentionally small rather
 * than forcing a chart where a count already says everything useful. See
 * docs/33's "Remaining Limitations" for the explicit scope note.
 */
export function LifeAdminSection() {
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();

  const { paid, total } = billsPaidRate(bills ?? []);
  const monthlyCost = totalMonthlySubscriptionCost(subscriptions ?? []);

  return (
    <Card className="gap-4 p-5 flex flex-col">
      <CardTitle>Life admin</CardTitle>
      <div className="gap-3 sm:grid-cols-2 grid grid-cols-1">
        <AnalyticsStatTile
          icon={Receipt}
          label="Bills paid this cycle"
          value={total === 0 ? '—' : `${paid}/${total}`}
          loading={billsLoading}
          tone={total > 0 && paid === total ? 'success' : 'brand'}
        />
        <AnalyticsStatTile
          icon={CreditCard}
          label="Subscriptions / mo"
          value={`$${monthlyCost.toFixed(0)}`}
          loading={subsLoading}
          tone="warning"
        />
      </div>
    </Card>
  );
}
