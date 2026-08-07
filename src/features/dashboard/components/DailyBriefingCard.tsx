import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDailyBriefing } from '@/features/assistant/mock/dailyBriefing';

/**
 * The Dashboard's lead content, in Jarvis's voice — docs/37 §1's "Home and
 * Jarvis are the same surface" and §4's daily-briefing card. A narrative
 * sentence or two, not another stat grid.
 */
export function DailyBriefingCard() {
  const { data: briefing, isLoading } = useQuery({
    queryKey: ['assistant', 'daily-briefing'],
    queryFn: generateDailyBriefing,
  });

  return (
    <Card className="gap-3 p-5 duration-base ease-standard flex items-start bg-linear-to-br from-brand-600 to-brand-700 transition-colors">
      <Sparkles
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-foreground-on-brand/80"
      />
      {isLoading ? (
        <Skeleton className="h-5 bg-white/20 w-full" />
      ) : (
        <p className="text-body-sm text-foreground-on-brand">{briefing}</p>
      )}
    </Card>
  );
}
