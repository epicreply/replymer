import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Filter, RotateCcw, Trash2 } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { PlatformBadge } from '@/components/leads/PlatformBadge';
import { LeadCardSkeleton } from '@/components/leads/LeadCardSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import { Platform } from '@/data/mockLeads';
import { useStatusLeads } from '@/hooks/useStatusLeads';

export default function DiscardedPage() {
  const { restoreLead: restoreLeadInContext } = useLeads();
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    leads: discardedLeads,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMoreLeads,
    total,
    removeLead,
  } = useStatusLeads({
    status: 'discarded',
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

  const handleRestore = (leadId: string) => {
    restoreLeadInContext(leadId);
    removeLead(leadId);
    toast({
      title: 'Lead restored',
      description: 'The lead has been moved back to Inbox.',
    });
  };

  const handleBulkDelete = () => {
    toast({
      title: 'Delete all discarded',
      description: 'This feature will be available soon.',
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Discarded</h1>
            <p className="text-sm text-muted-foreground">
              Leads marked as not relevant ({total})
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
            {discardedLeads.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]" ref={scrollAreaRef}>
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
            ) : discardedLeads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No discarded leads</p>
                  <p className="text-sm">Leads you mark as not relevant will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {discardedLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-sm transition-shadow opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <PlatformBadge platform={lead.platform} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <span>{lead.community}</span>
                            <span>•</span>
                            <span>{lead.authorHandle}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground mb-2 line-clamp-1">
                            {lead.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lead.content}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(lead.id)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={lead.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
