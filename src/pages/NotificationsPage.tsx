import { Bell } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchNotifications, markNotificationRead, NotificationItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const SKELETON_ROWS = Array.from({ length: 5 });

export default function NotificationsPage() {
  const { accessToken } = useAuth();
  const { refreshNotificationsCount } = useOutletContext<{
    refreshNotificationsCount?: () => void;
  }>();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const hasNotifiedReadRef = useRef(false);

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

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!accessToken) return;
      setMarkingReadIds((prev) => ({ ...prev, [notificationId]: true }));
      try {
        const response = await markNotificationRead({
          accessToken,
          notificationId,
        });
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== notificationId) return item;
            return {
              ...item,
              is_read: response.is_read ?? response.isRead ?? true,
              read_at:
                response.read_at ??
                response.readAt ??
                item.read_at ??
                item.readAt ??
                new Date().toISOString(),
            };
          })
        );
        refreshNotificationsCount?.();
      } finally {
        setMarkingReadIds((prev) => {
          const next = { ...prev };
          delete next[notificationId];
          return next;
        });
      }
    },
    [accessToken, refreshNotificationsCount]
  );

  useEffect(() => {
    if (!accessToken) {
      setItems([]);
      setNextCursor(null);
      setIsLoading(false);
      hasNotifiedReadRef.current = false;
      return;
    }
    setItems([]);
    setNextCursor(null);
    setIsLoading(true);
    hasNotifiedReadRef.current = false;
    loadNotifications(null);
  }, [accessToken, loadNotifications]);

  useEffect(() => {
    if (isLoading || !accessToken || hasNotifiedReadRef.current) return;
    hasNotifiedReadRef.current = true;
    refreshNotificationsCount?.();
  }, [accessToken, isLoading, refreshNotificationsCount]);

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
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
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
      const apiId = item.id;
      const isRead = item.is_read ?? false;
      return {
        id,
        apiId,
        title,
        message,
        timestamp,
        isRead,
        canMarkRead: Boolean(apiId),
      };
    });
  }, [formatTimestamp, items]);

  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-4">
        {SKELETON_ROWS.map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
              </div>
              <div className="h-3 w-28 rounded bg-muted sm:mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
          <p className="text-muted-foreground max-w-sm">
            When you receive notifications about your leads and activity, they'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg border border-border bg-card p-4 ${
              !notification.isRead && notification.canMarkRead
                ? 'cursor-pointer transition hover:border-primary/60 hover:bg-primary/5'
                : ''
            }`}
            role={!notification.isRead && notification.canMarkRead ? 'button' : undefined}
            tabIndex={!notification.isRead && notification.canMarkRead ? 0 : undefined}
            onClick={() =>
              !notification.isRead && notification.apiId
                ? handleMarkAsRead(notification.apiId)
                : null
            }
            onKeyDown={(event) => {
              if (
                (event.key === 'Enter' || event.key === ' ') &&
                !notification.isRead &&
                notification.apiId
              ) {
                event.preventDefault();
                handleMarkAsRead(notification.apiId);
              }
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                  {!notification.isRead ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Unread
                    </span>
                  ) : null}
                </div>
                {notification.message ? (
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                {notification.timestamp ? (
                  <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                ) : null}
                {!notification.isRead &&
                notification.apiId &&
                markingReadIds[notification.apiId] ? (
                  <span className="text-[11px] text-muted-foreground">Marking...</span>
                ) : null}
              </div>
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
    </div>
  );
}
