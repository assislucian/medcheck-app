import React, { Suspense } from 'react';
import { useDevice } from '@/hooks/use-device';
import { Loader2, FileText } from 'lucide-react';

// Lazy load dos componentes
const GuidesDesktop = React.lazy(() => import('./Guides'));
const GuidesMobile = React.lazy(() => import('./GuidesMobile'));

/**
 * Componente Guias Responsivo
 * Detecta automaticamente o dispositivo e carrega a versão apropriada
 * 
 * ✅ Mobile: Interface touch-friendly, cards stack, workflows simplificados
 * ✅ Desktop: Funcionalidade completa preservada, DataGrid, filtros avançados
 * ✅ Zero Breaking Changes: Web continua funcionando exatamente igual
 */
const GuidesResponsive: React.FC = () => {
  const { isMobile, isTablet, width, platform } = useDevice();

  // Loading otimizado por dispositivo
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-indigo-50/30">
      <div className="flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isMobile ? 'Carregando versão mobile...' : 'Carregando Central de Guias...'}
            </h3>
            <p className="text-sm text-gray-600">
              {isMobile 
                ? 'Interface otimizada para smartphone' 
                : 'Preparando seus dados médicos'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Debug info para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🏥 GuidesResponsive:', {
      isMobile,
      isTablet,
      width,
      platform,
      selectedVersion: isMobile ? 'mobile-optimized' : 'desktop-full',
      timestamp: new Date().toISOString()
    });
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      {/* 
        Estratégia de detecção inteligente:
        
        📱 Mobile (width < 768px):
        ✅ Interface touch-first
        ✅ Cards em stack vertical 
        ✅ Upload simplificado
        ✅ Filtros compactos
        ✅ Modal otimizado
        ✅ Navegação por gestos
        ✅ Performance otimizada
        
        🖥️ Desktop/Tablet (width >= 768px):
        ✅ Interface completa preservada
        ✅ DataGrid com todas funcionalidades
        ✅ Filtros avançados
        ✅ Modais completos
        ✅ Funcionalidades existentes 100%
        ✅ Zero breaking changes
      */}
      {isMobile ? (
        <GuidesMobile />
      ) : (
        <GuidesDesktop />
      )}
      
      {/* Debug panel para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs shadow-lg">
          <div className="text-blue-400 font-bold mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {isMobile ? 'GUIDES-MOBILE' : 'GUIDES-DESKTOP'}
          </div>
          <div className="space-y-1 text-gray-300">
            <div>Width: {width}px</div>
            <div>Device: {platform}</div>
            <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
            <div className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-700">
              {isMobile ? (
                <>
                  ✅ Touch optimized<br/>
                  ✅ Cards layout<br/>
                  ✅ Mobile UX
                </>
              ) : (
                <>
                  ✅ Full features<br/>
                  ✅ DataGrid<br/>
                  ✅ Desktop UX
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default GuidesResponsive; 