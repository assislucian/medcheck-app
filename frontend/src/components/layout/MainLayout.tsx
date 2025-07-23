import { useEffect, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../sidebar/AppSidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import GlobalSearch from '../ui/GlobalSearch';
import QuickActions from '../ui/QuickActions';
import { useAuth } from '../../contexts/auth/AuthContext';
import { UserMenu } from '../navbar/UserMenu';
import { AuthFooter } from './AuthFooter';

import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  title?: string;
  description?: string;
  showSideNav?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  children?: ReactNode;
}

export function MainLayout({
  title,
  description,
  showSideNav = true,
  isLoading = false,
  loadingMessage = 'Carregando...',
  children,
}: MainLayoutProps) {
  const { isOpen, isOverlay } = useSidebarContext();
  const { user, userProfile, logout } = useAuth();

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

  // Consolidar dados do usuário - prioriza userProfile, fallback para user
  const currentUser = userProfile || user;
  const displayName = currentUser?.name || currentUser?.nome || 'Usuário';
  const displayEmail = currentUser?.email || 'Email não informado';
  const displayCRM = currentUser?.crm || user?.crm;
  const displayUF = currentUser?.uf || user?.uf;
  const displaySpecialty = currentUser?.specialty || 'Especialidade não informada';
  const displayAvatarUrl = currentUser?.avatarUrl;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {showSideNav && <AppSidebar />}

        {/* Main Content Area */}
        <div
          className={`
            flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out
            ${
              !showSideNav
                ? 'ml-0'
                : isOverlay
                  ? 'ml-0'
                  : isOpen
                    ? 'ml-[280px]'
                    : 'ml-[70px]'
            }
          `}
        >
          {/* Header Clean e Otimizado */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 dark:bg-gray-900/95 dark:border-gray-700/50">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Breadcrumbs minimalistas */}
              <div className="flex items-center flex-1">
                <Breadcrumbs />
              </div>

              {/* Actions do usuário - simplificadas */}
              <div className="flex items-center space-x-4">
                <GlobalSearch className="hidden sm:flex" />

                {/* UserMenu Premium */}
                {currentUser && (
                  <UserMenu
                    name={displayName}
                    email={displayEmail}
                    specialty={displaySpecialty}
                    crm={displayCRM}
                    uf={displayUF}
                    avatarUrl={displayAvatarUrl}
                    onLogout={logout}
                  />
                )}
              </div>
            </div>
          </header>

          {/* Page Content com espaçamento otimizado */}
          <main className="flex-1 bg-gray-50/30 dark:bg-gray-950/50">
            <div className="p-6">
              {/* Renderizar children se fornecido, senão usar Outlet para rotas */}
              {children || <Outlet />}
            </div>
          </main>

          {/* Footer Natural (não-fixo) */}
          <AuthFooter />
        </div>
      </div>

      {/* Floating Action Button */}
      {showSideNav && <QuickActions />}

      {/* Mobile Overlay com backdrop melhorado */}
      {showSideNav && isOverlay && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => {
            const event = new CustomEvent('closeSidebar');
            window.dispatchEvent(event);
          }}
        />
      )}
    </div>
  );
}
