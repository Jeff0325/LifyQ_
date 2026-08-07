import { Skeleton } from '@/components/ui/skeleton';

export function CalendarSkeleton() {
  return (
    <div className="gap-4 flex flex-col">
      <div className="gap-2 flex">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-14 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="gap-3 flex flex-col">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="gap-3 py-1 flex items-start">
            <Skeleton className="mt-1.5 size-2 rounded-full" />
            <div className="gap-2 flex flex-1 flex-col">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
