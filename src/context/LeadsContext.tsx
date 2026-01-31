import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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
import { fetchProjectLeads } from '@/lib/api';
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
  restoreLead: (leadId: string) => void;

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
  stats: {
    unread: number;
    completed: number;
    discarded: number;
    total: number;
  };
}

const defaultFilters: LeadsFilters = {
  relevancyRange: [0, 100],
  platforms: ['reddit', 'twitter', 'linkedin'],
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

  // Restore lead from discarded
  const restoreLead = useCallback((leadId: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: 'unread' as LeadStatus } : lead
      )
    );
  }, []);

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
      signal,
    }: {
      cursor?: string | null;
      append?: boolean;
      signal?: AbortSignal;
    } = {}) => {
      if (!accessToken || !selectedProjectId) {
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

      try {
        const selectedCommunityIds = filters.communities
          .map((communityName) => communities.find((community) => community.name === communityName)?.id)
          .filter((communityId): communityId is string => Boolean(communityId));
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
          signal,
        });

        setLeads((prev) => (append ? [...prev, ...response.leads] : response.leads));
        setNextCursor(response.nextCursor);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leads');
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [accessToken, selectedProjectId, filters, communities, isLoading, isLoadingMore]
  );

  const loadMoreLeads = useCallback(() => {
    if (!nextCursor || isLoading || isLoadingMore) {
      return;
    }
    void loadLeads({ cursor: nextCursor, append: true });
  }, [nextCursor, loadLeads, isLoading, isLoadingMore]);

  const hasNextPage = Boolean(nextCursor);

  useEffect(() => {
    const controller = new AbortController();
    void loadLeads({ cursor: null, append: false, signal: controller.signal });
    return () => controller.abort();
  }, [loadLeads]);

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
    return {
      unread: leads.filter((l) => l.status === 'unread').length,
      completed: leads.filter((l) => l.status === 'completed').length,
      discarded: leads.filter((l) => l.status === 'discarded').length,
      total: leads.length,
    };
  }, [leads]);

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
