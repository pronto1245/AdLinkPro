import { useAuth } from '@/contexts/auth-context';
import AdvertiserSidebar from './AdvertiserSidebar';
import AffiliateSidebar from './AffiliateSidebar';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();

  const renderSidebar = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'advertiser':
        return <AdvertiserSidebar />;
      case 'affiliate':
        return <AffiliateSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {renderSidebar()}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}