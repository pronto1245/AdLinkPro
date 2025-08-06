import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import AdvertiserSidebar from './AdvertiserSidebar';
import AffiliateSidebar from './AffiliateSidebar';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  
  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {user.role === 'advertiser' && <AdvertiserSidebar key={`sidebar-${user.id}`} />}
      {user.role === 'affiliate' && <AffiliateSidebar key={`sidebar-${user.id}`} />}
      <main 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          collapsed ? "ml-0" : "ml-0" // Контент автоматически адаптируется благодаря flex
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}