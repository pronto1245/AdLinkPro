import { useState } from 'react';
import { Settings, LogOut, Mail, User, Globe, DollarSign } from 'lucide-react';
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
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useQuery } from '@tanstack/react-query';

export function PartnerTopNavigation() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Fetch balance for partners
  const { data: financeData, isLoading } = useQuery<{
    balance: number;
    pendingPayouts: number;
    totalRevenue: number;
    avgEPC: number;
    avgCR: number;
    totalPayouts: number;
  }>({
    queryKey: ['/api/partner/finance/summary'],
    enabled: !!user && user.role === 'affiliate',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = () => {
    logout();
  };



  const handleSettings = () => {
    // Navigate to settings page
    window.location.href = '/affiliate/settings';
  };

  const handleProfile = () => {
    // Navigate to profile page
    window.location.href = '/affiliate/profile';
  };

  if (!user) return null;

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user.username[0].toUpperCase();

  return (
    <header className="border-b bg-card dark:bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Breadcrumbs or title can go here */}
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">{t('navigation.dashboard')}</h2>
        </div>

        {/* Right side - Navigation items */}
        <div className="flex items-center space-x-3">
          {/* Balance Display */}
          {user.role === 'affiliate' && (
            <div className="hidden md:flex items-center space-x-3">
              {/* Current Balance */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" title={t('finances.currentBalance')}>
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-5 bg-green-200 dark:bg-green-700 rounded animate-pulse"></div>
                    <span className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">{t('common.loading')}</span>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-lg text-green-700 dark:text-green-300">
                      ${financeData ? financeData.balance.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">{t('common.balance')}</span>
                  </>
                )}
              </div>

              {/* Pending Amount */}
              {financeData && financeData.pendingPayouts > 0 && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" title={t('finances.pendingPayouts')}>
                  <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-lg text-orange-700 dark:text-orange-300">
                    ${financeData.pendingPayouts.toFixed(2)}
                  </span>
                  <span className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">{t('common.pending')}</span>
                </div>
              )}
            </div>
          )}

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Email Display */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full" 
                data-testid="button-user-menu"
                title={t('common.profile')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt={user.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
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
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleProfile} data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t('common.profile')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSettings} data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('common.settings')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive focus:text-destructive"
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('common.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}