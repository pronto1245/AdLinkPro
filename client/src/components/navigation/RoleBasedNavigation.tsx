import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  BarChart3, 
  DollarSign, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle, 
  ChevronRight,
  Activity,
  Globe,
  Zap,
  FileText,
  Briefcase,
  UserCheck,
  TrendingUp,
  Database,
  Lock,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  badge?: string;
  description?: string;
  roles: string[];
  children?: NavItem[];
}

interface RoleBasedNavProps {
  userRole: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems: NavItem[] = [
  // Super Admin Navigation
  {
    id: 'super-admin-dashboard',
    label: 'Супер-админ панель',
    path: '/dashboard/super-admin',
    icon: Shield,
    description: 'Полное управление системой',
    roles: ['super_admin'],
  },
  {
    id: 'super-admin-users',
    label: 'Управление пользователями',
    path: '/dashboard/super-admin/users',
    icon: Users,
    description: 'Создание и управление всеми пользователями',
    roles: ['super_admin'],
  },
  {
    id: 'super-admin-offers',
    label: 'Глобальные офферы',
    path: '/dashboard/super-admin/offers',
    icon: Target,
    description: 'Управление всеми офферами в системе',
    roles: ['super_admin'],
  },
  {
    id: 'super-admin-analytics',
    label: 'Системная аналитика',
    path: '/dashboard/super-admin/analytics',
    icon: BarChart3,
    description: 'Аналитика по всей платформе',
    roles: ['super_admin'],
  },
  {
    id: 'super-admin-roles',
    label: 'Управление ролями',
    path: '/dashboard/super-admin/roles',
    icon: Lock,
    description: 'Настройка ролей и разрешений',
    roles: ['super_admin'],
  },
  {
    id: 'super-admin-system',
    label: 'Системные настройки',
    path: '/dashboard/super-admin/system',
    icon: Settings,
    badge: 'NEW',
    description: 'Конфигурация платформы',
    roles: ['super_admin'],
  },

  // Advertiser Navigation
  {
    id: 'advertiser-dashboard',
    label: 'Дашборд',
    path: '/dashboard/advertiser',
    icon: LayoutDashboard,
    description: 'Обзор ваших кампаний',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-offers',
    label: 'Управление офферами',
    path: '/dashboard/advertiser/offers',
    icon: Target,
    description: 'Ваши рекламные кампании',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-partners',
    label: 'Партнеры',
    path: '/dashboard/advertiser/partners',
    icon: Users,
    description: 'Управление партнерской сетью',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-reports',
    label: 'Отчеты',
    path: '/dashboard/advertiser/reports',
    icon: BarChart3,
    description: 'Детальная аналитика',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-finances',
    label: 'Финансы',
    path: '/dashboard/advertiser/finances',
    icon: DollarSign,
    description: 'Доходы и выплаты',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-team',
    label: 'Команда',
    path: '/dashboard/advertiser/team',
    icon: UserCheck,
    description: 'Управление командой',
    roles: ['advertiser'],
  },
  {
    id: 'advertiser-postbacks',
    label: 'Постбэки',
    path: '/dashboard/advertiser/postbacks',
    icon: Zap,
    description: 'Настройка API интеграций',
    roles: ['advertiser'],
  },

  // Partner/Affiliate Navigation
  {
    id: 'partner-dashboard',
    label: 'Дашборд',
    path: '/dash',
    icon: LayoutDashboard,
    description: 'Ваш партнерский дашборд',
    roles: ['partner'],
  },
  {
    id: 'partner-offers',
    label: 'Офферы',
    path: '/dash/offers',
    icon: Target,
    description: 'Доступные предложения',
    roles: ['partner'],
  },
  {
    id: 'partner-statistics',
    label: 'Статистика',
    path: '/dash/statistics',
    icon: BarChart3,
    description: 'Ваши результаты',
    roles: ['partner'],
  },
  {
    id: 'partner-finances',
    label: 'Финансы',
    path: '/dash/finances',
    icon: DollarSign,
    description: 'Заработок и выплаты',
    roles: ['partner'],
  },
  {
    id: 'partner-postbacks',
    label: 'Постбэки',
    path: '/dash/postbacks',
    icon: Zap,
    description: 'API интеграции',
    roles: ['partner'],
  },
  {
    id: 'partner-profile',
    label: 'Профиль',
    path: '/dash/profile',
    icon: Settings,
    description: 'Настройки аккаунта',
    roles: ['partner'],
  },

  // Owner Navigation
  {
    id: 'owner-dashboard',
    label: 'Владелец панель',
    path: '/dashboard/owner',
    icon: Briefcase,
    description: 'Обзор платформы',
    roles: ['owner'],
  },
  {
    id: 'owner-users',
    label: 'Пользователи',
    path: '/dashboard/owner/users',
    icon: Users,
    description: 'Управление пользователями',
    roles: ['owner'],
  },
  {
    id: 'owner-settings',
    label: 'Настройки',
    path: '/dashboard/owner/settings',
    icon: Settings,
    description: 'Конфигурация платформы',
    roles: ['owner'],
  },
];

export default function RoleBasedNavigation({ 
  userRole, 
  isCollapsed = false, 
  onToggleCollapse 
}: RoleBasedNavProps) {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter navigation items by user role
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Group items by role for better organization
  const groupedItems = filteredItems.reduce((acc, item) => {
    const roleKey = item.roles[0]; // Use primary role
    if (!acc[roleKey]) acc[roleKey] = [];
    acc[roleKey].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isActiveRoute = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
      super_admin: 'Супер-администратор',
      advertiser: 'Рекламодатель',
      partner: 'Партнер',
      owner: 'Владелец'
    };
    return titles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-500',
      advertiser: 'bg-blue-500',
      partner: 'bg-green-500',
      owner: 'bg-purple-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  if (isCollapsed) {
    return (
      <div className="w-16 flex flex-col items-center py-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Separator />
        {filteredItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.path}>
              <Button
                variant={isActiveRoute(item.path) ? 'default' : 'ghost'}
                size="sm"
                className="p-2 relative"
                title={item.label}
              >
                <Icon className="h-4 w-4" />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="w-64 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Навигация</h2>
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Role Badge */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getRoleBadgeColor(userRole)}`}></div>
          <span className="text-xs font-medium text-muted-foreground">
            {getRoleTitle(userRole)}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link key={item.id} href={item.path}>
                <div
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs opacity-70 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {item.children && (
                    <ChevronRight className={`h-3 w-3 transition-transform ${
                      expandedGroups.has(item.id) ? 'rotate-90' : ''
                    }`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Link href="/help">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <HelpCircle className="h-3 w-3 mr-2" />
              Помощь
            </Button>
          </Link>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>v2.1.0</span>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-green-500" />
              <span>Онлайн</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Additional role-based utility component for quick actions
export function RoleBasedQuickActions({ userRole }: { userRole: string }) {
  const getQuickActions = () => {
    switch (userRole) {
      case 'super_admin':
        return [
          { label: 'Создать пользователя', icon: Users, path: '/dashboard/super-admin/users/new' },
          { label: 'Системные логи', icon: FileText, path: '/dashboard/super-admin/logs' },
          { label: 'Настройки безопасности', icon: Shield, path: '/dashboard/super-admin/security' },
        ];
      case 'advertiser':
        return [
          { label: 'Создать оффер', icon: Target, path: '/dashboard/advertiser/offers/new' },
          { label: 'Пригласить партнера', icon: Users, path: '/dashboard/advertiser/partners/invite' },
          { label: 'Отчет по конверсии', icon: BarChart3, path: '/dashboard/advertiser/reports/conversion' },
        ];
      case 'partner':
        return [
          { label: 'Найти офферы', icon: Target, path: '/dash/offers/browse' },
          { label: 'Проверить выплаты', icon: DollarSign, path: '/dash/finances/payouts' },
          { label: 'Настроить постбэки', icon: Zap, path: '/dash/postbacks/setup' },
        ];
      case 'owner':
        return [
          { label: 'Модерация контента', icon: AlertTriangle, path: '/dashboard/owner/moderation' },
          { label: 'Финансовые отчеты', icon: DollarSign, path: '/dashboard/owner/finances' },
          { label: 'Системная статистика', icon: BarChart3, path: '/dashboard/owner/stats' },
        ];
      default:
        return [];
    }
  };

  const actions = getQuickActions();

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">Быстрые действия</h3>
      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.path}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                <Icon className="h-3 w-3 mr-2" />
                {action.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}