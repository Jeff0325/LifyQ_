import { Skeleton } from '@/components/ui/skeleton';

export function BillsSkeleton() {
  return (
    <div className="gap-3 flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="gap-3 py-3 flex items-center">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="gap-2 flex flex-1 flex-col">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
