import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: string[];
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  { label: 'dashboard', href: '/admin', icon: 'fas fa-tachometer-alt', roles: ['super_admin'] },
  { label: 'users', href: '/admin/users', icon: 'fas fa-users', roles: ['super_admin'], badge: 3 },
  { label: 'offers', href: '/admin/offers', icon: 'fas fa-bullseye', roles: ['super_admin', 'advertiser'] },
  { label: 'finance', href: '/admin/finance', icon: 'fas fa-dollar-sign', roles: ['super_admin', 'advertiser'] },
  { label: 'postbacks', href: '/admin/postbacks', icon: 'fas fa-link', roles: ['super_admin', 'advertiser', 'affiliate'] },
  { label: 'analytics', href: '/admin/analytics', icon: 'fas fa-chart-bar', roles: ['super_admin', 'advertiser', 'affiliate'] },
  { label: 'support', href: '/admin/support', icon: 'fas fa-ticket-alt', roles: ['super_admin', 'advertiser', 'affiliate'] },
  { label: 'settings', href: '/admin/settings', icon: 'fas fa-cog', roles: ['super_admin', 'advertiser', 'affiliate'] },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

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
      default: return user.role;
    }
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0",
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white text-sm"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AffiliateHub</h1>
              <p className="text-xs text-slate-500">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg group transition-colors",
                location === item.href
                  ? "text-white bg-primary-500"
                  : "text-slate-700 hover:bg-slate-100"
              )}
              data-testid={`nav-${item.label}`}
            >
              <i className={cn(item.icon, "w-5 h-5 mr-3", location === item.href ? "" : "text-slate-400")}></i>
              {t(item.label)}
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt w-4 h-4"></i>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
