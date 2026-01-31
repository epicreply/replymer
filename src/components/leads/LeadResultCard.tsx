import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { PlatformBadge } from '@/components/leads/PlatformBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Lead } from '@/data/mockLeads';

interface LeadResultCardProps {
  lead: Lead;
  variant?: 'completed' | 'discarded';
  showRestore?: boolean;
  onRestore?: (leadId: string) => void;
}

export function LeadResultCard({
  lead,
  variant = 'discarded',
  showRestore = false,
  onRestore,
}: LeadResultCardProps) {
  const timeLabel =
    variant === 'completed'
      ? `Replied ${formatDistanceToNow(lead.repliedAt || lead.createdAt, { addSuffix: true })}`
      : formatDistanceToNow(lead.createdAt, { addSuffix: true });

  return (
    <Card
      className={cn(
        'hover:shadow-sm transition-shadow',
        variant === 'discarded' && 'opacity-75'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <PlatformBadge platform={lead.platform} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{lead.community}</span>
              <span>•</span>
              <span>{lead.authorHandle}</span>
              <span>•</span>
              <span>{timeLabel}</span>
            </div>
            <h4 className="font-medium text-foreground mb-2 line-clamp-1">
              {lead.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{lead.content}</p>
            {variant === 'completed' && lead.reply && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Your reply:</p>
                <p className="text-sm text-foreground">{lead.reply}</p>
              </div>
            )}
          </div>
          {showRestore ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore?.(lead.id)}
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
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href={lead.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
