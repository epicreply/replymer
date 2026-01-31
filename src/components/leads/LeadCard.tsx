import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlatformBadge } from './PlatformBadge';
import { RelevancyBadge } from './RelevancyBadge';
import type { Lead } from '@/data/mockLeads';

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LeadCard({ lead, isSelected, onClick }: LeadCardProps) {
  const isUnread = lead.status === 'unread';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all duration-200 relative',
        'hover:bg-accent/50 hover:border-accent',
        isSelected
          ? 'bg-accent border-primary/30 shadow-sm'
          : 'bg-card border-border',
        isUnread && !isSelected && 'border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2">
          <RelevancyBadge score={lead.relevancyScore} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">{lead.community}</span>
          </div>

          <h4
            className={cn(
              'text-sm line-clamp-2 mb-1',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
            )}
          >
            {lead.title}
          </h4>

          <p className="text-xs text-muted-foreground line-clamp-2">{lead.content}</p>

          {lead.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lead.keywords.slice(0, 2).map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
              {lead.keywords.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{lead.keywords.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {isUnread && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
        )}
      </div>

      <div className="absolute top-4 right-4">
        <PlatformBadge platform={lead.platform} />
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
      </div>
    </button>
  );
}
