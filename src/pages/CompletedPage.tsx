import { Filter } from 'lucide-react';
import { LeadCardSkeleton } from '@/components/leads/LeadCardSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { LeadResultCard } from '@/components/leads/LeadResultCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { Platform } from '@/data/mockLeads';
import { useStatusLeads } from '@/hooks/useStatusLeads';

export default function CompletedPage() {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    leads: completedLeads,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMoreLeads,
    total,
  } = useStatusLeads({
    status: 'completed',
    platform: platformFilter,
    limit: 20,
  });

  useEffect(() => {
    if (!hasNextPage || isLoading || isLoadingMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    const root =
      scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') ?? null;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreLeads();
        }
      },
      {
        root,
        rootMargin: '200px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isLoading, isLoadingMore, loadMoreLeads]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Completed</h1>
            <p className="text-sm text-muted-foreground">
              Successfully replied conversations ({total})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={platformFilter}
              onValueChange={(value) => setPlatformFilter(value as Platform | 'all')}
            >
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="twitter">X / Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]" ref={scrollAreaRef}>
          <div className="space-y-3">
            {error ? (
              <Card>
                <CardContent className="py-12 text-center text-destructive">
                  <p>Unable to load leads.</p>
                  <p className="text-sm">{error}</p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <LeadCardSkeleton key={`lead-skeleton-${index}`} />
                ))}
              </>
            ) : completedLeads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No completed leads yet</p>
                  <p className="text-sm">Leads you reply to will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {completedLeads.map((lead) => (
                  <LeadResultCard key={lead.id} lead={lead} variant="completed" />
                ))}
                <div ref={sentinelRef} className="h-4" />
                {isLoadingMore && (
                  <>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <LeadCardSkeleton key={`lead-skeleton-more-${index}`} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
