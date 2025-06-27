import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppSidebar } from '../sidebar/AppSidebar';
import GlobalHeader from './GlobalHeader';
import { SidebarProvider, useSidebarContext } from '../../contexts/SidebarContext';
import { SidebarTriggerWrapper } from '../ui/SidebarTriggerWrapper';
import { AppTour } from '../tour/AppTour';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showSideNav?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

function MainLayoutContent({
  children,
  title,
  description,
  showSideNav = true,
  isLoading = false,
  loadingMessage,
}: MainLayoutProps) {
  const { isStatic, isOverlay, isOpen } = useSidebarContext();

  return (
    <>
      <Helmet>
        <title>MedCheck</title>
        {/* Mantém SEO, mas não renderiza título/descrição visualmente */}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white/90 to-green-50/80 backdrop-blur-md flex relative">
        {showSideNav && <AppSidebar />}
        <AppTour />

        {/* Overlay melhorado para mobile quando sidebar está aberta */}
        {isOverlay && isOpen && (
          <div
            className="fixed inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/5 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => {
              // Fechar sidebar ao clicar no overlay
              const event = new CustomEvent('closeSidebar');
              window.dispatchEvent(event);
            }}
            style={{
              animation: 'fadeIn 0.3s ease-out',
            }}
          />
        )}

        <main
          className={`flex-1 min-w-0 bg-background/95 backdrop-blur-sm overflow-y-auto sidebar-offset transition-all duration-300 ease-out ${
            isStatic ? 'static' : ''
          } ${isOverlay && isOpen ? 'transform scale-[0.98] rounded-l-2xl' : ''}`}
        >
          <div className="page-shell">
            <GlobalHeader actions={<SidebarTriggerWrapper />} />
            <div className="content-layout px-3 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export function MainLayout(props: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutContent {...props} />
    </SidebarProvider>
  );
}
