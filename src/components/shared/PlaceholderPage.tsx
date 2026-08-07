import type { LucideIcon } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';

export interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * The stand-in for every application route that doesn't have a real
 * feature built yet (docs/28_Mobile_First_Architecture.md). Deliberately
 * has no props beyond copy — no data fetching, no interaction, so it can
 * never accidentally grow feature logic before its milestone arrives.
 */
export function PlaceholderPage({
  icon,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <PageContainer size="sm">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        tone="brand"
        className="py-20 sm:py-28"
      />
    </PageContainer>
  );
}
