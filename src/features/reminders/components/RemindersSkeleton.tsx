import { Skeleton } from '@/components/ui/skeleton';

export function RemindersSkeleton() {
  return (
    <div className="gap-3 flex flex-col">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="gap-3 py-2 flex items-center">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="gap-2 flex flex-1 flex-col">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
