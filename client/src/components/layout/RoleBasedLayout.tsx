import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import AdvertiserSidebar from './AdvertiserSidebar';
import AffiliateSidebar from './AffiliateSidebar';
import { TopNavigation } from './TopNavigation';

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {user.role === 'advertiser' && <AdvertiserSidebar key={`sidebar-${user.id}`} />}
        {user.role === 'affiliate' && <AffiliateSidebar key={`sidebar-${user.id}`} />}
        <main 
          className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
          style={{
            '--sidebar-width': `${sidebarWidth}px`,
            width: `calc(100vw - ${sidebarWidth}px)`,
            maxWidth: `calc(100vw - ${sidebarWidth}px)`
          } as React.CSSProperties}
        >
          <div className="w-full h-full">
            <div 
              className={cn(
                "w-full py-6",
                user.role === 'affiliate' ? 'px-8' : 'px-4'
              )} 
              style={{ 
                paddingLeft: user.role === 'affiliate' ? '2rem' : '1rem',
                paddingRight: user.role === 'affiliate' ? '2rem' : '1rem'
              }}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}