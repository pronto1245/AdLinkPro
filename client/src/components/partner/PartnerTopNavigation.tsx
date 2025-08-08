import { useState } from 'react';
import { Settings, LogOut, Mail, User, Globe } from 'lucide-react';
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
import { useLanguage } from '@/contexts/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function PartnerTopNavigation() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
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
          <h2 className="text-lg font-semibold text-foreground">Партнёрская панель</h2>
        </div>

        {/* Right side - Navigation items */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageChange}
            className="h-8 px-3 text-sm font-medium"
            title={language === 'en' ? 'Переключить на русский' : 'Switch to English'}
            data-testid="button-language-toggle"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language.toUpperCase()}
          </Button>

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
                title="Профиль пользователя"
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
                <span>Профиль</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSettings} data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive focus:text-destructive"
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выход</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}