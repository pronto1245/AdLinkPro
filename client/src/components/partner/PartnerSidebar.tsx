import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Target, 
  FileText, 
  Users, 
  DollarSign,
  Settings,
  Bell,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  User,
  Cog,
  Send,
  UserPlus,
  TrendingUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

const getBaseSidebarItems = (t: any): Omit<SidebarItem, 'badge'>[] => [
  {
    title: t('navigation.dashboard'),
    href: "/affiliate",
    icon: Home,
  },
  {
    title: t('navigation.statistics'),
    href: "/affiliate/statistics",
    icon: BarChart3,
  },
  {
    title: t('navigation.offers'),
    href: "/affiliate/offers",
    icon: Target,
  },
  {
    title: t('navigation.accessRequests'),
    href: "/affiliate/access-requests",
    icon: Send,
  },
  {
    title: t('navigation.team'),
    href: "/affiliate/team",
    icon: Users,
  },
  {
    title: 'Рефералы',
    href: "/affiliate/referrals",
    icon: UserPlus,
  },
  {
    title: t('navigation.finances'),
    href: "/affiliate/finances",
    icon: DollarSign,
  },
  {
    title: t('navigation.postbacks'),
    href: "/affiliate/postbacks",
    icon: Settings,
  },
  {
    title: t('navigation.profile'),
    href: "/affiliate/profile",
    icon: User,
  },
  {
    title: t('navigation.settings'),
    href: "/affiliate/settings",
    icon: Cog,
  },
];

interface PartnerSidebarProps {
  className?: string;
}

export function PartnerSidebar({ className }: PartnerSidebarProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Fetch real offer count from API
  const { data: offers = [] } = useQuery<any[]>({
    queryKey: ['/api/partner/offers'],
    enabled: !!user
  });

  // Fetch notifications count
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user
  });

  // Create sidebar items with real data
  const baseSidebarItems = getBaseSidebarItems(t);
  const sidebarItems: SidebarItem[] = baseSidebarItems.map(item => {
    if (item.href === "/affiliate/offers") {
      return {
        ...item,
        badge: offers.length > 0 ? offers.length : undefined,
        badgeVariant: "secondary" as const
      };
    }
    return item;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-black dark:text-white">{t('navigation.partner', 'Партнер')}</span>
              <span className="text-xs text-black/60 dark:text-white/60">{user?.username}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/affiliate" && location.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-black dark:text-white"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || "default"} className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link
          href="/affiliate/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-black dark:text-white",
            location === "/affiliate/notifications" && "bg-primary text-primary-foreground"
          )}
          title={collapsed ? t('navigation.notifications') : undefined}
        >
          <Bell className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{t('navigation.notifications')}</span>
              {notifications.filter((n: any) => !n.is_read).length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {notifications.filter((n: any) => !n.is_read).length}
                </Badge>
              )}
            </>
          )}
        </Link>
        
        {/* Theme toggle */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          collapsed && "justify-center"
        )}>
          {!collapsed && <span className="font-medium text-black dark:text-white">{t('common.theme')}</span>}
          <ThemeToggle />
        </div>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-black dark:text-white hover:text-destructive hover:bg-destructive/10",
            collapsed && "px-3"
          )}
          title={collapsed ? t('navigation.logout') : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{t('navigation.logout')}</span>}
        </Button>
      </div>
    </div>
  );
}