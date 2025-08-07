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
            <div className="w-full px-4 py-6" style={{ 
              paddingLeft: '1rem',
              paddingRight: '1rem'
            }}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}