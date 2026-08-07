import { Skeleton } from '@/components/ui/skeleton';

export function DocumentsSkeleton() {
  return (
    <div className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gap-3 p-4 flex flex-col rounded-lg border border-border"
        >
          <div className="gap-2 flex items-center">
            <Skeleton className="size-9 rounded-lg" />
            <div className="gap-1.5 flex flex-1 flex-col">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
