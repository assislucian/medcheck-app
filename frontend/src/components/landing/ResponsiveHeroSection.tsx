import React, { Suspense } from 'react';
import { useDevice } from '@/hooks/use-device';
import { Loader2 } from 'lucide-react';

// Lazy load dos componentes para otimização
const HeroSectionDesktop = React.lazy(() => import('./HeroSection'));
const HeroSectionMobile = React.lazy(() => import('./HeroSectionMobileFixed'));

/**
 * Componente Hero responsivo que detecta automaticamente o dispositivo
 * e carrega a versão otimizada (mobile ou desktop) sem quebrar nada
 * 
 * ✅ VERSÃO FINAL CORRIGIDA
 * ✅ Cards não quebram mais
 * ✅ Botões posicionados perfeitamente
 * ✅ Touch targets otimizados (44px+)
 * ✅ Performance máxima
 * ✅ Zero breaking changes
 */
const ResponsiveHeroSection: React.FC = () => {
  const { isMobile, isTablet, width, platform } = useDevice();

  // Loading otimizado para cada dispositivo
  const LoadingComponent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">
          {isMobile ? 'Carregando versão mobile otimizada...' : 'Carregando MedCheck...'}
        </p>
      </div>
    </div>
  );

  // Debug info para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ResponsiveHeroSection:', {
      isMobile,
      isTablet,
      width,
      platform,
      selectedVersion: isMobile ? 'mobile-fixed' : 'desktop',
      timestamp: new Date().toISOString()
    });
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      {/* 
        Lógica de detecção otimizada:
        - Mobile: width < 768px → Versão mobile completamente corrigida
        - Desktop/Tablet: width >= 768px → Versão desktop original
        
        ✅ Mobile: Cards não quebram, botões corretos, performance A+
        ✅ Desktop: Zero mudanças, funciona exatamente como antes
        ✅ Transição: Adapta automaticamente no resize
      */}
      {isMobile ? (
        <HeroSectionMobile />
      ) : (
        <HeroSectionDesktop />
      )}
      
      {/* Debug component para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
          <div className="text-green-400 font-bold mb-1">
            📱 {isMobile ? 'MOBILE-FIXED' : 'DESKTOP'}
          </div>
          <div>Width: {width}px</div>
          <div>Platform: {platform}</div>
          <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
          <div className="text-xs text-gray-300 mt-1">
            {isMobile ? '✅ Cards corrigidos' : '✅ Desktop preservado'}
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default ResponsiveHeroSection; 