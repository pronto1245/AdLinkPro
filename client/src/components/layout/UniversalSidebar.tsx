import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { validateToken, refreshTokenIfNeeded, setupTokenRefresh } from '@/lib/menu';
import { getDashboardHref, createLogoutHandler, getUserInitials } from '@/lib/navigation-utils';
import { 
  BarChart3, 
  Settings, 
  Target, 
  Users, 
  Wallet,
  Home,
  Link as LinkIcon,
  Palette,
  Webhook,
  FileText,
  Shield,
  ChevronLeft,
  Menu,
  Building2,
  Send,
  HelpCircle,
  LogOut,
  UserCheck,
  Database,
  TrendingUp,
  CreditCard,
  Bell,
  Globe
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon: any;
  description: string;
  roles?: string[];
  requiresToken?: boolean;
}

// Consolidated menu items for all roles
const menuItems: MenuItem[] = [
  // Dashboard - available for all roles
  {
    title: 'Дашборд',
    href: '/dashboard',
    icon: Home,
    description: 'Общий обзор системы',
  },
  
  // Partner/Affiliate specific items
  {
    title: 'Офферы',
    href: '/dashboard/affiliate/offers',
    icon: Target,
    description: 'Доступные офферы',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Запросы доступа',
    href: '/dashboard/affiliate/access-requests',
    icon: Send,
    description: 'Запросы к приватным офферам',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Ссылки',
    href: '/dashboard/affiliate/links',
    icon: LinkIcon,
    description: 'Трекинговые ссылки',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Статистика',
    href: '/dashboard/affiliate/statistics',
    icon: BarChart3,
    description: 'Статистика переходов',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Креативы',
    href: '/dashboard/affiliate/creatives',
    icon: Palette,
    description: 'Рекламные материалы',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Постбэки',
    href: '/dashboard/affiliate/postbacks',
    icon: Webhook,
    description: 'Настройка постбэков',
    roles: ['partner', 'affiliate'],
    requiresToken: true,
  },
  {
    title: 'Команда',
    href: '/dashboard/affiliate/team',
    icon: Users,
    description: 'Управление командой',
    roles: ['partner', 'affiliate'],
  },
  {
    title: 'Финансы',
    href: '/dashboard/affiliate/finances',
    icon: Wallet,
    description: 'Выплаты и баланс',
    roles: ['partner', 'affiliate'],
    requiresToken: true,
  },

  // Advertiser specific items
  {
    title: 'Офферы',
    href: '/dashboard/advertiser/offers',
    icon: Target,
    description: 'Управление офферами',
    roles: ['advertiser'],
  },
  {
    title: 'Партнёры',
    href: '/dashboard/advertiser/partners',
    icon: Users,
    description: 'Управление партнёрами',
    roles: ['advertiser'],
  },
  {
    title: 'Отчёты',
    href: '/dashboard/advertiser/reports',
    icon: TrendingUp,
    description: 'Аналитика и отчёты',
    roles: ['advertiser'],
    requiresToken: true,
  },
  {
    title: 'Финансы',
    href: '/dashboard/advertiser/finances',
    icon: CreditCard,
    description: 'Финансовое управление',
    roles: ['advertiser'],
    requiresToken: true,
  },
  {
    title: 'Антифрод',
    href: '/dashboard/advertiser/antifraud',
    icon: Shield,
    description: 'Защита от мошенничества',
    roles: ['advertiser'],
    requiresToken: true,
  },

  // Owner specific items
  {
    title: 'Пользователи',
    href: '/dashboard/owner/users',
    icon: Users,
    description: 'Управление пользователями',
    roles: ['owner'],
    requiresToken: true,
  },
  {
    title: 'Системные настройки',
    href: '/dashboard/owner/settings',
    icon: Database,
    description: 'Конфигурация системы',
    roles: ['owner'],
    requiresToken: true,
  },

  // Super Admin items
  {
    title: 'Пользователи',
    href: '/dashboard/super-admin/users',
    icon: Users,
    description: 'Управление всеми пользователями',
    roles: ['super_admin'],
    requiresToken: true,
  },
  {
    title: 'Аналитика',
    href: '/dashboard/super-admin/analytics',
    icon: BarChart3,
    description: 'Системная аналитика',
    roles: ['super_admin'],
    requiresToken: true,
  },
  {
    title: 'Глобальные настройки',
    href: '/dashboard/super-admin/settings',
    icon: Globe,
    description: 'Глобальная конфигурация',
    roles: ['super_admin'],
    requiresToken: true,
  },

  // Common items for all roles
  {
    title: 'Профиль',
    href: '/profile',
    icon: Settings,
    description: 'Настройки профиля',
  },
  {
    title: 'Безопасность',
    href: '/security',
    icon: Shield,
    description: 'Настройки безопасности',
    requiresToken: true,
  },
  {
    title: 'Уведомления',
    href: '/notifications',
    icon: Bell,
    description: 'Управление уведомлениями',
  },
  {
    title: 'Документы',
    href: '/documents',
    icon: FileText,
    description: 'Документооборот',
  },
  {
    title: 'Управление ролями',
    href: '/role-management',
    icon: UserCheck,
    description: 'Управление ролями пользователей',
    roles: ['owner', 'super_admin'],
    requiresToken: true,
  },
  {
    title: 'Поддержка',
    href: '/support',
    icon: HelpCircle,
    description: 'Техническая поддержка',
  },
];

interface UniversalSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function UniversalSidebar({ isMobile = false, onClose }: UniversalSidebarProps) {
  const [location] = useLocation();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { user, token, logout } = useAuth();
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);

  // Enhanced token validation with automatic refresh
  useEffect(() => {
    const validateAndRefreshToken = async () => {
      const currentToken = token || localStorage.getItem('token') || localStorage.getItem('auth:token');
      const validation = validateToken(currentToken);
      
      setIsTokenValid(validation.valid);
      setTokenExpiresAt(validation.expiresAt || null);
      
      // Try to refresh token if it's expiring soon or expired
      if (!validation.valid || (validation.expiresAt && validation.expiresAt < Date.now() / 1000 + 300)) {
        const refreshed = await refreshTokenIfNeeded();
        if (refreshed) {
          const newValidation = validateToken(localStorage.getItem('token'));
          setIsTokenValid(newValidation.valid);
          setTokenExpiresAt(newValidation.expiresAt || null);
        }
      }
    };

    validateAndRefreshToken();
    
    // Set up automatic token refresh
    const cleanup = setupTokenRefresh();
    
    // Check token every minute
    const interval = setInterval(validateAndRefreshToken, 60000);
    
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [token]);

  // Filter menu items based on user role and token requirements
  const filteredMenuItems = menuItems.filter(item => {
    // If item has role restrictions, check if user's role is included
    if (item.roles && !item.roles.includes(user?.role || '')) {
      return false;
    }
    
    // If item requires token, check if token is valid
    if (item.requiresToken && !isTokenValid) {
      return false;
    }
    
    return true;
  });

  const handleLogout = createLogoutHandler(logout, onClose);

  // Get time until token expiry
  const getTokenExpiryInfo = () => {
    if (!tokenExpiresAt) return null;
    
    const now = Date.now() / 1000;
    const remaining = tokenExpiresAt - now;
    
    if (remaining <= 0) return 'Истёк';
    if (remaining < 300) return `${Math.floor(remaining / 60)}м`;
    if (remaining < 3600) return `${Math.floor(remaining / 60)}м`;
    if (remaining < 86400) return `${Math.floor(remaining / 3600)}ч`;
    
    return `${Math.floor(remaining / 86400)}д`;
  };

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-all duration-300 ease-in-out",
        isMobile ? "w-64 shadow-lg" : (collapsed ? "w-16" : "w-64")
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">AdLinkPro</h1>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {user?.role === 'partner' || user?.role === 'affiliate' ? 'Партнёрская панель' :
                   user?.role === 'advertiser' ? 'Панель рекламодателя' :
                   user?.role === 'owner' ? 'Панель владельца' :
                   user?.role === 'super_admin' ? 'Супер админ' : 'Панель управления'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={isMobile ? onClose : toggleCollapsed}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              collapsed && !isMobile && "mx-auto"
            )}
            title={isMobile ? "Закрыть меню" : (collapsed ? "Развернуть меню" : "Свернуть меню")}
          >
            {isMobile ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : collapsed ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* User info with enhanced token status */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getUserInitials(user)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {!isTokenValid ? (
                  <span className="text-red-500">⚠ Токен истёк</span>
                ) : (
                  <span className="text-green-500">
                    ✓ Активен {getTokenExpiryInfo() && `(${getTokenExpiryInfo()})`}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard link - special handling */}
        <Link href={getDashboardHref(user)}>
          <div
            className={cn(
              'flex items-center rounded-lg transition-colors group',
              (collapsed && !isMobile) ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3',
              (location === getDashboardHref(user) || location.startsWith('/dashboard'))
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
            )}
            title={(collapsed && !isMobile) ? 'Дашборд' : 'Главная панель управления'}
            data-testid="sidebar-link-dashboard"
            onClick={() => isMobile && onClose?.()}
          >
            <Home className={cn(
              'w-5 h-5 flex-shrink-0',
              (location === getDashboardHref(user) || location.startsWith('/dashboard'))
                ? 'text-blue-600 dark:text-blue-400' : ''
            )} />
            {(!collapsed || isMobile) && (
              <span className="font-medium truncate">Дашборд</span>
            )}
          </div>
        </Link>

        {/* Rest of menu items */}
        {filteredMenuItems.slice(1).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== '/dashboard' && location.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center rounded-lg transition-colors group',
                  (collapsed && !isMobile) ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                  item.requiresToken && !isTokenValid && 'opacity-50 cursor-not-allowed'
                )}
                title={(collapsed && !isMobile) ? item.title : item.description}
                data-testid={`sidebar-link-${item.href.split('/').pop()}`}
                onClick={(e) => {
                  if (item.requiresToken && !isTokenValid) {
                    e.preventDefault();
                    return;
                  }
                  isMobile && onClose?.();
                }}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-blue-600 dark:text-blue-400' : ''
                )} />
                {(!collapsed || isMobile) && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
                {item.requiresToken && !isTokenValid && (!collapsed || isMobile) && (
                  <span className="text-xs text-red-500 ml-auto">!</span>
                )}
              </div>
            </Link>
          );
        })}
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center rounded-lg transition-colors group text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300',
            (collapsed && !isMobile) ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3'
          )}
          title={(collapsed && !isMobile) ? 'Выйти' : 'Выйти из системы'}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="font-medium truncate">Выход</span>
          )}
        </button>
      </nav>

      {/* Footer with enhanced token info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 AdLinkPro Platform
            {!isTokenValid && (
              <div className="text-red-500 mt-1 font-medium">
                ⚠ Требуется обновление токена
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}