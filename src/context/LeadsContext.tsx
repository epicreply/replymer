import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  Lead,
  LeadStatus,
  Platform,
  ProductSettings,
  PromptSettings,
  mockLeads,
  mockCommunities,
  defaultProductSettings,
  defaultPromptSettings,
  usageQuota as initialQuota,
  mockBrands,
  Community,
} from '@/data/mockLeads';

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
  // Leads state
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
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
