import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { MainLayout } from './MainLayout';
import { SidebarProvider } from '../../contexts/SidebarContext';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  requireAuth?: boolean;
  showSidebar?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function AuthenticatedLayout({
  children,
  title,
  description,
  requireAuth = true,
  showSidebar = true,
  isLoading = false,
  loadingMessage,
}: AuthenticatedLayoutProps) {
  const { session, loading } = useAuth();

  // Se a autenticação é necessária e o usuário não está autenticado, redirecione para o login
  if (requireAuth && !loading && !session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <MainLayout
        title={title}
        description={description}
        showSideNav={showSidebar}
        isLoading={loading || isLoading}
        loadingMessage={loadingMessage}
      >
        {children}
      </MainLayout>
    </SidebarProvider>
  );
}
