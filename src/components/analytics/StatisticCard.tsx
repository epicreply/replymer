import { useState, ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export function StatisticCard({
  title,
  children,
  dialogContent,
  defaultTimeRange = 'week',
}: StatisticCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <div className="h-64">{children(timeRange)}</div>
        </CardContent>
      </Card>

      <ChartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={title}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      >
        {dialogContent(timeRange)}
      </ChartDialog>
    </>
  );
}
