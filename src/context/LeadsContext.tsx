import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  Lead,
  LeadStatus,
  Platform,
  ProductSettings,
  PromptSettings,
  mockCommunities,
  defaultProductSettings,
  defaultPromptSettings,
  usageQuota as initialQuota,
  mockBrands,
  Community,
} from '@/data/mockLeads';
import {
  fetchInboxCounts,
  fetchProjectLeads,
  InboxCounts,
  markLeadRead,
  restoreLead as restoreLeadApi,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface LeadsFilters {
  relevancyRange: [number, number];
  platforms: Platform[];
  communities: string[];
  status: LeadStatus | 'all';
  searchQuery: string;
}

interface LeadsContextType {
  // Leads
  leads: Lead[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMoreLeads: () => void;
  hasNextPage: boolean;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  restoreLead: (leadId: string) => Promise<void>;
  markLeadRead: (leadId: string) => Promise<void>;

  // Filters
  filters: LeadsFilters;
  setFilters: (filters: LeadsFilters) => void;
  filteredLeads: Lead[];

  // Communities
  communities: Community[];
  addCommunity: (community: Omit<Community, 'id' | 'leadCount'>) => void;
  removeCommunity: (communityId: string) => void;

  // Settings
  productSettings: ProductSettings;
  setProductSettings: (settings: ProductSettings) => void;
  promptSettings: PromptSettings;
  setPromptSettings: (settings: PromptSettings) => void;

  // Usage
  usageQuota: { used: number; limit: number; plan: string };
  incrementUsage: () => void;

  // Brands
  brands: typeof mockBrands;
  activeBrand: typeof mockBrands[0];
  setActiveBrand: (brandId: string) => void;

  // Stats
  inboxCounts: InboxCounts | null;
  isInboxCountsLoading: boolean;
  inboxCountsError: string | null;
  refreshInboxCounts: () => Promise<void>;
  stats: {
    unread: number;
    completed: number;
    discarded: number;
    total: number;
  };
}

const defaultFilters: LeadsFilters = {
  relevancyRange: [0, 100],
  platforms: ['reddit'],
  communities: [],
  status: 'all',
  searchQuery: '',
};

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const inFlightRequestKeyRef = useRef<string | null>(null);
  const isRequestInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingRequestRef = useRef<{
    cursor?: string | null;
    append?: boolean;
    requestKey: string;
  } | null>(null);

  const [inboxCounts, setInboxCounts] = useState<InboxCounts | null>(null);
  const [isInboxCountsLoading, setIsInboxCountsLoading] = useState(false);
  const [inboxCountsError, setInboxCountsError] = useState<string | null>(null);
  const isCountsRequestInFlightRef = useRef(false);
  const inFlightCountsKeyRef = useRef<string | null>(null);
  const pendingCountsRefreshRef = useRef(false);
  const countsAbortControllerRef = useRef<AbortController | null>(null);

  // Filters state
  const [filters, setFilters] = useState<LeadsFilters>(defaultFilters);

  // Communities state
  const [communities, setCommunities] = useState<Community[]>(mockCommunities);

  // Settings state
  const [productSettings, setProductSettings] = useState<ProductSettings>(defaultProductSettings);
  const [promptSettings, setPromptSettings] = useState<PromptSettings>(defaultPromptSettings);

  // Usage state
  const [usageQuota, setUsageQuota] = useState(initialQuota);

  // Brands state
  const [brands, setBrands] = useState(mockBrands);

  const activeBrand = useMemo(() => brands.find((b) => b.isActive) || brands[0], [brands]);

  const selectedProjectId = useMemo(
    () => user?.projects?.find((project) => project.is_selected)?.id ?? user?.default_project_id ?? null,
    [user]
  );

  const setActiveBrand = useCallback((brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => ({ ...b, isActive: b.id === brandId }))
    );
  }, []);

  // Update lead status
  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
            ...lead,
            status,
            ...(status === 'completed' ? { repliedAt: new Date() } : {}),
          }
          : lead
      )
    );
    // Clear selection if the updated lead was selected
    setSelectedLead((prev) => (prev?.id === leadId ? null : prev));
  }, []);

  const refreshInboxCounts = useCallback(
    async function refreshInboxCountsInner() {
      if (!accessToken || !selectedProjectId) {
        setInboxCounts(null);
        setInboxCountsError(null);
        setIsInboxCountsLoading(false);
        inFlightCountsKeyRef.current = null;
        isCountsRequestInFlightRef.current = false;
        pendingCountsRefreshRef.current = false;
        return;
      }

      const requestKey = JSON.stringify({
        projectId: selectedProjectId,
        hasToken: Boolean(accessToken),
      });

      if (isCountsRequestInFlightRef.current) {
        pendingCountsRefreshRef.current = true;
        return;
      }

      const controller = new AbortController();
      countsAbortControllerRef.current = controller;
      isCountsRequestInFlightRef.current = true;
      inFlightCountsKeyRef.current = requestKey;
      setIsInboxCountsLoading(true);
      setInboxCountsError(null);

      try {
        const nextCounts = await fetchInboxCounts({
          accessToken,
          projectId: selectedProjectId,
          signal: controller.signal,
        });

        if (inFlightCountsKeyRef.current === requestKey) {
          setInboxCounts(nextCounts);
        }
      } catch (countsError) {
        if (countsError instanceof DOMException && countsError.name === 'AbortError') {
          return;
        }
        if (inFlightCountsKeyRef.current === requestKey) {
          setInboxCountsError(
            countsError instanceof Error ? countsError.message : 'Failed to load inbox counts'
          );
        }
      } finally {
        if (inFlightCountsKeyRef.current === requestKey) {
          inFlightCountsKeyRef.current = null;
          isCountsRequestInFlightRef.current = false;
          setIsInboxCountsLoading(false);
        }

        if (pendingCountsRefreshRef.current) {
          pendingCountsRefreshRef.current = false;
          await refreshInboxCountsInner();
        }
      }
    },
    [accessToken, selectedProjectId]
  );

  // Restore lead from discarded
  const restoreLead = useCallback(
    async (leadId: string) => {
      if (!accessToken || !selectedProjectId) {
        return;
      }

      // Optimistic update
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: 'unread' as LeadStatus } : lead
        )
      );

      try {
        await restoreLeadApi({ accessToken, projectId: selectedProjectId, leadId });
        void refreshInboxCounts();
      } catch (error) {
        console.error('Failed to restore lead:', error);
      }
    },
    [accessToken, selectedProjectId, refreshInboxCounts]
  );

  const markLeadReadHandler = useCallback(
    async (leadId: string) => {
      if (!accessToken || !selectedProjectId) {
        return;
      }

      try {
        await markLeadRead({ accessToken, projectId: selectedProjectId, leadId });
        void refreshInboxCounts();
      } catch (markReadError) {
        console.error(
          markReadError instanceof Error ? markReadError.message : 'Failed to mark lead as read'
        );
      }
    },
    [accessToken, selectedProjectId, refreshInboxCounts]
  );

  // Add community
  const addCommunity = useCallback(
    (community: Omit<Community, 'id' | 'leadCount'>) => {
      const newCommunity: Community = {
        ...community,
        id: Date.now().toString(),
        leadCount: 0,
      };
      setCommunities((prev) => [...prev, newCommunity]);
    },
    []
  );

  // Remove community
  const removeCommunity = useCallback((communityId: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
  }, []);

  // Increment usage
  const incrementUsage = useCallback(() => {
    setUsageQuota((prev) => ({ ...prev, used: prev.used + 1 }));
  }, []);

  const loadLeads = useCallback(
    async ({
      cursor,
      append,
    }: {
      cursor?: string | null;
      append?: boolean;
    } = {}) => {
      if (!accessToken || !selectedProjectId) {
        abortControllerRef.current?.abort();
        inFlightRequestKeyRef.current = null;
        isRequestInFlightRef.current = false;
        pendingRequestRef.current = null;
        setError('Missing authentication or project selection.');
        setIsLoading(false);
        setIsLoadingMore(false);
        setLeads([]);
        setNextCursor(null);
        return;
      }

      if (!append) {
        setIsLoading(true);
        setError(null);
        setNextCursor(null);
        setLeads([]);
        setSelectedLead(null);
        setIsLoadingMore(false);
      } else {
        if (!cursor || isLoading || isLoadingMore) {
          return;
        }
        setIsLoadingMore(true);
      }

      const selectedCommunityIds = filters.communities
        .map((communityName) => communities.find((community) => community.name === communityName)?.id)
        .filter((communityId): communityId is string => Boolean(communityId));
      const requestKey = JSON.stringify({
        projectId: selectedProjectId,
        cursor: cursor ?? null,
        append: Boolean(append),
        filters: {
          status: filters.status === 'all' ? undefined : filters.status,
          platforms: filters.platforms.length ? filters.platforms : undefined,
          communityIds: selectedCommunityIds.length ? selectedCommunityIds : undefined,
          minRelevancy: filters.relevancyRange[0],
          maxRelevancy: filters.relevancyRange[1],
          search: filters.searchQuery || undefined,
        },
      });

      if (isRequestInFlightRef.current) {
        if (inFlightRequestKeyRef.current === requestKey) {
          return;
        }
        pendingRequestRef.current = { cursor, append, requestKey };
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isRequestInFlightRef.current = true;
      inFlightRequestKeyRef.current = requestKey;

      try {
        const response = await fetchProjectLeads({
          accessToken,
          projectId: selectedProjectId,
          filters: {
            status: filters.status === 'all' ? undefined : filters.status,
            platforms: filters.platforms.length ? filters.platforms : undefined,
            communityIds: selectedCommunityIds.length ? selectedCommunityIds : undefined,
            minRelevancy: filters.relevancyRange[0],
            maxRelevancy: filters.relevancyRange[1],
            search: filters.searchQuery || undefined,
            cursor,
            limit: 25,
          },
          signal: controller.signal,
        });

        setLeads((prev) => (append ? [...prev, ...response.leads] : response.leads));
        setNextCursor(response.nextCursor);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leads');
      } finally {
        if (inFlightRequestKeyRef.current === requestKey) {
          inFlightRequestKeyRef.current = null;
          isRequestInFlightRef.current = false;
        }
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
        const pendingRequest = pendingRequestRef.current;
        if (pendingRequest && pendingRequest.requestKey !== requestKey) {
          pendingRequestRef.current = null;
          void loadLeads({ cursor: pendingRequest.cursor, append: pendingRequest.append });
        }
      }
    },
    [accessToken, selectedProjectId, filters, communities]
  );

  const loadMoreLeads = useCallback(() => {
    if (!nextCursor || isLoading || isLoadingMore) {
      return;
    }
    void loadLeads({ cursor: nextCursor, append: true });
  }, [nextCursor, loadLeads, isLoading, isLoadingMore]);

  const hasNextPage = Boolean(nextCursor);

  useEffect(() => {
    void loadLeads({ cursor: null, append: false });
    return () => abortControllerRef.current?.abort();
  }, [loadLeads]);

  useEffect(() => {
    void refreshInboxCounts();
    return () => countsAbortControllerRef.current?.abort();
  }, [refreshInboxCounts]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Status filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Relevancy filter
      if (
        lead.relevancyScore < filters.relevancyRange[0] ||
        lead.relevancyScore > filters.relevancyRange[1]
      ) {
        return false;
      }

      // Platform filter
      if (!filters.platforms.includes(lead.platform)) {
        return false;
      }

      // Community filter
      if (
        filters.communities.length > 0 &&
        !filters.communities.includes(lead.community)
      ) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          lead.title.toLowerCase().includes(query) ||
          lead.content.toLowerCase().includes(query) ||
          lead.author.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [leads, filters]);

  // Stats
  const stats = useMemo(() => {
    if (inboxCounts) {
      return inboxCounts;
    }
    return {
      unread: leads.filter((l) => l.status === 'unread').length,
      completed: leads.filter((l) => l.status === 'completed').length,
      discarded: leads.filter((l) => l.status === 'discarded').length,
      total: leads.length,
    };
  }, [leads, inboxCounts]);

  const value: LeadsContextType = {
    leads,
    isLoading,
    isLoadingMore,
    error,
    loadMoreLeads,
    hasNextPage,
    selectedLead,
    setSelectedLead,
    updateLeadStatus,
    restoreLead,
    markLeadRead: markLeadReadHandler,
    filters,
    setFilters,
    filteredLeads,
    communities,
    addCommunity,
    removeCommunity,
    productSettings,
    setProductSettings,
    promptSettings,
    setPromptSettings,
    usageQuota,
    incrementUsage,
    brands,
    activeBrand,
    setActiveBrand,
    inboxCounts,
    isInboxCountsLoading,
    inboxCountsError,
    refreshInboxCounts,
    stats,
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
