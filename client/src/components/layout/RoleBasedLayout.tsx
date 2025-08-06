import { useAuth } from '@/contexts/auth-context';
import AdvertiserSidebar from './AdvertiserSidebar';
import AffiliateSidebar from './AffiliateSidebar';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {user.role === 'advertiser' && <AdvertiserSidebar key={`sidebar-${user.id}`} />}
      {user.role === 'affiliate' && <AffiliateSidebar key={`sidebar-${user.id}`} />}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}