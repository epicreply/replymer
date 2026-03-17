import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Check,
  ExternalLink,
  Mail,
  MessageSquare,
  Sparkles,
  ThumbsDown,
} from 'lucide-react';
import type { Lead } from '@/data/mockLeads';
import { useAuth } from '@/context/AuthContext';
import { useLeads } from '@/context/LeadsContext';
import { fetchSwipeLeads, updateLeadStatus as updateLeadStatusApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformBadge } from '@/components/leads/PlatformBadge';
import { RelevancyBadge } from '@/components/leads/RelevancyBadge';

const SWIPE_LIMIT = 20;
const SWIPE_THRESHOLD = 120;
const SWIPE_ANIMATION_MS = 240;
const PREFETCH_THRESHOLD = 5;

type SwipeDirection = 'left' | 'right';
type GestureLock = 'x' | 'y' | null;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface SwipeLeadCardProps {
  lead: Lead;
  className?: string;
}

function SwipeLeadCard({ lead, className }: SwipeLeadCardProps) {
  const reasoningText = lead.reasoning?.trim() ?? '';
  const suggestedComment = lead.suggestedComment?.trim() ?? '';
  const suggestedDM = lead.suggestedDM?.trim() ?? '';

  return (
    <Card className={cn('h-full overflow-hidden rounded-2xl border-border/70 shadow-xl', className)}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <RelevancyBadge score={lead.relevancyScore} size="sm" />
          <PlatformBadge platform={lead.platform} />
        </div>

        <CardContent className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {lead.authorHandle || lead.author || 'Unknown author'}
                </span>
                <span>•</span>
                <span>{lead.community}</span>
              </div>
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                {lead.title}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {lead.content}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Original
                  </a>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                </span>
              </div>
            </section>

            {reasoningText ? (
              <section className="rounded-xl border border-border/70 bg-muted/25 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Why AI marked this as a lead
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {reasoningText}
                </p>
              </section>
            ) : null}

            {suggestedComment ? (
              <section className="rounded-xl border border-border/70 bg-muted/25 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Suggested Comment
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {suggestedComment}
                </p>
              </section>
            ) : null}

            {suggestedDM ? (
              <section className="rounded-xl border border-border/70 bg-muted/25 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Suggested DM
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {suggestedDM}
                </p>
              </section>
            ) : null}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default function SwipePage() {
  const { accessToken, user } = useAuth();
  const { refreshInboxCounts } = useLeads();

  const selectedProjectId = useMemo(
    () =>
      user?.projects?.find((project) => project.is_selected)?.id ??
      user?.default_project_id ??
      null,
    [user]
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isActionInFlight, setIsActionInFlight] = useState(false);

  const swipeXRef = useRef(0);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const gestureRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    lock: GestureLock;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lock: null,
  });

  const currentLead = leads[0] ?? null;
  const nextLead = leads[1] ?? null;

  const setSwipeXValue = useCallback((value: number) => {
    swipeXRef.current = value;
    setSwipeX(value);
  }, []);

  const resetSwipePositionInstantly = useCallback(() => {
    setIsDragging(true);
    setSwipeXValue(0);
    requestAnimationFrame(() => {
      setIsDragging(false);
    });
  }, [setSwipeXValue]);

  const loadInitialLeads = useCallback(async () => {
    if (!accessToken || !selectedProjectId) {
      setError('Missing authentication or project selection.');
      setLeads([]);
      setIsLoading(false);
      setHasMore(false);
      setNextCursor(null);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchSwipeLeads({
        accessToken,
        projectId: selectedProjectId,
        params: {
          sortBy: 'relevancy_score',
          sortOrder: 'desc',
          limit: SWIPE_LIMIT,
        },
        signal: controller.signal,
      });

      if (abortControllerRef.current !== controller) {
        return;
      }

      setLeads(response.leads);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return;
      }

      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load leads');
      setLeads([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [accessToken, selectedProjectId]);

  const loadMoreLeads = useCallback(async () => {
    if (!nextCursor || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    if (!accessToken || !selectedProjectId) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetchSwipeLeads({
        accessToken,
        projectId: selectedProjectId,
        params: {
          sortBy: 'relevancy_score',
          sortOrder: 'desc',
          limit: SWIPE_LIMIT,
          cursor: nextCursor,
        },
      });

      setLeads((prev) => [...prev, ...response.leads]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (fetchError) {
      setHasMore(false);
      toast({
        title: 'Failed to load more leads',
        description: fetchError instanceof Error ? fetchError.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoading, isLoadingMore, hasMore, accessToken, selectedProjectId]);

  const handleDecision = useCallback(
    async (direction: SwipeDirection) => {
      const activeLead = leads[0];

      if (!activeLead || isActionInFlight) {
        return;
      }

      if (!accessToken || !selectedProjectId) {
        toast({
          title: 'Error',
          description: 'Missing authentication or project selection.',
          variant: 'destructive',
        });
        return;
      }

      const viewportWidth = typeof window === 'undefined' ? 800 : window.innerWidth;
      const deckWidth = deckRef.current?.offsetWidth ?? viewportWidth;
      const exitDistance = Math.max(deckWidth + 160, viewportWidth * 0.8);
      const targetX = direction === 'right' ? exitDistance : -exitDistance;
      const status = direction === 'right' ? 'completed' : 'discarded';

      setIsActionInFlight(true);
      setIsDragging(false);
      setSwipeXValue(targetX);

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), SWIPE_ANIMATION_MS);
      });

      try {
        await updateLeadStatusApi({
          accessToken,
          projectId: selectedProjectId,
          leadId: activeLead.id,
          status,
        });

        setLeads((prev) => prev.filter((lead) => lead.id !== activeLead.id));
        resetSwipePositionInstantly();
        void refreshInboxCounts();

        toast({
          title: direction === 'right' ? 'Lead approved' : 'Lead discarded',
          description:
            direction === 'right'
              ? 'Lead moved to Completed.'
              : 'Lead moved to Discarded.',
        });
      } catch (statusError) {
        setIsDragging(false);
        setSwipeXValue(0);
        toast({
          title: 'Failed to update lead',
          description:
            statusError instanceof Error ? statusError.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsActionInFlight(false);
      }
    },
    [leads, isActionInFlight, accessToken, selectedProjectId, refreshInboxCounts, resetSwipePositionInstantly, setSwipeXValue]
  );

  const resetGesture = useCallback(() => {
    gestureRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      lock: null,
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!currentLead || isActionInFlight) {
        return;
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      gestureRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lock: null,
      };
    },
    [currentLead, isActionInFlight]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current;

      if (!gesture.active || gesture.pointerId !== event.pointerId || isActionInFlight) {
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;

      if (!gesture.lock) {
        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
          return;
        }
        gesture.lock = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
      }

      if (gesture.lock === 'x') {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
        setIsDragging(true);
        setSwipeXValue(deltaX);
      }
    },
    [isActionInFlight, setSwipeXValue]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current;

      if (!gesture.active || gesture.pointerId !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (gesture.lock === 'x') {
        const currentOffset = swipeXRef.current;
        const threshold = Math.max(
          SWIPE_THRESHOLD,
          Math.floor((deckRef.current?.offsetWidth ?? event.currentTarget.clientWidth) * 0.25)
        );

        if (Math.abs(currentOffset) >= threshold) {
          void handleDecision(currentOffset > 0 ? 'right' : 'left');
        } else {
          setIsDragging(false);
          setSwipeXValue(0);
        }
      }

      resetGesture();
    },
    [handleDecision, resetGesture, setSwipeXValue]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current;

      if (gesture.active && gesture.pointerId === event.pointerId) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setIsDragging(false);
        setSwipeXValue(0);
      }

      resetGesture();
    },
    [resetGesture, setSwipeXValue]
  );

  useEffect(() => {
    void loadInitialLeads();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadInitialLeads]);

  useEffect(() => {
    if (isLoading || isLoadingMore || isActionInFlight) {
      return;
    }

    if (leads.length > PREFETCH_THRESHOLD || !nextCursor || !hasMore) {
      return;
    }

    void loadMoreLeads();
  }, [leads.length, nextCursor, hasMore, isLoading, isLoadingMore, isActionInFlight, loadMoreLeads]);

  const swipeProgress = clamp(Math.abs(swipeX) / 180, 0, 1);
  const approveOpacity = clamp(swipeX / 120, 0, 1);
  const discardOpacity = clamp(-swipeX / 120, 0, 1);
  const cardTransition = isDragging
    ? 'none'
    : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease';
  const topCardStyle = {
    transform: `translateX(${swipeX}px) rotate(${swipeX / 20}deg)`,
    opacity: 1 - clamp(Math.abs(swipeX) / 760, 0, 0.25),
    transition: cardTransition,
    touchAction: 'pan-y' as const,
  };
  const stackedCardStyle = {
    transform: `translateY(${10 - swipeProgress * 8}px) scale(${0.96 + swipeProgress * 0.04})`,
    transition: 'transform 200ms ease-out',
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex h-[calc(100dvh-120px)] flex-col -my-6 md:h-[calc(100vh-140px)] md:-my-8">
        <div className="px-4 pb-3 pt-4 md:px-3">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">Swipe Leads</h1>
              <p className="text-sm text-muted-foreground">
                Right to approve, left to discard
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
              <span>{leads.length} in queue</span>
              {isLoadingMore ? <span>• Loading more...</span> : null}
            </div>
          </div>
        </div>

        <div className="relative flex-1 px-3 pb-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error && leads.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="space-y-3 py-8 text-center">
                  <p className="font-medium text-destructive">Unable to load leads</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={() => void loadInitialLeads()}>Retry</Button>
                </CardContent>
              </Card>
            </div>
          ) : !currentLead ? (
            <div className="flex h-full items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="space-y-3 py-8 text-center">
                  <p className="font-medium text-foreground">No more leads to review</p>
                  <p className="text-sm text-muted-foreground">
                    {hasMore ? 'Loading more leads...' : 'You are all caught up for now.'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void loadInitialLeads()}
                    disabled={isLoading || isLoadingMore}
                  >
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div ref={deckRef} className="relative h-full">
              <div className="pointer-events-none absolute inset-x-4 top-3 z-20 flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive transition-opacity',
                    discardOpacity > 0 ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ opacity: discardOpacity }}
                >
                  Discard
                </span>
                <span
                  className={cn(
                    'rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition-opacity dark:text-emerald-400',
                    approveOpacity > 0 ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{ opacity: approveOpacity }}
                >
                  Approve
                </span>
              </div>

              <div className="absolute inset-0 pb-20 pt-2">
                {nextLead ? (
                  <div className="absolute inset-0 px-2" style={stackedCardStyle}>
                    <SwipeLeadCard
                      lead={nextLead}
                      className="pointer-events-none scale-[0.99] opacity-80 shadow-lg"
                    />
                  </div>
                ) : null}

                <div className="absolute inset-0 px-0">
                  <div
                    className={cn(
                      'h-full select-none',
                      !isActionInFlight && 'cursor-grab active:cursor-grabbing'
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={topCardStyle}
                  >
                    <SwipeLeadCard lead={currentLead} />
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-30 px-2 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => void handleDecision('left')}
                    disabled={isActionInFlight}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Discard
                  </Button>
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => void handleDecision('right')}
                    disabled={isActionInFlight}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
