import { useState, useEffect } from "react";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  BarChart3,
  Settings,
  Users,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  PanelLeft,
  Search,
  MessageCircle,
  ChevronDown,
  Package,
  Globe,
  Sparkles,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLeads } from "@/context/LeadsContext";
import { useAuth, type Project } from "@/context/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const primaryNavItems: NavItem[] = [
  { icon: Inbox, label: "Inbox", path: "/inbox" },
  { icon: CheckCircle2, label: "Completed", path: "/completed" },
  { icon: XCircle, label: "Discarded", path: "/discarded" },
];

const secondaryNavItems: NavItem[] = [
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

const settingsItems: NavItem[] = [
  { icon: Package, label: "Product Setup", path: "/settings/product" },
  { icon: Globe, label: "Communities", path: "/settings/communities" },
  { icon: Sparkles, label: "Prompts", path: "/settings/prompts" },
  { icon: Users, label: "Team", path: "/settings/team" },
  { icon: User, label: "Profile", path: "/settings/profile" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
];

interface MainSidebarProps {
  onClose?: () => void;
  onToggleSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
}

export function MainSidebar({
  onClose,
  onToggleSidebar,
  isDesktopSidebarOpen,
}: MainSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, usageQuota } = useLeads();
  const { user } = useAuth();

  const isInSettings = location.pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isInSettings);

  // Get projects from user, default to empty array if not available
  const projects = user?.projects || [];

  // Find the default selected project or use the first one
  const defaultProject = projects.find(p => p.is_selected) || projects[0];

  // State for active project
  const [activeProject, setActiveProject] = useState<Project | undefined>(defaultProject);

  // Update active project when user projects change
  useEffect(() => {
    if (defaultProject && !activeProject) {
      setActiveProject(defaultProject);
    }
  }, [defaultProject, activeProject]);

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    navigate("/auth");
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;

  const usagePercent = (usageQuota.used / usageQuota.limit) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-sidebar">
      {/* Header with Logo */}
      <div className="flex items-center gap-3 px-4 py-4">
        <img src="/logo.png" alt="Emirates Escape" class="h-9 w-auto object-contain">
        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">L</span>
        </div>
        <span className="text-base font-semibold text-foreground">Lovable</span> */}
        <div className="ml-auto">
          {onToggleSidebar ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent"
              onClick={onToggleSidebar}
              aria-pressed={isDesktopSidebarOpen}
              aria-label={isDesktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Project Selector */}
      <div className="px-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-10 px-3"
            >
              <span className="truncate font-medium">
                {activeProject?.name || "My Product"}
              </span>
              <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={cn(activeProject?.id === project.id && "bg-accent")}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {/* Primary Navigation */}
          {primaryNavItems.map((item) => {
            const isItemActive = isActive(item.path);
            const Icon = item.icon;
            const badgeCount = item.path === "/inbox" ? stats.unread : undefined;

            return (
              <Button
                key={item.path}
                variant={isItemActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "gap-3 rounded-lg justify-between",
                  isItemActive && "bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {badgeCount !== undefined && badgeCount > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                    {badgeCount}
                  </Badge>
                )}
              </Button>
            );
          })}

          <div className="py-2">
            <div className="h-px bg-border" />
          </div>

          {/* Secondary Navigation */}
          {secondaryNavItems.map((item) => {
            const isItemActive = isActive(item.path);
            const Icon = item.icon;

            return (
              <Button
                key={item.path}
                variant={isItemActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "gap-3 rounded-lg",
                  isItemActive && "bg-sidebar-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}

          {/* Settings with submenu */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isInSettings ? "sidebarActive" : "sidebar"}
                size="sidebar"
                className={cn(
                  "gap-3 rounded-lg justify-between",
                  isInSettings && "bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 pt-1">
              <div className="space-y-1">
                {settingsItems.map((item) => {
                  const isItemActive = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Button
                      key={item.path}
                      variant={isItemActive ? "sidebarActive" : "sidebar"}
                      size="sidebar"
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        "gap-3 rounded-lg",
                        isItemActive && "bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      {/* Footer - Usage & Actions */}
      <div className="mt-auto border-t border-border">
        {/* Usage Quota */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Replies used</span>
            <span className="font-medium text-foreground">
              {usageQuota.used}/{usageQuota.limit}
            </span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => handleNavClick("/settings/billing")}
          >
            <Zap className="h-4 w-4 mr-1" />
            Upgrade Plan
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-4 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-border bg-card hover:bg-accent"
              >
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg"
            >
              <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:bg-accent focus:text-foreground">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Search Help Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:bg-accent focus:text-foreground">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span>Contact support</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-9 w-9 rounded-full border border-border bg-card hover:bg-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
