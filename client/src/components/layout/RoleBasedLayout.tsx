import React, { useState, useEffect } from "react";
import UniversalSidebar from "./UniversalSidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { Menu } from "lucide-react";

export default function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { collapsed: _collapsed, sidebarWidth } = useSidebar();
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      const newIsLargeScreen = window.innerWidth >= 1024;
      setIsLargeScreen(newIsLargeScreen);
      
      // Close mobile menu when switching to large screen
      if (newIsLargeScreen && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside or on navigation
  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <UniversalSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity" 
            onClick={handleCloseMobileMenu}
          />
          <div className="relative">
            <UniversalSidebar 
              isMobile={true} 
              onClose={handleCloseMobileMenu} 
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isLargeScreen ? "ml-0" : "ml-0"
        )}
        style={{
          marginLeft: isLargeScreen ? `${sidebarWidth}px` : '0px'
        }}
      >
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Открыть меню"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">AdLinkPro</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
