import { useState, useEffect } from 'react';

// Breakpoints customizados para uso médico mobile
export const MOBILE_BREAKPOINTS = {
  xs: 375, // iPhone SE, celulares pequenos
  sm: 640, // Celulares grandes
  md: 768, // Tablets pequenos
  lg: 1024, // Tablets grandes
  xl: 1280, // Desktop
} as const;

export function useIsMobile(breakpoint: keyof typeof MOBILE_BREAKPOINTS = 'md') {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth < MOBILE_BREAKPOINTS[breakpoint]
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINTS[breakpoint]);
    };

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

// Hook avançado para detecção de dispositivos móveis
export function useDeviceDetection() {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    screenSize: 'lg' as keyof typeof MOBILE_BREAKPOINTS,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Detecção de tamanho de tela
      let screenSize: keyof typeof MOBILE_BREAKPOINTS = 'xl';
      if (width < MOBILE_BREAKPOINTS.xs) screenSize = 'xs';
      else if (width < MOBILE_BREAKPOINTS.sm) screenSize = 'sm';
      else if (width < MOBILE_BREAKPOINTS.md) screenSize = 'md';
      else if (width < MOBILE_BREAKPOINTS.lg) screenSize = 'lg';

      // Detecção de tipo de dispositivo
      const isMobile = width < MOBILE_BREAKPOINTS.md;
      const isTablet = width >= MOBILE_BREAKPOINTS.md && width < MOBILE_BREAKPOINTS.lg;
      const isDesktop = width >= MOBILE_BREAKPOINTS.lg;

      // Detecção de touch
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Orientação
      const orientation = width > height ? 'landscape' : 'portrait';

      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        orientation,
        screenSize,
      });
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    window.addEventListener('orientationchange', updateDevice);

    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('orientationchange', updateDevice);
    };
  }, []);

  return device;
}

// Hook específico para componentes que precisam adaptar layout mobile
export function useMobileLayout() {
  const device = useDeviceDetection();

  return {
    ...device,
    // Helpers específicos para componentes médicos
    shouldShowMobileTable: device.isMobile,
    shouldStackCards:
      device.isMobile || (device.isTablet && device.orientation === 'portrait'),
    shouldCompactNavigation: device.isMobile,
    maxTableColumns: device.isMobile ? 3 : device.isTablet ? 5 : 8,
    gridCols: device.isMobile ? 1 : device.isTablet ? 2 : 4,
    uploadZoneHeight: device.isMobile ? 120 : 160,
  };
}
