import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchSubscriptionSummary, SubscriptionSummaryResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useSubscription() {
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<SubscriptionSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedProjectId =
    user?.projects?.find((project) => project.is_selected)?.id ??
    user?.default_project_id ??
    null;

  const loadSubscription = useCallback(async () => {
    if (!accessToken || !selectedProjectId) {
      setError('Missing authentication or project selection.');
      setIsLoading(false);
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetchSubscriptionSummary({
        accessToken,
        projectId: selectedProjectId,
        signal: controller.signal,
      });

      setData(response);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return;
      }
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedProjectId]);

  useEffect(() => {
    void loadSubscription();
    return () => abortControllerRef.current?.abort();
  }, [loadSubscription]);

  return {
    data,
    isLoading,
    error,
    refetch: loadSubscription,
  };
}
