import { Bell } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNotifications, NotificationItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const SKELETON_ROWS = Array.from({ length: 5 });

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const loadNotifications = useCallback(
    async (cursor?: string | null) => {
      if (!accessToken || isFetchingRef.current) return;
      isFetchingRef.current = true;
      const isInitialLoad = !cursor;
      setIsLoading(isInitialLoad);
      setIsLoadingMore(!isInitialLoad);

      try {
        const response = await fetchNotifications({
          accessToken,
          cursor,
        });
        setItems((prev) => (cursor ? [...prev, ...response.items] : response.items));
        setNextCursor(response.nextCursor);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (!accessToken) {
      setItems([]);
      setNextCursor(null);
      setIsLoading(false);
      return;
    }
    setItems([]);
    setNextCursor(null);
    setIsLoading(true);
    loadNotifications(null);
  }, [accessToken, loadNotifications]);

  useEffect(() => {
    if (!nextCursor || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNotifications(nextCursor);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadNotifications, nextCursor]);

  const formatTimestamp = useCallback((value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, []);

  const notifications = useMemo(() => {
    return items.map((item, index) => {
      const title = item.title ?? item.subject ?? item.type ?? 'Notification';
      const message =
        item.message ??
        item.body ??
        item.content ??
        item.description ??
        (title === 'Notification' ? '' : title);
      const timestamp = formatTimestamp(item.created_at ?? item.createdAt);
      const id = item.id ?? `${title}-${index}`;
      return { id, title, message, timestamp };
    });
  }, [formatTimestamp, items]);

  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-4">
        {SKELETON_ROWS.map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-4">
            <div className="space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
        <p className="text-muted-foreground max-w-sm">
          When you receive notifications about your leads and activity, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
              {notification.timestamp ? (
                <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
              ) : null}
            </div>
            {notification.message ? (
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            ) : null}
          </div>
        </div>
      ))}
      {isLoadingMore ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ) : null}
      <div ref={sentinelRef} />
    </div>
  );
}
