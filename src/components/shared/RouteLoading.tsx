import { Skeleton } from '@/components/ui/skeleton';

/**
 * Suspense fallback for lazy-loaded route chunks (docs/15_Routing_Strategy.md
 * §4, docs/18_Performance_Strategy.md §2) — a shaped skeleton, never a bare
 * spinner, even for this brief a gap.
 */
export function RouteLoading() {
  return (
    <div className="max-w-2xl gap-4 py-10 mx-auto flex flex-col">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-4 h-32 w-full rounded-xl" />
    </div>
  );
}
