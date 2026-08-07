import { Skeleton } from '@/components/ui/skeleton';

export function TasksSkeleton() {
  return (
    <div className="gap-0 flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gap-3 px-1 py-3 flex items-start border-b border-border-subtle"
        >
          <Skeleton className="mt-0.5 size-5 shrink-0 rounded-sm" />
          <div className="gap-2 flex flex-1 flex-col">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
