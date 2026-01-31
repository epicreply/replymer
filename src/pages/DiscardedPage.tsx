import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Filter, RotateCcw, Trash2 } from 'lucide-react';
import { useLeads } from '@/context/LeadsContext';
import { PlatformBadge } from '@/components/leads/PlatformBadge';
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
import { useState } from 'react';
import { Platform } from '@/data/mockLeads';

export default function DiscardedPage() {
  const { leads, restoreLead } = useLeads();
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  const discardedLeads = leads.filter((lead) => {
    if (lead.status !== 'discarded') return false;
    if (platformFilter !== 'all' && lead.platform !== platformFilter) return false;
    return true;
  });

  const handleRestore = (leadId: string) => {
    restoreLead(leadId);
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
              Leads marked as not relevant ({discardedLeads.length})
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
  
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {discardedLeads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No discarded leads</p>
                  <p className="text-sm">Leads you mark as not relevant will appear here</p>
                </CardContent>
              </Card>
            ) : (
              discardedLeads.map((lead) => (
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
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
