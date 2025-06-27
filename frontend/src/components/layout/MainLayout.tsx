import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../sidebar/AppSidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import GlobalSearch from '../ui/GlobalSearch';
import QuickActions from '../ui/QuickActions';
import { useAuth } from '../../contexts/auth/AuthContext';

export function MainLayout() {
  const { isOpen, isOverlay } = useSidebarContext();
  const { user } = useAuth();

  useEffect(() => {
    // Definir variáveis CSS para o layout responsivo
    const updateLayoutVariables = () => {
      const root = document.documentElement;

      if (isOverlay) {
        // Mobile: sidebar overlay
        root.style.setProperty('--sidebar-width', '0px');
      } else {
        // Desktop: sidebar fixa
        root.style.setProperty('--sidebar-width', isOpen ? '280px' : '70px');
      }
    };

    updateLayoutVariables();
  }, [isOpen, isOverlay]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div
          className={`
            flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out
            ${isOverlay ? 'ml-0' : isOpen ? 'ml-[280px]' : 'ml-[70px]'}
          `}
        >
          {/* Header com Breadcrumbs e Busca */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-4 flex-1">
                <Breadcrumbs />
              </div>

              {/* Search e User Actions */}
              <div className="flex items-center space-x-4">
                <GlobalSearch className="hidden sm:flex" />

                {/* User info (opcional) */}
                {user && (
                  <div className="hidden lg:flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">Olá,</span>
                    <span className="font-medium">
                      {user.user_metadata?.nome_completo || user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-muted/5">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <QuickActions />

      {/* Mobile Overlay */}
      {isOverlay && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => {
            const event = new CustomEvent('closeSidebar');
            window.dispatchEvent(event);
          }}
        />
      )}
    </div>
  );
}
