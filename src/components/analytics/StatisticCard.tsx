import { useState, ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartDialog } from './ChartDialog';

export type TimeRange = 'week' | 'month' | 'year';

interface StatisticCardProps {
  title: string;
  children: (timeRange: TimeRange) => ReactNode;
  dialogContent: (timeRange: TimeRange) => ReactNode;
  defaultTimeRange?: TimeRange;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  isLoading?: boolean;
  skeleton?: (timeRange: TimeRange) => ReactNode;
}

export function StatisticCard({
  title,
  children,
  dialogContent,
  defaultTimeRange = 'week',
  onTimeRangeChange,
  isLoading = false,
  skeleton,
}: StatisticCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const renderSkeleton = () =>
    skeleton ? (
      skeleton(timeRange)
    ) : (
      <div className="flex h-64 w-full flex-col gap-3">
        <Skeleton className="h-48 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );

  return (
    <>
      <Card className="group relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isLoading ? renderSkeleton() : children(timeRange)}
          </div>
        </CardContent>
      </Card>

      <ChartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      >
        {isLoading ? renderSkeleton() : dialogContent(timeRange)}
      </ChartDialog>
    </>
  );
}
