import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PanelLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainSidebar } from "@/components/admin/MainSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { desktopSidebarOpen, setDesktopSidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, accessToken } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const getPageMeta = () => {
    const path = location.pathname;

    if (path === "/" || path === "/dashboard") {
      return {
        title: "Dashboard",
        subtitle: "Welcome to your admin dashboard",
      };
    }

    if (path.startsWith("/inbox")) {
      return {
        title: "Inbox",
        subtitle: "Monitor and respond to relevant conversations",
      };
    }

    if (path.startsWith("/completed")) {
      return {
        title: "Completed",
        subtitle: "Successfully replied conversations",
      };
    }

    if (path.startsWith("/discarded")) {
      return {
        title: "Discarded",
        subtitle: "Leads marked as not relevant",
      };
    }

    if (path.startsWith("/analytics")) {
      return {
        title: "Analytics",
        subtitle: "Track your outreach performance",
      };
    }

    if (path.startsWith("/settings/product")) {
      return {
        title: "Product Setup",
        subtitle: "Configure your product information for AI-generated responses",
      };
    }

    if (path.startsWith("/settings/communities")) {
      return {
        title: "Communities & Keywords",
        subtitle: "Configure which platforms, communities, and keywords to monitor",
      };
    }

    if (path.startsWith("/settings/prompts")) {
      return {
        title: "Prompt Customization",
        subtitle: "Customize how the AI searches for and responds to leads",
      };
    }

    if (path.startsWith("/settings/team")) {
      return {
        title: "Team",
        subtitle: "",
      };
    }

    if (path.startsWith("/settings/profile")) {
      return {
        title: "Profile",
        subtitle: "",
      };
    }

    if (path.startsWith("/settings/billing")) {
      return {
        title: "Billing",
        subtitle: "Manage your plan and usage",
      };
    }

    if (path.startsWith("/settings")) {
      return {
        title: "Settings",
        subtitle: "Manage your account preferences",
      };
    }

    if (path.startsWith("/notifications")) {
      return {
        title: "Notifications",
        subtitle: "Stay updated with your latest activity",
      };
    }

    return {
      title: "App",
      subtitle: "",
    };
  };

  const handleToggleDesktopSidebar = () =>
    setDesktopSidebarOpen((prev) => !prev);

  const fetchNotificationCount = useCallback(async () => {
    if (!accessToken) {
      setNotificationCount(0);
      return;
    }
    try {
      const url = new URL(
        "https://internal-api.autoreply.ing/v1.0/notifications/count"
      );
      url.searchParams.set("is_read", "false");
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notification count");
      }
      const data = (await response.json()) as
        | { count?: number; total?: number; unread_count?: number }
        | number;
      if (typeof data === "number") {
        setNotificationCount(data);
        return;
      }
      const nextCount = data.count ?? data.total ?? data.unread_count ?? 0;
      setNotificationCount(nextCount);
    } catch {
      setNotificationCount(0);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotificationCount();

    // Poll for notifications every minute
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => clearInterval(intervalId);
  }, [fetchNotificationCount, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const pageMeta = getPageMeta();
  const displayNotificationCount =
    notificationCount > 99 ? "99+" : notificationCount.toString();

  return (
    <div className="flex min-h-screen w-full bg-card">
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden md:block fixed top-0 left-0 h-screen bg-card z-40 transition-all duration-300 ease-in-out overflow-hidden",
          desktopSidebarOpen ? "w-[280px]" : "w-0"
        )}
      >
        <div className="w-[280px] h-full">
          <MainSidebar
            onToggleSidebar={handleToggleDesktopSidebar}
            isDesktopSidebarOpen={desktopSidebarOpen}
          />
        </div>
      </aside>

      {/* Main Content - with margin for fixed sidebar */}
      <main
        className={cn(
          "flex flex-1 flex-col overflow-hidden md:py-3 md:pr-3 transition-all duration-300 ease-in-out",
          desktopSidebarOpen ? "md:ml-[280px]" : "md:ml-0 md:pl-3"
        )}
      >
        <div className="flex flex-1 flex-col rounded-none md:rounded-[32px] bg-gradient-to-b from-primary/5 via-background to-[hsl(25_100%_95%)] dark:to-[hsl(25_30%_15%)]">
          {/* Desktop Header with Toggle */}
          <header className="hidden md:flex items-center gap-3 px-6 py-4">
            {!desktopSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-border bg-card/80 hover:bg-card"
                onClick={handleToggleDesktopSidebar}
                aria-label="Open sidebar"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg border border-border bg-card/80 hover:bg-card"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {notificationCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                    {displayNotificationCount}
                  </span>
                ) : null}
              </Button>
            </div>
          </header>

          {/* Mobile Header */}
          <header className="flex items-center gap-3 border-b border-border/30 bg-transparent px-4 py-3 md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-border bg-card/80"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0" hideClose>
                <MainSidebar onClose={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <h1 className="text-base font-semibold text-foreground">{pageMeta.title}</h1>
            </div>

            <div className="ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg border border-border bg-card/80 hover:bg-card"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {notificationCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                    {displayNotificationCount}
                  </span>
                ) : null}
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex flex-1 flex-col overflow-auto">
            <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
              <Outlet context={{ refreshNotificationsCount: fetchNotificationCount }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
