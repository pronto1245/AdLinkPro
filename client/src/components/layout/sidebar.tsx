import { Link, useLocation } from 'wouter';
import { useAuth } from '../../contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { cn } from '../../lib/utils';
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
import { useSidebar } from '../../contexts/sidebar-context';
import { ThemeToggle } from './ui/theme-toggle';

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  { labelKey: 'sidebar.dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin'] },
  { labelKey: 'sidebar.users', href: '/admin/users', icon: Users, roles: ['super_admin'], badge: 3 },
  { labelKey: 'sidebar.userAnalytics', href: '/admin/user-analytics', icon: BarChart3, roles: ['super_admin'] },
  { labelKey: 'sidebar.roles', href: '/admin/roles', icon: Shield, roles: ['super_admin'] },
  { labelKey: 'sidebar.offers', href: '/admin/OffersManagement', icon: Target, roles: ['super_admin', 'advertiser'] },
  { labelKey: 'sidebar.finances', href: '/admin/finances', icon: DollarSign, roles: ['super_admin', 'advertiser'] },
  { labelKey: 'sidebar.antifraud', href: '/admin/fraud', icon: Shield, roles: ['super_admin'] },
  { labelKey: 'sidebar.postbacks', href: '/super-admin/postbacks', icon: Webhook, roles: ['super_admin', 'advertiser', 'affiliate'] },
  { labelKey: 'sidebar.blacklist', href: '/admin/blacklist', icon: Ban, roles: ['super_admin'] },
  { labelKey: 'sidebar.auditLogs', href: '/admin/audit-logs', icon: History, roles: ['super_admin'] },
  { labelKey: 'sidebar.systemSettings', href: '/admin/system-settings', icon: Settings, roles: ['super_admin'] },
  { labelKey: 'sidebar.analytics', href: '/super-admin/analytics', icon: BarChart3, roles: ['super_admin', 'advertiser', 'affiliate'] },
  { labelKey: 'sidebar.support', href: '/admin/support', icon: HeadphonesIcon, roles: ['super_admin', 'advertiser', 'affiliate'] },
];

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      case 'super_admin': return t('roles.superAdmin');
      case 'advertiser': return t('roles.advertiser');
      case 'affiliate': return t('roles.affiliate');
      case 'staff': return t('roles.staff');
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
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">AdLinkPro</h1>
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.theme')}</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
