import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isOverlay: boolean;
  isStatic: boolean;
  isCollapsed: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleCollapse: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isOverlay, setIsOverlay] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Detectar se está em modo mobile/overlay
  useEffect(() => {
    const checkOverlay = () => {
      setIsOverlay(window.innerWidth < 1024); // lg breakpoint
    };

    checkOverlay();
    window.addEventListener('resize', checkOverlay);
    
    return () => window.removeEventListener('resize', checkOverlay);
  }, []);

  // Escutar evento de fechar sidebar (para mobile overlay)
  useEffect(() => {
    const handleCloseSidebar = () => {
      if (isOverlay) {
        setIsOpen(false);
      }
    };

    window.addEventListener('closeSidebar', handleCloseSidebar);
    
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, [isOverlay]);

  const isStatic = !isOverlay && isOpen;

  const toggleSidebar = () => {
    if (isOverlay) {
      // Em dispositivos móveis alterna exibição overlay
      setIsOpen(!isOpen);
    } else {
      // Em desktop alterna colapso/expansão
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const value: SidebarContextType = {
    isOverlay,
    isStatic,
    isCollapsed,
    isOpen,
    setIsOpen,
    toggleCollapse,
    toggleSidebar,
  };

  // Sincronizar largura da sidebar via CSS var
  useEffect(() => {
    if (!isOverlay) {
      const root = document.documentElement;
      if (isCollapsed) {
        root.style.setProperty('--sidebar-width', '72px');
      } else {
        root.style.setProperty('--sidebar-width', '256px');
      }
    }
  }, [isCollapsed, isOverlay]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
} 