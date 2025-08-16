import { useAuth } from '../contexts/auth-context';
import { useSidebar } from '../contexts/sidebar-context';
import { cn } from '../../lib/utils';
import AdvertiserSidebar from './AdvertiserSidebar';
import AffiliateSidebar from './AffiliateSidebar';
import { TopNavigation } from './TopNavigation';
import { useState, useEffect } from 'react';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user } = useAuth();
  const { collapsed, sidebarWidth } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Загрузка...</div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out z-50",
          isMobile ? "absolute inset-y-0 left-0" : "relative",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}>
          {user.role === 'advertiser' && (
            <AdvertiserSidebar 
              key={`sidebar-${user.id}`} 
              isMobile={isMobile}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          {user.role === 'affiliate' && (
            <AffiliateSidebar 
              key={`sidebar-${user.id}`} 
              isMobile={isMobile}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : ""
          )}
          style={!isMobile ? {
            '--sidebar-width': `${sidebarWidth}px`,
            width: `calc(100vw - ${sidebarWidth}px)`,
            maxWidth: `calc(100vw - ${sidebarWidth}px)`
          } as React.CSSProperties : {}}
        >
          <div className="w-full h-full">
            <div 
              className={cn(
                "w-full py-4 px-4",
                // Responsive padding
                "sm:py-6",
                !isMobile && user.role === 'affiliate' && "sm:px-8 lg:px-12"
              )}
            >
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mb-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm md:hidden"
                  data-testid="button-mobile-menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}