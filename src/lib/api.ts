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
  next_cursor?: string | null;
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
  const leads = data.leads ?? data.data ?? [];

  return {
    leads: leads.map(mapApiLead),
    nextCursor: data.next_cursor ?? null,
  };
};
