import { Lead, LeadStatus, Platform } from '@/data/mockLeads';

const API_BASE_URL = 'https://internal-api.autoreply.ing';

export interface LeadsQueryParams {
  status?: LeadStatus;
  platforms?: Platform[];
  communityIds?: string[];
  minRelevancy?: number;
  maxRelevancy?: number;
  search?: string;
  cursor?: string | null;
  limit?: number;
}

export interface AnalyticsQueryParams {
  accessToken: string;
  projectId: string;
  startDate: string;
  endDate: string;
  platform?: string;
  granularity?: string;
  limit?: number;
  signal?: AbortSignal;
}

interface LeadsApiLead {
  id: string;
  platform: Platform;
  community?: string;
  community_name?: string;
  author_name: string;
  author_handle: string;
  title: string;
  content: string;
  url: string;
  relevancy_score: number;
  status: LeadStatus;
  post_created_at: string;
  keywords: string[];
  suggested_dm?: string;
  suggested_comment?: string;
}

interface LeadsApiResponse {
  leads?: LeadsApiLead[];
  data?: LeadsApiLead[];
  items?: LeadsApiLead[];
  next_cursor?: string | null;
  total?: number;
}

const mapApiLead = (lead: LeadsApiLead): Lead => {
  return {
    id: lead.id,
    platform: lead.platform,
    community: lead.community ?? lead.community_name ?? 'Unknown',
    author: lead.author_name,
    authorHandle: lead.author_handle,
    title: lead.title,
    content: lead.content,
    url: lead.url,
    relevancyScore: lead.relevancy_score,
    status: lead.status,
    createdAt: new Date(lead.post_created_at),
    keywords: lead.keywords ?? [],
    suggestedComment: lead.suggested_comment ?? '',
    suggestedDM: lead.suggested_dm ?? '',
  };
};

const appendQueryParam = (params: URLSearchParams, key: string, value?: string) => {
  if (value) {
    params.set(key, value);
  }
};

const buildLeadsQueryParams = (filters: LeadsQueryParams) => {
  const params = new URLSearchParams();

  appendQueryParam(params, 'status', filters.status);
  appendQueryParam(params, 'platform', filters.platforms?.length ? filters.platforms.join(',') : undefined);
  appendQueryParam(
    params,
    'community_id',
    filters.communityIds?.length ? filters.communityIds.join(',') : undefined
  );
  appendQueryParam(
    params,
    'min_relevancy',
    filters.minRelevancy !== undefined ? String(filters.minRelevancy) : undefined
  );
  appendQueryParam(
    params,
    'max_relevancy',
    filters.maxRelevancy !== undefined ? String(filters.maxRelevancy) : undefined
  );
  appendQueryParam(params, 'search', filters.search);
  appendQueryParam(params, 'cursor', filters.cursor ?? undefined);
  appendQueryParam(params, 'limit', filters.limit ? String(filters.limit) : undefined);

  return params;
};

const buildAnalyticsQueryParams = ({
  startDate,
  endDate,
  platform,
  granularity,
  limit,
}: {
  startDate: string;
  endDate: string;
  platform?: string;
  granularity?: string;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  params.set('start_date', startDate);
  params.set('end_date', endDate);
  appendQueryParam(params, 'platform', platform);
  appendQueryParam(params, 'granularity', granularity);
  appendQueryParam(params, 'limit', limit ? String(limit) : undefined);
  return params;
};

const normalizeAnalyticsList = <T>(
  payload: T[] | { data?: T[]; items?: T[]; results?: T[] }
) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.data ?? payload.items ?? payload.results ?? [];
};

export const fetchProjectLeads = async ({
  accessToken,
  projectId,
  filters,
  signal,
}: {
  accessToken: string;
  projectId: string;
  filters: LeadsQueryParams;
  signal?: AbortSignal;
}) => {
  const url = new URL('/v1.0/projects/leads', API_BASE_URL);
  url.search = buildLeadsQueryParams(filters).toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }

  const data = (await response.json()) as LeadsApiResponse;
  const leads = data.leads ?? data.data ?? data.items ?? [];

  return {
    leads: leads.map(mapApiLead),
    nextCursor: data.next_cursor ?? null,
    total: data.total ?? leads.length,
  };
};

interface UpdateLeadStatusResponse {
  id: string;
  status: LeadStatus;
  user_reply: string | null;
  replied_at: string;
  comment_sent: boolean;
  dm_sent: boolean;
}

export const updateLeadStatus = async ({
  accessToken,
  projectId,
  leadId,
  status,
}: {
  accessToken: string;
  projectId: string;
  leadId: string;
  status: 'completed' | 'discarded';
}) => {
  const url = new URL(`/v1.0/projects/leads/${leadId}/status`, API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update lead status');
  }

  const data = (await response.json()) as UpdateLeadStatusResponse;
  return data;
};

interface DeleteDiscardedLeadsResponse {
  message: string;
  deleted_count: number;
}

export const deleteDiscardedLeads = async ({
  accessToken,
  projectId,
}: {
  accessToken: string;
  projectId: string;
}): Promise<DeleteDiscardedLeadsResponse> => {
  const url = new URL('/v1.0/projects/leads/discarded', API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete discarded leads');
  }

  const data = (await response.json()) as DeleteDiscardedLeadsResponse;
  return data;
};

interface AnalyticsSummaryResponse {
  total_leads: number;
  replies_sent: number;
  dms_sent: number;
  reply_rate: number;
}

interface AnalyticsLeadsOverTimeItem {
  date: string;
  leads: number;
  replies: number;
  dms: number;
}

interface AnalyticsPlatformPerformanceItem {
  platform: string;
  leads: number;
  replies: number;
  reply_rate?: number;
  dms?: number;
  avg_relevancy?: number;
}

interface AnalyticsTopCommunityItem {
  name: string;
  community_name?: string;
  leads: number;
  replies: number;
  reply_rate?: number;
}

export const fetchAnalyticsSummary = async ({
  accessToken,
  projectId,
  startDate,
  endDate,
  platform,
  granularity,
  limit,
  signal,
}: AnalyticsQueryParams): Promise<AnalyticsSummaryResponse> => {
  const url = new URL('/v1.0/analytics/summary', API_BASE_URL);
  url.search = buildAnalyticsQueryParams({
    startDate,
    endDate,
    platform,
    granularity,
    limit,
  }).toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics summary');
  }

  return (await response.json()) as AnalyticsSummaryResponse;
};

export const fetchAnalyticsLeadsOverTime = async ({
  accessToken,
  projectId,
  startDate,
  endDate,
  platform,
  granularity,
  limit,
  signal,
}: AnalyticsQueryParams): Promise<AnalyticsLeadsOverTimeItem[]> => {
  const url = new URL('/v1.0/analytics/leads-over-time', API_BASE_URL);
  url.search = buildAnalyticsQueryParams({
    startDate,
    endDate,
    platform,
    granularity,
    limit,
  }).toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leads over time');
  }

  const data = (await response.json()) as AnalyticsLeadsOverTimeItem[] | {
    data?: AnalyticsLeadsOverTimeItem[];
    items?: AnalyticsLeadsOverTimeItem[];
    results?: AnalyticsLeadsOverTimeItem[];
  };

  return normalizeAnalyticsList<AnalyticsLeadsOverTimeItem>(data);
};

export const fetchAnalyticsPlatformPerformance = async ({
  accessToken,
  projectId,
  startDate,
  endDate,
  platform,
  granularity,
  limit,
  signal,
}: AnalyticsQueryParams): Promise<AnalyticsPlatformPerformanceItem[]> => {
  const url = new URL('/v1.0/analytics/platform-performance', API_BASE_URL);
  url.search = buildAnalyticsQueryParams({
    startDate,
    endDate,
    platform,
    granularity,
    limit,
  }).toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch platform performance');
  }

  const data = (await response.json()) as AnalyticsPlatformPerformanceItem[] | {
    data?: AnalyticsPlatformPerformanceItem[];
    items?: AnalyticsPlatformPerformanceItem[];
    results?: AnalyticsPlatformPerformanceItem[];
  };

  return normalizeAnalyticsList<AnalyticsPlatformPerformanceItem>(data);
};

export const fetchAnalyticsTopCommunities = async ({
  accessToken,
  projectId,
  startDate,
  endDate,
  platform,
  granularity,
  limit,
  signal,
}: AnalyticsQueryParams): Promise<AnalyticsTopCommunityItem[]> => {
  const url = new URL('/v1.0/analytics/top-communities', API_BASE_URL);
  url.search = buildAnalyticsQueryParams({
    startDate,
    endDate,
    platform,
    granularity,
    limit,
  }).toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Project-ID': projectId,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch top communities');
  }

  const data = (await response.json()) as AnalyticsTopCommunityItem[] | {
    data?: AnalyticsTopCommunityItem[];
    items?: AnalyticsTopCommunityItem[];
    results?: AnalyticsTopCommunityItem[];
  };

  return normalizeAnalyticsList<AnalyticsTopCommunityItem>(data);
};
