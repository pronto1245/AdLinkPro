import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';
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
  Building2
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Главная',
    href: '/affiliate',
    icon: Home,
    description: 'Обзор кабинета'
  },
  {
    title: 'Офферы',
    href: '/affiliate/offers',
    icon: Target,
    description: 'Доступные офферы'
  },
  {
    title: 'Ссылки',
    href: '/affiliate/links',
    icon: LinkIcon,
    description: 'Мои трекинговые ссылки'
  },
  {
    title: 'Статистика',
    href: '/affiliate/analytics',
    icon: BarChart3,
    description: 'Статистика переходов'
  },
  {
    title: 'Креативы',
    href: '/affiliate/creatives',
    icon: Palette,
    description: 'Рекламные материалы'
  },
  {
    title: 'Постбэки',
    href: '/affiliate/postbacks',
    icon: Webhook,
    description: 'Настройка постбэков'
  },
  {
    title: 'Команда',
    href: '/affiliate/team',
    icon: Users,
    description: 'Управление командой'
  },
  {
    title: 'Финансы',
    href: '/affiliate/finances',
    icon: Wallet,
    description: 'Выплаты и баланс'
  },
  {
    title: 'Профиль',
    href: '/affiliate/profile',
    icon: Settings,
    description: 'Настройки профиля'
  },
  {
    title: 'Безопасность',
    href: '/affiliate/security',
    icon: Shield,
    description: 'Настройки безопасности'
  },
  {
    title: 'Документы',
    href: '/affiliate/documents',
    icon: FileText,
    description: 'Документооборот'
  }
];

export default function AffiliateSidebar() {
  const [location] = useLocation();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">FraudGuard</h1>
                <p className="text-sm text-green-600 dark:text-green-400">Кабинет партнёра</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              collapsed && "mx-auto"
            )}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== '/affiliate' && location.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center rounded-lg transition-colors group',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2 space-x-3',
                  isActive
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                )}
                title={collapsed ? item.title : item.description}
                data-testid={`sidebar-link-${item.href.split('/').pop()}`}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-green-600 dark:text-green-400' : ''
                )} />
                {!collapsed && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 FraudGuard Platform
          </div>
        </div>
      )}
    </div>
  );
}