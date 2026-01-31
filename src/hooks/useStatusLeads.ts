import { useState, useCallback, useEffect, useRef } from 'react';
import { Lead, LeadStatus, Platform } from '@/data/mockLeads';
import { fetchProjectLeads } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UseStatusLeadsOptions {
  status: LeadStatus;
  platform?: Platform | 'all';
  limit?: number;
}

interface UseStatusLeadsReturn {
  leads: Lead[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMoreLeads: () => void;
  total: number;
  removeLead: (leadId: string) => void;
}

export function useStatusLeads({
  status,
  platform = 'all',
  limit = 20,
}: UseStatusLeadsOptions): UseStatusLeadsReturn {
  const { accessToken, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestInFlightRef = useRef(false);

  const selectedProjectId =
    user?.projects?.find((project) => project.is_selected)?.id ??
    user?.default_project_id ??
    null;

  const loadLeads = useCallback(
    async ({ cursor, append }: { cursor?: string | null; append?: boolean } = {}) => {
      if (!accessToken || !selectedProjectId) {
        setError('Missing authentication or project selection.');
        setIsLoading(false);
        setIsLoadingMore(false);
        setLeads([]);
        setNextCursor(null);
        return;
      }

      if (isRequestInFlightRef.current && append) {
        return;
      }

      if (!append) {
        setIsLoading(true);
        setError(null);
        setNextCursor(null);
        setLeads([]);
      } else {
        if (!cursor) {
          return;
        }
        setIsLoadingMore(true);
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isRequestInFlightRef.current = true;

      try {
        const response = await fetchProjectLeads({
          accessToken,
          projectId: selectedProjectId,
          filters: {
            status,
            platforms: platform !== 'all' ? [platform] : undefined,
            cursor,
            limit,
          },
          signal: controller.signal,
        });

        setLeads((prev) => (append ? [...prev, ...response.leads] : response.leads));
        setNextCursor(response.nextCursor);
        setTotal(response.total);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leads');
      } finally {
        isRequestInFlightRef.current = false;
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [accessToken, selectedProjectId, status, platform, limit]
  );

  const loadMoreLeads = useCallback(() => {
    if (!nextCursor || isLoading || isLoadingMore) {
      return;
    }
    void loadLeads({ cursor: nextCursor, append: true });
  }, [nextCursor, loadLeads, isLoading, isLoadingMore]);

  useEffect(() => {
    void loadLeads({ cursor: null, append: false });
    return () => abortControllerRef.current?.abort();
  }, [loadLeads]);

  const hasNextPage = Boolean(nextCursor);

  const removeLead = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    leads,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
    loadMoreLeads,
    total,
    removeLead,
  };
}
