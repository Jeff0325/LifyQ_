import { Skeleton } from '@/components/ui/skeleton';

export function GoalsSkeleton() {
  return (
    <div className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gap-4 p-5 flex flex-col rounded-lg border border-border"
        >
          <div className="gap-3 flex items-start justify-between">
            <div className="gap-2 flex flex-1 flex-col">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="size-14 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
