import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Settings, 
  Target, 
  Users, 
  Wallet,
  Home,
  Building2,
  Shield,
  FileText,
  Download
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Главная',
    href: '/advertiser',
    icon: Home,
    description: 'Обзор кабинета'
  },
  {
    title: 'Мои офферы',
    href: '/advertiser/offers',
    icon: Target,
    description: 'Управление офферами'
  },
  {
    title: 'Полученные офферы',
    href: '/advertiser/received-offers',
    icon: Download,
    description: 'Офферы от поставщиков'
  },
  {
    title: 'Партнёры',
    href: '/advertiser/partners',
    icon: Users,
    description: 'Управление партнёрами'
  },
  {
    title: 'Статистика',
    href: '/advertiser/analytics',
    icon: BarChart3,
    description: 'Аналитика и отчёты'
  },
  {
    title: 'Финансы',
    href: '/advertiser/finances',
    icon: Wallet,
    description: 'Финансовые операции'
  },
  {
    title: 'Командный режим',
    href: '/advertiser/team',
    icon: Users,
    description: 'Управление командой и права доступа'
  },
  {
    title: 'Антифрод',
    href: '/advertiser/antifraud',
    icon: Shield,
    description: 'Система защиты от фродового трафика'
  },
  {
    title: 'Профиль',
    href: '/advertiser/profile',
    icon: Settings,
    description: 'Настройки профиля'
  },
  {
    title: 'Безопасность',
    href: '/advertiser/security',
    icon: Shield,
    description: 'Настройки безопасности'
  },
  {
    title: 'Документы',
    href: '/advertiser/documents',
    icon: FileText,
    description: 'Документооборот'
  }
];

export default function AdvertiserSidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FraudGuard</h1>
            <p className="text-sm text-blue-600 dark:text-blue-400">Кабинет рекламодателя</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== '/advertiser' && location.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                )}
                title={item.description}
                data-testid={`sidebar-link-${item.href.split('/').pop()}`}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-blue-600 dark:text-blue-400' : ''
                )} />
                <span className="font-medium">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2025 FraudGuard Platform
        </div>
      </div>
    </div>
  );
}