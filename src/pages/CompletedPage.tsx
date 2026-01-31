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

export default function CompletedPage() {
  const { leads } = useLeads();
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  const completedLeads = leads.filter((lead) => {
    if (lead.status !== 'completed') return false;
    if (platformFilter !== 'all' && lead.platform !== platformFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Completed</h1>
            <p className="text-sm text-muted-foreground">
              Successfully replied conversations ({completedLeads.length})
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
  
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {completedLeads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No completed leads yet</p>
                  <p className="text-sm">Leads you reply to will appear here</p>
                </CardContent>
              </Card>
            ) : (
              completedLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-sm transition-shadow">
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
                            Replied {formatDistanceToNow(lead.repliedAt || lead.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground mb-2 line-clamp-1">
                          {lead.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {lead.content}
                        </p>
                        {lead.reply && (
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Your reply:</p>
                            <p className="text-sm text-foreground">{lead.reply}</p>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={lead.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
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
