import React, { Suspense } from 'react';
import { useDevice } from '@/hooks/use-device';
import { Loader2 } from 'lucide-react';

interface ResponsiveRouteProps {
  // Componentes específicos para cada dispositivo
  mobileComponent?: React.ComponentType<any>;
  tabletComponent?: React.ComponentType<any>;
  desktopComponent?: React.ComponentType<any>;
  // Componente padrão (fallback)
  defaultComponent: React.ComponentType<any>;
  // Props a serem passadas para o componente
  componentProps?: any;
  // Loading customizado
  loadingComponent?: React.ComponentType;
  // Forçar uma versão específica (para testes)
  forceDevice?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Componente de rota responsiva que detecta automaticamente o dispositivo
 * e carrega o componente apropriado
 */
export function ResponsiveRoute({
  mobileComponent,
  tabletComponent,
  desktopComponent,
  defaultComponent,
  componentProps = {},
  loadingComponent: LoadingComponent,
  forceDevice,
}: ResponsiveRouteProps) {
  const { isMobile, isTablet, isDesktop } = useDevice();

  // Determinar qual componente usar
  let ComponentToRender = defaultComponent;
  
  if (forceDevice) {
    // Modo de teste - forçar dispositivo específico
    if (forceDevice === 'mobile' && mobileComponent) {
      ComponentToRender = mobileComponent;
    } else if (forceDevice === 'tablet' && tabletComponent) {
      ComponentToRender = tabletComponent;
    } else if (forceDevice === 'desktop' && desktopComponent) {
      ComponentToRender = desktopComponent;
    }
  } else {
    // Detecção automática
    if (isMobile && mobileComponent) {
      ComponentToRender = mobileComponent;
    } else if (isTablet && tabletComponent) {
      ComponentToRender = tabletComponent;
    } else if (isDesktop && desktopComponent) {
      ComponentToRender = desktopComponent;
    }
  }

  // Loading padrão
  const DefaultLoading = LoadingComponent || (() => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  ));

  return (
    <Suspense fallback={<DefaultLoading />}>
      <ComponentToRender {...componentProps} />
    </Suspense>
  );
}

/**
 * Hook para criar rotas responsivas facilmente
 */
export function useResponsiveRoute() {
  const { isMobile, isTablet, isDesktop } = useDevice();

  return {
    isMobile,
    isTablet,
    isDesktop,
    // Helper para renderização condicional
    renderForDevice: (components: {
      mobile?: React.ReactNode;
      tablet?: React.ReactNode;
      desktop?: React.ReactNode;
      fallback?: React.ReactNode;
    }) => {
      if (isMobile && components.mobile) return components.mobile;
      if (isTablet && components.tablet) return components.tablet;
      if (isDesktop && components.desktop) return components.desktop;
      return components.fallback || null;
    },
  };
}

/**
 * Higher-Order Component para criar versões responsivas de páginas
 */
export function withResponsiveRouting<T = {}>(
  mobileComponent?: React.ComponentType<T>,
  tabletComponent?: React.ComponentType<T>,
  desktopComponent?: React.ComponentType<T>
) {
  return function ResponsiveWrapper(props: T) {
    const { isMobile, isTablet, isDesktop } = useDevice();

    // Prioridade: Mobile > Tablet > Desktop
    if (isMobile && mobileComponent) {
      const MobileComponent = mobileComponent;
      return <MobileComponent {...props} />;
    }
    
    if (isTablet && tabletComponent) {
      const TabletComponent = tabletComponent;
      return <TabletComponent {...props} />;
    }
    
    if (desktopComponent) {
      const DesktopComponent = desktopComponent;
      return <DesktopComponent {...props} />;
    }

    // Fallback - usar primeiro componente disponível
    const FallbackComponent = mobileComponent || tabletComponent || desktopComponent;
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }

    // Se nenhum componente foi fornecido, erro de desenvolvimento
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Erro: Nenhum componente foi fornecido para esta rota responsiva</p>
      </div>
    );
  };
}

/**
 * Componente para debug de responsividade
 */
export function ResponsiveDebugInfo() {
  const { isMobile, isTablet, isDesktop, width, height, orientation, platform } = useDevice();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>📱 Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
      <div>📐 Size: {width}x{height}</div>
      <div>🔄 Orientation: {orientation}</div>
      <div>💻 Platform: {platform}</div>
    </div>
  );
}

// Componentes lazy para demonstração
export const createLazyResponsiveComponents = () => {
  // Lazy loading para otimização
  const LazyDemonstrativesMobile = React.lazy(() => 
    import('../pages/mobile/DemonstrativesMobile').then(module => ({
      default: module.DemonstrativesMobile
    })).catch(() => ({ 
      default: () => <div>Componente mobile não encontrado</div> 
    }))
  );

  const LazyDemonstrativesTablet = React.lazy(() => 
    import('../pages/tablet/DemonstrativesTablet').then(module => ({
      default: module.DemonstrativesTablet
    })).catch(() => ({ 
      default: () => <div>Componente tablet não encontrado</div> 
    }))
  );

  const LazyDemonstrativesDesktop = React.lazy(() => 
    import('../pages/Demonstratives').then(module => ({
      default: module.default
    })).catch(() => ({ 
      default: () => <div>Componente desktop não encontrado</div> 
    }))
  );

  return {
    LazyDemonstrativesMobile,
    LazyDemonstrativesTablet,
    LazyDemonstrativesDesktop,
  };
};

/**
 * Exemplo de uso com as páginas existentes
 */
export function ResponsiveDemonstrativesRoute() {
  const { LazyDemonstrativesDesktop } = createLazyResponsiveComponents();
  
  // Por enquanto, usar apenas a versão responsiva única
  const DemonstrativesResponsive = React.lazy(() => 
    import('../../pages/DemonstrativesResponsive').then(module => ({
      default: module.default
    }))
  );

  return (
    <ResponsiveRoute
      defaultComponent={DemonstrativesResponsive}
      desktopComponent={LazyDemonstrativesDesktop}
      loadingComponent={() => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Carregando Demonstrativos...</p>
          </div>
        </div>
      )}
    />
  );
} 