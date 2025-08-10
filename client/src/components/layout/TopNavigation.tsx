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

export function TopNavigation() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);

  // Force Russian language
  useEffect(() => {
    if (i18n.language !== 'ru') {
      localStorage.setItem('i18nextLng', 'ru');
      i18n.changeLanguage('ru');
    }
  }, [i18n]);

  // Debug information
  useEffect(() => {
    console.log('TopNavigation Debug:', {
      userRole: user?.role,
      isAffiliate: user?.role === 'affiliate',
      financeData,
      language: i18n.language
    });
  }, [user, financeData, i18n.language]);

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

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = () => {
    // Handle notification click
    console.log('Notifications clicked');
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
          
          {/* Balance for partners */}
          {user.role === 'affiliate' && (
            <div className="flex items-center space-x-3">
              {/* Balance */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-bold text-lg text-green-700 dark:text-green-300">
                  ${financeData ? financeData.balance.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">Баланс</span>
              </div>
              {/* Pending */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-700">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-lg text-amber-700 dark:text-amber-300">
                  ${financeData ? financeData.pendingPayouts.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">В ожидании</span>
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
                    {t(user.role)}
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
            className="relative"
            onClick={handleNotificationClick}
            title="Уведомления"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationCount}
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