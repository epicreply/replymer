import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TimeRange } from './StatisticCard';

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  children: ReactNode;
}

export function ChartDialog({
  open,
  onOpenChange,
  title,
  timeRange,
  onTimeRangeChange,
  children,
}: ChartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>{title}</DialogTitle>
          <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </DialogHeader>
        <div className="flex-1 min-h-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
