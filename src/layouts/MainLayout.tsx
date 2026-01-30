import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainSidebar } from "@/components/admin/MainSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.includes("team")) return "Team";
    if (path.includes("profile")) return "Profile";
    if (path.includes("billing")) return "Billing";
    return "Settings";
  };

  const handleToggleDesktopSidebar = () =>
    setDesktopSidebarOpen((prev) => !prev);

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

            <span className="text-base font-semibold text-foreground">{getPageTitle()}</span>

            {!sidebarOpen && (
              <div className="ml-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/80">
                  <PanelLeft className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </header>

          {/* Page Content */}
          <div className="flex flex-1 flex-col overflow-auto">
            <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
