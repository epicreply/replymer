import { cn } from '@/lib/utils';

interface RelevancyBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getRelevancyColor(score: number) {
  if (score >= 90) return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
  if (score >= 75) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
  if (score >= 50) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
  return 'bg-muted text-muted-foreground border-border';
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function RelevancyBadge({ score, size = 'md', className }: RelevancyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        getRelevancyColor(score),
        sizeClasses[size],
        className
      )}
    >
      {score}%
    </span>
  );
}
