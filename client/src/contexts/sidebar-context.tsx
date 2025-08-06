import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    // Восстанавливаем состояние из localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, setCollapsed }}>
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