import { useLeads } from '@/context/LeadsContext';
import { useSidebar } from '@/context/SidebarContext';
import { FilterPanel } from '@/components/leads/FilterPanel';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { LeadCardSkeleton } from '@/components/leads/LeadCardSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Lead, LeadStatus } from '@/data/mockLeads';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef, useState } from 'react';

export default function InboxPage() {
  const {
    filteredLeads,
    selectedLead,
    setSelectedLead,
    filters,
    setFilters,
    stats,
    isLoading,
    error,
    loadMoreLeads,
    isLoadingMore,
    hasNextPage,
    markLeadRead,
  } = useLeads();
  const { closeSidebar } = useSidebar();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const selectedDetailRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedLeadIdRef = useRef<string | null>(null);
  const prevScrolledLeadIdRef = useRef<string | null>(null);

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status as LeadStatus | 'all' });
    setSelectedLead(null);
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, searchQuery: query });
  };

  const handleLeadSelect = (lead: Lead) => {
    if (lead.status === 'unread') {
      void markLeadRead(lead.id);
    }
    setSelectedLead(lead);
  };

  // Track window width for responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when lead is selected on screens < 1300px (only on lead change)
  useEffect(() => {
    const currentLeadId = selectedLead?.id ?? null;
    const hasLeadChanged = currentLeadId !== prevSelectedLeadIdRef.current;

    if (selectedLead && windowWidth < 1300 && hasLeadChanged) {
      closeSidebar();
    }

    prevSelectedLeadIdRef.current = currentLeadId;
  }, [selectedLead, windowWidth, closeSidebar]);

  useEffect(() => {
    if (!selectedLead || windowWidth >= 768) {
      return;
    }

    if (prevScrolledLeadIdRef.current === selectedLead.id) {
      return;
    }

    const viewport =
      scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') ?? null;
    const detailElement = selectedDetailRef.current;

    if (!detailElement) {
      return;
    }

    requestAnimationFrame(() => {
      if (viewport instanceof HTMLElement) {
        const viewportRect = viewport.getBoundingClientRect();
        const detailRect = detailElement.getBoundingClientRect();
        const offset = detailRect.top - viewportRect.top + viewport.scrollTop;
        viewport.scrollTo({ top: offset, behavior: 'smooth' });
      } else {
        detailElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    prevScrolledLeadIdRef.current = selectedLead.id;
  }, [selectedLead, windowWidth]);

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
    <div className="mx-auto px-4">
      <div className="h-[calc(100vh-120px)] flex flex-col -mx-4 md:-mx-8 -my-6 md:-my-8">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                Monitor and respond to relevant conversations
              </p>
            </div>
            <div className="relative hidden w-full sm:w-64 md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full md:hidden">
              <div className="flex w-full items-center overflow-hidden rounded-md border border-input bg-background">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border-0 bg-transparent pl-9 pr-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="h-10 w-px bg-border" />
                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-10 w-36 border-0 bg-transparent px-3 text-sm focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All ({stats.total})</SelectItem>
                    <SelectItem value="unread">Unread ({stats.unread})</SelectItem>
                    <SelectItem value="completed">Completed ({stats.completed})</SelectItem>
                    <SelectItem value="discarded">Discarded ({stats.discarded})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
  
          {/* Status Tabs */}
          <Tabs
            value={filters.status}
            onValueChange={handleStatusChange}
            className="mt-4 hidden md:block"
          >
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary" className="text-xs">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                <Badge variant="secondary" className="text-xs">
                  {stats.unread}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                Completed
                <Badge variant="secondary" className="text-xs">
                  {stats.completed}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="discarded" className="gap-2">
                Discarded
                <Badge variant="secondary" className="text-xs">
                  {stats.discarded}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
  
        {/* Three Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Filters (hidden on mobile) */}
          <aside className="hidden lg:block w-64 border-r border-border bg-card/50 rounded-bl-lg">
            <FilterPanel />
          </aside>
  
          {/* Center Panel - Lead List */}
          <div className="flex-1 min-w-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-3 space-y-2">
                {error ? (
                  <div className="text-center py-12 text-destructive">
                    <p>Unable to load leads.</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : isLoading ? (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <LeadCardSkeleton key={`lead-skeleton-${index}`} />
                    ))}
                  </>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No leads found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  <>
                    {filteredLeads.map((lead) => (
                      <div key={lead.id}>
                        <LeadCard
                          lead={lead}
                          isSelected={selectedLead?.id === lead.id}
                          onClick={() => handleLeadSelect(lead)}
                        />
                        {/* Show lead details below selected lead on mobile */}
                        {selectedLead?.id === lead.id && (
                          <div className="md:hidden mt-2" ref={selectedDetailRef}>
                            <LeadDetail />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={sentinelRef} className="h-4" />
                    {isLoadingMore ? (
                      <>
                        {Array.from({ length: 2 }).map((_, index) => (
                          <LeadCardSkeleton key={`lead-skeleton-more-${index}`} />
                        ))}
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
  
          {/* Right Panel - Lead Detail */}
          {selectedLead && (
            <aside className="hidden md:block w-[400px] lg:w-[450px] bg-card/50 border-l border-border">
              <LeadDetail />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
