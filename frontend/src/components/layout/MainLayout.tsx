import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../sidebar/AppSidebar";
import GlobalHeader from "./GlobalHeader";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showSideNav?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function MainLayout({
  children,
  title,
  description,
  showSideNav = true,
  isLoading = false,
  loadingMessage,
}: MainLayoutProps) {
  return (
    <>
      <Helmet>
        <title>MedCheck</title>
        {/* Mantém SEO, mas não renderiza título/descrição visualmente */}
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
          {showSideNav && <AppSidebar />}
          <main className="ml-[272px] bg-neutral-50 min-h-screen px-8 py-6 overflow-y-auto">
            <GlobalHeader actions={<SidebarTrigger />} />
            <div className="pt-2">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
