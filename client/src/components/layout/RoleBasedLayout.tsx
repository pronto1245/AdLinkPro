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
  const { collapsed, sidebarWidth } = useSidebar();
  
  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {user.role === 'advertiser' && <AdvertiserSidebar key={`sidebar-${user.id}`} />}
      {user.role === 'affiliate' && <AffiliateSidebar key={`sidebar-${user.id}`} />}
      <main 
        className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
          maxWidth: `calc(100vw - ${sidebarWidth}px)`
        } as React.CSSProperties}
      >
        <div className={cn(
          "p-6",
          collapsed ? "max-w-full" : "max-w-full"
        )}>
          <div className={cn(
            "mx-auto transition-all duration-300",
            collapsed ? "max-w-7xl" : "max-w-6xl"
          )}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}