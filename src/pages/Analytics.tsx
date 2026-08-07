import { PageContainer } from '@/components/shared/PageContainer';
import {
  AnalyticsOverview,
  FinanceSection,
  LifeAdminSection,
  ProductivitySection,
} from '@/features/analytics';

/**
 * Cross-domain insight — the last Phase 3 pillar (docs/07_Feature_Roadmap.md),
 * deliberately built last because it aggregates every other domain. Has no
 * repository or mock data of its own; every number here is derived live
 * from the same domain repositories Tasks/Goals/Habits/Finance/Bills/
 * Subscriptions already own (see src/features/analytics/utils.ts).
 */
export function Analytics() {
  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-1 flex flex-col">
        <h2 className="font-semibold text-h2 text-foreground">Analytics</h2>
        <p className="text-body-sm text-foreground-tertiary">
          Trends across your tasks, goals, habits, and finances.
        </p>
      </div>

      <AnalyticsOverview />
      <ProductivitySection />
      <FinanceSection />
      <LifeAdminSection />
    </PageContainer>
  );
}
