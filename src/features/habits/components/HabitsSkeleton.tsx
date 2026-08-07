import { Skeleton } from '@/components/ui/skeleton';

export function HabitsSkeleton() {
  return (
    <div className="gap-3 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gap-3 p-4 flex flex-col rounded-lg border border-border"
        >
          <div className="gap-3 flex items-start justify-between">
            <div className="gap-2 flex flex-1 flex-col">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
