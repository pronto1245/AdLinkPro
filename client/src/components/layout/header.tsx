import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, HelpCircle, LogOut, User, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { getUserDisplayName, getUserInitials, createLogoutHandler } from '@/lib/navigation-utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  
  const handleLogout = createLogoutHandler(logout);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden text-slate-600">
            <i className="fas fa-bars w-6 h-6"></i>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t(title)}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(subtitle)}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Language Switcher */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px] text-sm border-0 bg-transparent" data-testid="language-switcher">
              <SelectValue placeholder={t('language.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 {t('language.english')}</SelectItem>
              <SelectItem value="ru">🇷🇺 {t('language.russian')}</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* Live Traffic Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700" data-testid="live-traffic">247 online</span>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-slate-100 p-2 rounded-lg" data-testid="user-profile-menu">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getUserInitials(user)}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Settings className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{getUserDisplayName(user)}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t('common.profile', 'Профиль')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('common.settings', 'Настройки')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" data-testid="menu-help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t('navigation.help')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout} data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('common.logout', 'Выход')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {children}
        </div>
      </div>
    </header>
  );
}
