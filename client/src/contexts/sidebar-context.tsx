import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  sidebarWidth: number; // Ширина сайдбара в пикселях
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Восстанавливаем состояние из localStorage после монтирования
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved) {
        setCollapsed(JSON.parse(saved));
      }
    }
  }, []);

  // Сохраняем состояние в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const sidebarWidth = collapsed ? 64 : 256; // 16rem = 256px, 4rem = 64px

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, setCollapsed, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
