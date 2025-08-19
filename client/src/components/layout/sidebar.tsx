import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  DollarSign, 
  Shield, 
  Webhook, 
  Ban, 
  History, 
  Settings, 
  BarChart3, 
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  { labelKey: 'sidebar.dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard, roles: ['super_admin'] },
  { labelKey: 'sidebar.dashboard', href: '/dashboard/owner', icon: LayoutDashboard, roles: ['owner'] },
  { labelKey: 'sidebar.dashboard', href: '/dashboard/advertiser', icon: LayoutDashboard, roles: ['advertiser'] },
  { labelKey: 'sidebar.dashboard', href: '/dash', icon: LayoutDashboard, roles: ['partner', 'affiliate'] },
  { labelKey: 'sidebar.dashboard', href: '/dashboard/staff', icon: LayoutDashboard, roles: ['staff'] },
  { labelKey: 'sidebar.users', href: '/dashboard/super-admin/users', icon: Users, roles: ['super_admin'], badge: 3 },
  { labelKey: 'sidebar.users', href: '/dashboard/owner/users', icon: Users, roles: ['owner'] },
  { labelKey: 'sidebar.offers', href: '/dashboard/super-admin/offers', icon: Target, roles: ['super_admin'] },
  { labelKey: 'sidebar.offers', href: '/dashboard/advertiser/offers', icon: Target, roles: ['advertiser'] },
  { labelKey: 'sidebar.analytics', href: '/dashboard/super-admin/analytics', icon: BarChart3, roles: ['super_admin'] },
  { labelKey: 'sidebar.analytics', href: '/dashboard/advertiser/analytics', icon: BarChart3, roles: ['advertiser'] },
  { labelKey: 'sidebar.analytics', href: '/dash/statistics', icon: BarChart3, roles: ['affiliate', 'partner'] },
  { labelKey: 'sidebar.support', href: '/dashboard/staff', icon: HeadphonesIcon, roles: ['staff'] },
];

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();
  const { collapsed: isCollapsed, toggleCollapsed: toggleSidebar } = useSidebar();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'super_admin': return 'Super Admin';
      case 'advertiser': return 'Advertiser';
      case 'affiliate': return 'Affiliate';
      case 'partner': return 'Partner';
      case 'owner': return 'Owner';
      case 'staff': return 'Staff';
      default: return user.role;
    }
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-[60] bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-600 transform transition-all duration-300 lg:translate-x-0",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header with Toggle */}
        <div className={cn(
          "flex items-center border-b border-slate-200 dark:border-gray-600",
          isCollapsed ? "px-4 py-4 justify-center" : "px-6 py-4 justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="text-white w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">AffiliateHub</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel()}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            data-testid="button-toggle-sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg group transition-colors relative",
                  location === item.href
                    ? "text-white bg-blue-600 dark:bg-blue-700"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700",
                  isCollapsed ? "justify-center" : ""
                )}
                data-testid={`nav-${item.labelKey.split('.')[1]}`}
                title={isCollapsed ? t(item.labelKey) : undefined}
              >
                <IconComponent className={cn(
                  "w-5 h-5",
                  isCollapsed ? "" : "mr-3",
                  location === item.href ? "text-white" : "text-slate-400 dark:text-slate-500"
                )} />
                {!isCollapsed && (
                  <>
                    {t(item.labelKey)}
                    {item.badge && (
                      <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer with theme toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-gray-600">
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Тема</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
