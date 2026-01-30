import { useLeads } from '@/context/LeadsContext';
import { FilterPanel } from '@/components/leads/FilterPanel';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { LeadStatus } from '@/data/mockLeads';
import { Badge } from '@/components/ui/badge';

export default function InboxPage() {
  const { filteredLeads, selectedLead, setSelectedLead, filters, setFilters, stats } = useLeads();

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status as LeadStatus | 'all' });
    setSelectedLead(null);
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, searchQuery: query });
  };

  return (
    <div className="mx-auto px-4">
      <div className="h-[calc(100vh-120px)] flex flex-col -mx-4 md:-mx-8 -my-6 md:-my-8">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                Monitor and respond to relevant conversations
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
  
          {/* Status Tabs */}
          <Tabs
            value={filters.status}
            onValueChange={handleStatusChange}
            className="mt-4"
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
          <aside className="hidden lg:block w-64 border-r border-border bg-card/50">
            <FilterPanel />
          </aside>
  
          {/* Center Panel - Lead List */}
          <div className="flex-1 min-w-0 border-r border-border">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No leads found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onClick={() => setSelectedLead(lead)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
  
          {/* Right Panel - Lead Detail */}
          <aside className="hidden md:block w-[400px] lg:w-[450px] bg-card/50">
            <LeadDetail />
          </aside>
        </div>
      </div>
    </div>
  );
}
