import { Skeleton } from '@/components/ui/skeleton';

export function LeadCardSkeleton() {
  return (
    <div className="w-full text-left p-4 rounded-xl border bg-card border-border">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
        </div>

        <Skeleton className="w-2 h-2 rounded-full mt-1" />
      </div>
    </div>
  );
}
