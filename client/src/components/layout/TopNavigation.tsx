import { useState, useEffect } from 'react';
import { Bell, Settings, HelpCircle, LogOut, Mail, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function TopNavigation() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();

  // Force Russian language
  useEffect(() => {
    if (i18n.language !== 'ru') {
      localStorage.setItem('i18nextLng', 'ru');
      i18n.changeLanguage('ru');
    }
  }, [i18n]);

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

  // Debug information - Balance and Pending text are now hardcoded in Russian

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = () => {
    // Navigate to notifications page based on user role
    if (user?.role === 'advertiser') {
      setLocation('/advertiser/notifications');
    } else if (user?.role === 'affiliate') {
      setLocation('/affiliate/notifications');
    }
  };

  const handleSettingsClick = () => {
    // Handle settings click
    console.log('Settings clicked');
  };

  const handleSupportClick = () => {
    // Handle support click
    console.log('Support clicked');
  };

  if (!user) return null;

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user.username[0].toUpperCase();

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo or breadcrumbs can go here */}
        <div className="flex items-center">
          {/* Space for logo or title */}
        </div>

        {/* Right side - User menu items */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Balance for partners - responsive design */}
          {user.role === 'affiliate' && (
            <div className="hidden lg:flex items-center space-x-3">
              {/* Balance */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-bold text-lg text-green-700 dark:text-green-300">
                  ${financeData ? financeData.balance.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">{i18n.language === 'ru' ? 'Баланс' : 'Balance'}</span>
              </div>
              {/* Pending */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-lg text-amber-700 dark:text-amber-300">
                  ${financeData ? financeData.pendingPayouts.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">{i18n.language === 'ru' ? 'В ожидании' : 'Pending'}</span>
              </div>
            </div>
          )}

          {/* Compact balance for mobile/tablet */}
          {user.role === 'affiliate' && (
            <div className="flex lg:hidden items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-2 py-1 rounded-lg border border-green-200 dark:border-green-700">
                <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="font-bold text-sm text-green-700 dark:text-green-300">
                  ${financeData ? financeData.balance.toFixed(0) : '0'}
                </span>
              </div>
            </div>
          )}
          
          {/* Email */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
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
                    {user.role === 'affiliate' ? 'Партнёр' : user.role === 'advertiser' ? 'Рекламодатель' : user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Профиль</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={handleNotificationClick}
            title={`Уведомления${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
            data-testid="button-notifications"
          >
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 hover:bg-red-600 animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            title="Настройки"
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Support */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSupportClick}
            title="Поддержка"
            data-testid="button-support"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Выход"
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}