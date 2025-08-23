import { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Mail, 
  User, 
  DollarSign,
  BarChart3,
  FileText,
  Home,
  Menu,
  TrendingUp,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { createLogoutHandler, getUserInitials, getRoleDisplayName } from '@/lib/navigation-utils';
import { validateToken, refreshTokenIfNeeded } from '@/lib/menu';
import { routeByRole } from '@/utils/routeByRole';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  href: string;
  roles?: string[];
  requiresToken?: boolean;
  onClick?: () => void;
}

export function TopNavigation() {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Force Russian language
  useEffect(() => {
    if (i18n.language !== 'ru') {
      localStorage.setItem('i18nextLng', 'ru');
      i18n.changeLanguage('ru');
    }
  }, [i18n]);

  // Setup automatic token refresh
  useEffect(() => {
    // Simple token refresh setup - check token validity every 30 minutes
    const setupTokenRefresh = () => {
      const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && user) {
          // Token refresh logic could be implemented here
          console.log('Token refresh check');
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    };

    const cleanup = setupTokenRefresh();
    return cleanup;
  }, [user]);

  // Define menu items based on user role
  const getMenuItems = (): MenuItem[] => {
    if (!user) {return [];}

    const userRole = user.role?.toLowerCase() ?? 'guest';
    
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        title: 'Дашборд',
        icon: Home,
        description: 'Главная панель управления',
        href: routeByRole(user.role),
        onClick: () => setLocation(routeByRole(user.role)),
      },
      {
        id: 'profile',
        title: 'Профиль',
        icon: User,
        description: 'Настройки профиля',
        href: '/profile',
        onClick: () => setLocation('/profile'),
      },
      {
        id: 'notifications',
        title: 'Уведомления',
        icon: Bell,
        description: 'Центр уведомлений',
        href: getNotificationsHref(),
        onClick: handleNotificationClick,
      },
      {
        id: 'settings',
        title: 'Настройки',
        icon: Settings,
        description: 'Системные настройки',
        href: '/settings',
        onClick: handleSettingsClick,
      },
      {
        id: 'help',
        title: 'Помощь',
        icon: HelpCircle,
        description: 'Поддержка и справка',
        href: '/help',
        onClick: handleSupportClick,
      },
    ];

    // Role-specific items
    const roleSpecificItems: MenuItem[] = [];
    
    if (['advertiser', 'owner', 'super_admin'].includes(userRole)) {
      roleSpecificItems.push({
        id: 'reports',
        title: 'Отчёты',
        icon: FileText,
        description: 'Аналитические отчёты',
        href: `/${userRole}/reports`,
        onClick: () => setLocation(`/${userRole}/reports`),
        requiresToken: true,
      });
      
      roleSpecificItems.push({
        id: 'analytics',
        title: 'Аналитика',
        icon: BarChart3,
        description: 'Подробная аналитика',
        href: `/${userRole}/analytics`,
        onClick: () => setLocation(`/${userRole}/analytics`),
        requiresToken: true,
      });
    }

    if (['affiliate', 'partner'].includes(userRole)) {
      roleSpecificItems.push({
        id: 'statistics',
        title: 'Статистика',
        icon: TrendingUp,
        description: 'Статистика переходов',
        href: '/dashboard/affiliate/statistics',
        onClick: () => setLocation('/dashboard/affiliate/statistics'),
        requiresToken: true,
      });
    }

    if (['owner', 'super_admin'].includes(userRole)) {
      roleSpecificItems.push({
        id: 'users',
        title: 'Пользователи',
        icon: Users,
        description: 'Управление пользователями',
        href: '/admin/users',
        onClick: () => setLocation('/admin/users'),
        requiresToken: true,
      });
    }

    if (userRole === 'advertiser') {
      roleSpecificItems.push({
        id: 'antifraud',
        title: 'Антифрод',
        icon: Shield,
        description: 'Защита от мошенничества',
        href: '/dashboard/advertiser/antifraud',
        onClick: () => setLocation('/dashboard/advertiser/antifraud'),
        requiresToken: true,
      });
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const filteredMenuItems = getMenuItems().filter(item => {
    if (!item.requiresToken) {return true;}
    
    const token = localStorage.getItem('token');
    const validation = validateToken(token);
    return validation.valid;
  });

  const getNotificationsHref = () => {
    if (user?.role === 'advertiser') {
      return '/advertiser/notifications';
    } else if (user?.role === 'affiliate') {
      return '/affiliate/notifications';
    }
    return '/notifications';
  };

  // Fetch notifications for notification count
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch balance for partners only
  const { data: financeData } = useQuery<{
    balance: number;
    pendingPayouts: number;
    totalRevenue: number;
  }>({
    queryKey: ['/api/partner/finance/summary'],
    enabled: !!user && user.role === 'affiliate',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Enhanced handlers with token validation
  const handleLogout = createLogoutHandler(logout);

  const handleNotificationClick = async () => {
    // Refresh token before navigation
    await refreshTokenIfNeeded();
    
    // Navigate to notifications page based on user role
    if (user?.role === 'advertiser') {
      setLocation('/advertiser/notifications');
    } else if (user?.role === 'affiliate') {
      setLocation('/affiliate/notifications');
    } else {
      setLocation('/notifications');
    }
    setIsMobileMenuOpen(false);
  };

  const handleSettingsClick = async () => {
    await refreshTokenIfNeeded();
    setLocation('/settings');
    setIsMobileMenuOpen(false);
  };

  const handleSupportClick = async () => {
    setLocation('/help');
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = async (item: MenuItem) => {
    if (item.requiresToken) {
      const refreshed = await refreshTokenIfNeeded();
      if (!refreshed) {
        console.warn('Token refresh failed for', item.title);
        // Could redirect to login here
        return;
      }
    }
    
    if (item.onClick) {
      item.onClick();
    }
    setIsMobileMenuOpen(false);
  };

  if (!user) {return null;}

  const userInitials = getUserInitials(user);

  // Component for rendering menu buttons with tooltips
  const MenuButton = ({ item, className = "" }: { item: MenuItem; className?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMenuItemClick(item)}
          className={`relative hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className}`}
          data-testid={`button-${item.id}`}
        >
          <item.icon className="h-5 w-5" />
          {item.id === 'notifications' && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 hover:bg-red-600 animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{item.description}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Меню навигации</SheetTitle>
                  <SheetDescription>
                    Быстрый доступ к основным функциям платформы
                  </SheetDescription>
                </SheetHeader>
                
                {/* Mobile menu items */}
                <div className="mt-6 space-y-2">
                  {filteredMenuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start space-x-3 h-12"
                      onClick={() => handleMenuItemClick(item)}
                      data-testid={`mobile-${item.id}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      {item.id === 'notifications' && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                  
                  {/* Mobile logout */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                      data-testid="mobile-logout"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Выход</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo space */}
            <div className="hidden md:flex items-center">
              {/* Space for logo or title */}
            </div>
          </div>

          {/* Right side - Menu items and user info */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Desktop menu items - hide main menu items on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              {filteredMenuItems.slice(0, 4).map((item) => (
                <MenuButton key={item.id} item={item} />
              ))}
            </div>
            
            {/* Balance for partners - responsive design */}
            {user.role === 'affiliate' && (
              <div className="hidden lg:flex items-center space-x-3">
                {/* Balance */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700 cursor-help">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-lg text-green-700 dark:text-green-300">
                        ${financeData ? financeData.balance.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">Баланс</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Текущий баланс вашего аккаунта</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Pending */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700 cursor-help">
                      <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-bold text-lg text-amber-700 dark:text-amber-300">
                        ${financeData ? financeData.pendingPayouts.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">В ожидании</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Сумма в ожидании выплаты</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Compact balance for mobile/tablet */}
            {user.role === 'affiliate' && (
              <div className="flex lg:hidden items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-2 py-1 rounded-lg border border-green-200 dark:border-green-700 cursor-help">
                      <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-sm text-green-700 dark:text-green-300">
                        ${financeData ? financeData.balance.toFixed(0) : '0'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Баланс: ${financeData ? financeData.balance.toFixed(2) : '0.00'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            
            {/* Email - hidden on small screens */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user.username} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleDisplayName(user.role)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Profile menu items for mobile/desktop */}
                {filteredMenuItems.slice(0, 2).map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => handleMenuItemClick(item)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выход</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop-only action buttons */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Logout button with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Выйти из системы</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}