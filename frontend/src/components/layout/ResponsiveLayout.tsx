import React from 'react';
import { useDevice } from '@/hooks/use-device';
import { AuthenticatedLayout } from './AuthenticatedLayout';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  mobileTitle?: string; // Título otimizado para mobile
  mobileDescription?: string; // Descrição otimizada para mobile
  showMobileActions?: boolean;
  mobileActions?: React.ReactNode;
  desktopClassName?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  // Configurações de comportamento mobile
  mobileScrollBehavior?: 'normal' | 'sticky-header' | 'pull-to-refresh';
  mobileGestureEnabled?: boolean;
}

/**
 * Layout responsivo inteligente que adapta automaticamente para diferentes dispositivos
 * Baseado nas melhores práticas das top webapps do mundo
 */
export function ResponsiveLayout({
  children,
  title,
  description,
  mobileTitle,
  mobileDescription,
  showMobileActions = false,
  mobileActions,
  desktopClassName,
  mobileClassName,
  tabletClassName,
  mobileScrollBehavior = 'normal',
  mobileGestureEnabled = true,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, isDesktop, orientation, platform } = useDevice();

  // Adaptar título e descrição para o dispositivo
  const adaptedTitle = isMobile && mobileTitle ? mobileTitle : title;
  const adaptedDescription = isMobile && mobileDescription ? mobileDescription : description;

  // Classes condicionais baseadas no dispositivo
  const deviceClasses = cn(
    // Base classes
    'min-h-screen transition-all duration-300',
    
    // Device-specific classes
    isMobile && [
      'mobile-layout',
      mobileClassName,
      // iOS specific optimizations
      platform === 'ios' && 'ios-optimized',
      // Android specific optimizations  
      platform === 'android' && 'android-optimized',
      // Orientation handling
      orientation === 'landscape' && 'landscape-mobile',
    ],
    
    isTablet && [
      'tablet-layout',
      tabletClassName,
      orientation === 'portrait' && 'tablet-portrait',
      orientation === 'landscape' && 'tablet-landscape',
    ],
    
    isDesktop && [
      'desktop-layout',
      desktopClassName,
    ]
  );

  // Mobile-specific wrapper
  if (isMobile) {
    return (
      <div className={deviceClasses}>
        <AuthenticatedLayout
          title={adaptedTitle}
          description={adaptedDescription}
        >
          {/* Mobile-optimized container */}
          <div className={cn(
            'mobile-container',
            // Padding otimizado para mobile
            'px-4 py-3',
            // Scroll behavior
            mobileScrollBehavior === 'sticky-header' && 'mobile-sticky-header',
            mobileScrollBehavior === 'pull-to-refresh' && 'mobile-pull-refresh',
            // Gesture support
            mobileGestureEnabled && 'mobile-gestures-enabled'
          )}>
            {/* Mobile actions bar */}
            {showMobileActions && mobileActions && (
              <div className="mobile-actions-bar sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 -mx-4 px-4 py-2 mb-4">
                {mobileActions}
              </div>
            )}
            
            {/* Main content with mobile optimizations */}
            <div className="mobile-content space-y-4">
              {children}
            </div>
          </div>
        </AuthenticatedLayout>
      </div>
    );
  }

  // Tablet-specific wrapper
  if (isTablet) {
    return (
      <div className={deviceClasses}>
        <AuthenticatedLayout
          title={adaptedTitle}
          description={adaptedDescription}
        >
          <div className={cn(
            'tablet-container',
            'px-6 py-4',
            // Otimizações para tablet
            orientation === 'portrait' && 'tablet-portrait-container',
            orientation === 'landscape' && 'tablet-landscape-container'
          )}>
            {children}
          </div>
        </AuthenticatedLayout>
      </div>
    );
  }

  // Desktop - layout padrão
  return (
    <div className={deviceClasses}>
      <AuthenticatedLayout
        title={adaptedTitle}
        description={adaptedDescription}
      >
        <div className={cn('desktop-container', 'px-8 py-6')}>
          {children}
        </div>
      </AuthenticatedLayout>
    </div>
  );
}

/**
 * Hook para obter classes CSS responsivas baseadas no dispositivo
 */
export function useResponsiveClasses() {
  const { isMobile, isTablet, isDesktop, orientation } = useDevice();

  return {
    // Container classes
    container: cn(
      isMobile && 'px-4 py-3',
      isTablet && 'px-6 py-4',
      isDesktop && 'px-8 py-6'
    ),
    
    // Grid classes
    grid: cn(
      'grid gap-4',
      isMobile && 'grid-cols-1',
      isTablet && orientation === 'portrait' && 'grid-cols-1 md:grid-cols-2',
      isTablet && orientation === 'landscape' && 'grid-cols-2 lg:grid-cols-3',
      isDesktop && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    ),
    
    // Card classes
    card: cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      isMobile && 'p-4',
      isTablet && 'p-5',
      isDesktop && 'p-6'
    ),
    
    // Text classes
    title: cn(
      'font-semibold leading-none tracking-tight',
      isMobile && 'text-lg',
      isTablet && 'text-xl',
      isDesktop && 'text-2xl'
    ),
    
    // Button classes
    button: cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      isMobile && 'h-9 px-3 text-sm',
      isTablet && 'h-10 px-4 text-sm',
      isDesktop && 'h-10 px-4 py-2'
    ),
    
    // Spacing classes
    spacing: cn(
      isMobile && 'space-y-3',
      isTablet && 'space-y-4',
      isDesktop && 'space-y-6'
    ),
  };
}

/**
 * Componente para renderização condicional baseada no dispositivo
 */
interface DeviceRenderProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function DeviceRender({ mobile, tablet, desktop, fallback }: DeviceRenderProps) {
  const { isMobile, isTablet, isDesktop } = useDevice();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  
  return <>{fallback}</>;
}

/**
 * Componente de container responsivo reutilizável
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function ResponsiveContainer({
  children,
  className,
  spacing = 'normal',
  maxWidth = 'full',
}: ResponsiveContainerProps) {
  const { container, spacing: deviceSpacing } = useResponsiveClasses();

  const spacingClasses = {
    compact: 'space-y-2',
    normal: deviceSpacing,
    relaxed: 'space-y-8',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      container,
      spacingClasses[spacing],
      maxWidthClasses[maxWidth],
      'mx-auto',
      className
    )}>
      {children}
    </div>
  );
} 