import { Download, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { StatisticCard, TimeRange } from '@/components/analytics/StatisticCard';
import {
  fetchAnalyticsLeadsOverTime,
  fetchAnalyticsPlatformPerformance,
  fetchAnalyticsSummary,
  fetchAnalyticsTopCommunities,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const ClickableLegend = ({ 
  payload, 
  hiddenKeys, 
  onToggle 
}: { 
  payload?: Array<{ value: string; color: string; dataKey: string }>;
  hiddenKeys: Set<string>;
  onToggle: (key: string) => void;
}) => {
  if (!payload) return null;
  
  return (
    <div className="flex justify-center gap-4 pt-2">
      {payload.map((entry) => (
        <button
          key={entry.value}
          onClick={() => onToggle(entry.dataKey)}
          className={`flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80 ${
            hiddenKeys.has(entry.dataKey) ? 'opacity-40 line-through' : ''
          }`}
        >
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </button>
      ))}
    </div>
  );
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

const formatTooltipValue = (value: number | string | undefined | null) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value;
  return value;
};

const formatDate = (value: string, timeRange: TimeRange) => {
  if (timeRange === 'year') {
    const [year, month] = value.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
  }
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AnalyticsPage() {
  const { accessToken, user } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [platform, setPlatform] = useState('all');
  const [hiddenLeadsKeys, setHiddenLeadsKeys] = useState<Set<string>>(new Set());
  const [hiddenPlatformKeys, setHiddenPlatformKeys] = useState<Set<string>>(new Set());
  const [hiddenCommunitiesKeys, setHiddenCommunitiesKeys] = useState<Set<string>>(new Set());
  const [leadsTimeRange, setLeadsTimeRange] = useState<TimeRange>('week');
  const [platformTimeRange, setPlatformTimeRange] = useState<TimeRange>('week');
  const [communitiesTimeRange, setCommunitiesTimeRange] = useState<TimeRange>('week');
  const [summary, setSummary] = useState({
    total_leads: 0,
    replies_sent: 0,
    dms_sent: 0,
    reply_rate: 0,
  });
  const [leadsOverTime, setLeadsOverTime] = useState<
    Array<{ date: string; leads: number; replies: number; dms: number }>
  >([]);
  const [platformPerformance, setPlatformPerformance] = useState<
    Array<{
      platform: string;
      leads: number;
      replies: number;
      dms: number;
      reply_rate: number;
      avg_relevancy: number;
    }>
  >([]);
  const [topCommunities, setTopCommunities] = useState<
    Array<{ name: string; leads: number; replies: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleLeadsKey = useCallback((key: string) => {
    setHiddenLeadsKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const togglePlatformKey = useCallback((key: string) => {
    setHiddenPlatformKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleCommunitiesKey = useCallback((key: string) => {
    setHiddenCommunitiesKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleExport = () => {
    toast({
      title: 'Exporting data...',
      description: 'Your CSV file will be ready shortly.',
    });
  };

  const selectedProjectId =
    user?.projects?.find((project) => project.is_selected)?.id ??
    user?.default_project_id ??
    null;

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = dateRange === '90d' ? 90 : dateRange === '30d' ? 30 : 7;
    start.setDate(end.getDate() - days);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [dateRange]);

  useEffect(() => {
    if (!accessToken || !selectedProjectId) {
      setError('Missing authentication or project selection.');
      setIsLoading(false);
      setSummary({
        total_leads: 0,
        replies_sent: 0,
        dms_sent: 0,
        reply_rate: 0,
      });
      setLeadsOverTime([]);
      setPlatformPerformance([]);
      setTopCommunities([]);
      return;
    }

    const controller = new AbortController();
    const platformFilter = platform !== 'all' ? platform : undefined;
    const granularityMap: Record<TimeRange, string> = {
      week: 'day',
      month: 'week',
      year: 'month',
    };

    setIsLoading(true);
    setError(null);
    setSummary({
      total_leads: 0,
      replies_sent: 0,
      dms_sent: 0,
      reply_rate: 0,
    });
    setLeadsOverTime([]);
    setPlatformPerformance([]);
    setTopCommunities([]);

    const loadAnalytics = async () => {
      try {
        const [summaryResponse, leadsResponse, platformResponse, communitiesResponse] =
          await Promise.all([
            fetchAnalyticsSummary({
              accessToken,
              projectId: selectedProjectId,
              startDate,
              endDate,
              platform: platformFilter,
              signal: controller.signal,
            }),
            fetchAnalyticsLeadsOverTime({
              accessToken,
              projectId: selectedProjectId,
              startDate,
              endDate,
              platform: platformFilter,
              granularity: granularityMap[leadsTimeRange],
              signal: controller.signal,
            }),
            fetchAnalyticsPlatformPerformance({
              accessToken,
              projectId: selectedProjectId,
              startDate,
              endDate,
              platform: platformFilter,
              granularity: granularityMap[platformTimeRange],
              signal: controller.signal,
            }),
            fetchAnalyticsTopCommunities({
              accessToken,
              projectId: selectedProjectId,
              startDate,
              endDate,
              platform: platformFilter,
              granularity: granularityMap[communitiesTimeRange],
              limit: 5,
              signal: controller.signal,
            }),
          ]);

        setSummary(summaryResponse);
        setLeadsOverTime(
          leadsResponse.map((entry) => ({
            date: entry.date,
            leads: entry.leads ?? 0,
            replies: entry.replies ?? 0,
            dms: entry.dms ?? 0,
          }))
        );
        setPlatformPerformance(
          platformResponse.map((entry) => ({
            platform: entry.platform,
            leads: entry.leads ?? 0,
            replies: entry.replies ?? 0,
            dms: entry.dms ?? 0,
            reply_rate: entry.reply_rate ?? 0,
            avg_relevancy: entry.avg_relevancy ?? 0,
          }))
        );
        setTopCommunities(
          communitiesResponse.map((entry) => ({
            name: entry.community_name ?? entry.name ?? 'Unknown',
            leads: entry.leads ?? 0,
            replies: entry.replies ?? 0,
          }))
        );
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        const message =
          fetchError instanceof Error ? fetchError.message : 'Failed to load analytics';
        setError(message);
        setSummary({
          total_leads: 0,
          replies_sent: 0,
          dms_sent: 0,
          reply_rate: 0,
        });
        setLeadsOverTime([]);
        setPlatformPerformance([]);
        setTopCommunities([]);
        toast({
          title: 'Failed to load analytics',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadAnalytics();
    return () => controller.abort();
  }, [
    accessToken,
    selectedProjectId,
    startDate,
    endDate,
    platform,
    leadsTimeRange,
    platformTimeRange,
    communitiesTimeRange,
  ]);

  const renderLeadsChart = (timeRange: TimeRange, height: string = '100%') => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={leadsOverTime}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, timeRange)}
          className="text-xs"
        />
        <YAxis className="text-xs" />
        <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
        <Legend content={<ClickableLegend hiddenKeys={hiddenLeadsKeys} onToggle={toggleLeadsKey} />} />
        <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} hide={hiddenLeadsKeys.has('leads')} />
        <Line type="monotone" dataKey="replies" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} hide={hiddenLeadsKeys.has('replies')} />
        <Line type="monotone" dataKey="dms" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} hide={hiddenLeadsKeys.has('dms')} />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPlatformChart = (timeRange: TimeRange, height: string = '100%') => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={platformPerformance}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="platform" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
        <Legend content={<ClickableLegend hiddenKeys={hiddenPlatformKeys} onToggle={togglePlatformKey} />} />
        <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} hide={hiddenPlatformKeys.has('leads')} />
        <Bar dataKey="replies" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} hide={hiddenPlatformKeys.has('replies')} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderCommunitiesChart = (timeRange: TimeRange, height: string = '100%') => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={topCommunities} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" className="text-xs" />
        <YAxis dataKey="name" type="category" width={120} className="text-xs" />
        <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
        <Legend content={<ClickableLegend hiddenKeys={hiddenCommunitiesKeys} onToggle={toggleCommunitiesKey} />} />
        <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} hide={hiddenCommunitiesKeys.has('leads')} />
        <Bar dataKey="replies" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} hide={hiddenCommunitiesKeys.has('replies')} />
      </BarChart>
    </ResponsiveContainer>
  );

  const summaryPlaceholder = isLoading || Boolean(error);
  const formatCount = (value: number) =>
    summaryPlaceholder ? '—' : value.toLocaleString('en-US');
  const formatReplyRate = (value: number) =>
    summaryPlaceholder ? '—' : `${value}%`;

  const renderSummarySkeleton = () => (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-20" />
    </>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track your outreach performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platform} onValueChange={setPlatform}>
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                renderSummarySkeleton()
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCount(summary.total_leads)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                renderSummarySkeleton()
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Replies Sent</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCount(summary.replies_sent)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                renderSummarySkeleton()
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">DMs Sent</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCount(summary.dms_sent)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                renderSummarySkeleton()
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Reply Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatReplyRate(summary.reply_rate)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <StatisticCard
            title="Leads & Replies Over Time"
            children={(timeRange) => renderLeadsChart(timeRange)}
            dialogContent={(timeRange) => renderLeadsChart(timeRange)}
            onTimeRangeChange={setLeadsTimeRange}
            isLoading={isLoading}
          />

          <StatisticCard
            title="Performance by Platform"
            children={(timeRange) => renderPlatformChart(timeRange)}
            dialogContent={(timeRange) => renderPlatformChart(timeRange)}
            onTimeRangeChange={setPlatformTimeRange}
            isLoading={isLoading}
          />
        </div>

        {/* Top Communities */}
        <StatisticCard
          title="Top Performing Communities"
          children={(timeRange) => renderCommunitiesChart(timeRange)}
          dialogContent={(timeRange) => renderCommunitiesChart(timeRange)}
          onTimeRangeChange={setCommunitiesTimeRange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
