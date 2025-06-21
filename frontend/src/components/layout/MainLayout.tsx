import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { AppSidebar } from "../sidebar/AppSidebar";
import GlobalHeader from "./GlobalHeader";
import { SidebarProvider, useSidebarContext } from "../../contexts/SidebarContext";
import { SidebarTriggerWrapper } from "../ui/SidebarTriggerWrapper";
import { AppTour } from "../tour/AppTour";

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
        
        {/* Overlay para mobile quando sidebar está aberta */}
        {isOverlay && isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => {
              // Fechar sidebar ao clicar no overlay
              const event = new CustomEvent('closeSidebar');
              window.dispatchEvent(event);
            }}
          />
        )}
        
        <main 
          className={`flex-1 min-w-0 bg-background overflow-y-auto sidebar-offset ${
            isStatic ? 'static' : ''
          }`}
        >
          <div className="page-shell">
            <GlobalHeader actions={<SidebarTriggerWrapper />} />
            <div className="content-layout px-4 md:px-8 max-w-7xl mx-auto w-full">
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
