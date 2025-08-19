import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { validateToken, refreshTokenIfNeeded, setupTokenRefresh } from '@/lib/menu';
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
  id: string;
  title: string;
  href: string;
  icon: any;
  description: string;
  roles?: string[];
  requiresToken?: boolean;
  visible?: boolean;
}

// Consolidated menu items for all roles
const menuItems: MenuItem[] = [
  // Dashboard - available for all roles
  {
    id: 'dashboard',
    title: 'Дашборд',
    href: '/dashboard',
    icon: Home,
    description: 'Центральная панель управления',
    roles: ['partner', 'affiliate', 'advertiser', 'owner', 'super_admin', 'staff'],
    requiresToken: true
  },

  // Profile - available for all roles
  {
    id: 'profile',
    title: 'Профиль',
    href: '/dashboard/profile',
    icon: Settings,
    description: 'Настройки аккаунта',
    roles: ['partner', 'affiliate', 'advertiser', 'owner', 'super_admin', 'staff'],
    requiresToken: true
  },

  // Partner/Affiliate specific items
  {
    id: 'offers',
    title: 'Офферы',
    href: '/dashboard/affiliate/offers',
    icon: Target,
    description: 'Доступные офферы',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'access-requests',
    title: 'Запросы доступа',
    href: '/dashboard/affiliate/access-requests',
    icon: Send,
    description: 'Запросы к приватным офферам',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'links',
    title: 'Ссылки',
    href: '/dashboard/affiliate/links',
    icon: LinkIcon,
    description: 'Мои трекинговые ссылки',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'affiliate-statistics',
    title: 'Статистика',
    href: '/dashboard/affiliate/statistics',
    icon: BarChart3,
    description: 'Статистика переходов и конверсий',
    roles: ['partner', 'affiliate'],
    requiresToken: true
  },
  {
    id: 'creatives',
    title: 'Креативы',
    href: '/dashboard/affiliate/creatives',
    icon: Palette,
    description: 'Рекламные материалы',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'affiliate-postbacks',
    title: 'Постбэки',
    href: '/dashboard/affiliate/postbacks',
    icon: Webhook,
    description: 'Настройка постбэков',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'team',
    title: 'Команда',
    href: '/dashboard/affiliate/team',
    icon: Users,
    description: 'Управление командой',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'referrals',
    title: 'Рефералы',
    href: '/dashboard/affiliate/referrals',
    icon: UserCheck,
    description: 'Реферальная программа',
    roles: ['partner', 'affiliate']
  },
  {
    id: 'affiliate-finances',
    title: 'Финансы',
    href: '/dashboard/affiliate/finances',
    icon: Wallet,
    description: 'Выплаты и баланс',
    roles: ['partner', 'affiliate'],
    requiresToken: true
  },

  // Advertiser specific items
  {
    id: 'my-offers',
    title: 'Мои офферы',
    href: '/dashboard/advertiser/offers',
    icon: Target,
    description: 'Управление офферами',
    roles: ['advertiser']
  },
  {
    id: 'partners',
    title: 'Партнеры',
    href: '/dashboard/advertiser/partners',
    icon: Users,
    description: 'Управление партнерами',
    roles: ['advertiser']
  },
  {
    id: 'advertiser-access-requests',
    title: 'Заявки партнеров',
    href: '/dashboard/advertiser/access-requests',
    icon: Send,
    description: 'Обработка заявок партнеров',
    roles: ['advertiser']
  },
  {
    id: 'advertiser-analytics',
    title: 'Аналитика',
    href: '/dashboard/advertiser/analytics',
    icon: TrendingUp,
    description: 'Подробная аналитика и отчеты',
    roles: ['advertiser'],
    requiresToken: true
  },
  {
    id: 'advertiser-finances',
    title: 'Финансы',
    href: '/dashboard/advertiser/finances',
    icon: CreditCard,
    description: 'Финансовые операции',
    roles: ['advertiser'],
    requiresToken: true
  },
  {
    id: 'antifraud',
    title: 'Антифрод',
    href: '/dashboard/advertiser/antifraud',
    icon: Shield,
    description: 'Система защиты от мошенничества',
    roles: ['advertiser'],
    requiresToken: true
  },
  {
    id: 'advertiser-postbacks',
    title: 'Постбэки',
    href: '/dashboard/advertiser/postbacks',
    icon: Webhook,
    description: 'Настройка уведомлений',
    roles: ['advertiser']
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    href: '/dashboard/advertiser/notifications',
    icon: Bell,
    description: 'Системные уведомления',
    roles: ['advertiser']
  },

  // Common items for roles with higher privileges
  {
    id: 'security',
    title: 'Безопасность',
    href: '/dashboard/security',
    icon: Shield,
    description: 'Настройки безопасности',
    roles: ['partner', 'affiliate', 'advertiser', 'owner', 'super_admin'],
    requiresToken: true
  },
  {
    id: 'documents',
    title: 'Документы',
    href: '/dashboard/documents',
    icon: FileText,
    description: 'Документооборот',
    roles: ['partner', 'affiliate', 'advertiser', 'owner', 'super_admin']
  },

  // Support - available for all authenticated users
  {
    id: 'support',
    title: 'Поддержка',
    href: '/dashboard/support',
    icon: HelpCircle,
    description: 'Техническая поддержка',
    roles: ['partner', 'affiliate', 'advertiser', 'owner', 'super_admin', 'staff']
  }
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

  // Determine the appropriate dashboard href based on user role
  const getDashboardHref = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'partner':
      case 'affiliate':
        return '/dashboard/affiliate';
      case 'advertiser':
        return '/dashboard/advertiser';
      case 'owner':
        return '/dashboard/owner';
      case 'super_admin':
        return '/dashboard/super-admin';
      case 'staff':
        return '/dashboard/staff';
      default:
        return '/dashboard/affiliate';
    }
  };

  // Update dashboard item href based on user role
  const processedMenuItems = filteredMenuItems.map(item => {
    if (item.id === 'dashboard') {
      return { ...item, href: getDashboardHref() };
    }
    return item;
  });

  // Get role-specific branding
  const getRoleBranding = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'advertiser':
        return {
          gradient: 'from-blue-500 to-purple-600',
          text: 'text-blue-600 dark:text-blue-400',
          activeClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
          roleLabel: 'Кабинет рекламодателя'
        };
      case 'partner':
      case 'affiliate':
      default:
        return {
          gradient: 'from-green-500 to-emerald-600',
          text: 'text-green-600 dark:text-green-400',
          activeClass: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
          roleLabel: 'Кабинет партнера'
        };
    }
  };

  const branding = getRoleBranding();

  const handleLogout = () => {
    if (confirm('Выйти из системы?')) {
      logout();
    }
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
            <div className={cn("w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center", branding.gradient)}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">AdLinkPro</h1>
                <p className={cn("text-sm", branding.text)}>{branding.roleLabel}</p>
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {processedMenuItems.map((item) => {
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
                    ? branding.activeClass
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                )}
                title={(collapsed && !isMobile) ? item.title : item.description}
                data-testid={`sidebar-link-${item.id}`}
                onClick={() => isMobile && onClose?.()}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? branding.text : ''
                )} />
                {(!collapsed || isMobile) && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
            (collapsed && !isMobile) ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3'
          )}
          title={(collapsed && !isMobile) ? "Выход из системы" : "Выйти из системы"}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="font-medium">Выход</span>
          )}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 AdLinkPro Platform
            {!isTokenValid && (
              <div className="text-red-500 mt-1">
                ⚠ Token expired
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}