import { Skeleton } from '@/components/ui/skeleton';

export function NotesSkeleton() {
  return (
    <div className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="gap-2 p-4 flex flex-col rounded-lg border border-border"
        >
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
