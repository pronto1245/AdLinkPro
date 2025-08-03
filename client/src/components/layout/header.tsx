import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden text-slate-600">
            <i className="fas fa-bars w-6 h-6"></i>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t(title)}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600">{t(subtitle)}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px] text-sm border-0 bg-transparent" data-testid="language-switcher">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="ru">🇷🇺 Русский</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-slate-600 hover:text-slate-900" data-testid="button-notifications">
            <i className="fas fa-bell w-5 h-5"></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* Live Traffic Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700" data-testid="live-traffic">247 online</span>
          </div>

          {children}
        </div>
      </div>
    </header>
  );
}
