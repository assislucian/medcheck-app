import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'other';
  userAgent: string;
  networkType?: 'slow' | 'fast' | 'unknown';
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

/**
 * Hook avançado de detecção de dispositivo - padrão das melhores webapps
 * Detecta automaticamente mobile/tablet/desktop e adapta a UI
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1280,
        height: 720,
        orientation: 'landscape',
        touchDevice: false,
        platform: 'desktop',
        userAgent: '',
        networkType: 'unknown',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;
    
    // Detecção de plataforma
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Classificação de dispositivo baseada em largura
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isDesktop = width >= BREAKPOINTS.tablet;
    
    // Detecção de orientação
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Detecção de plataforma
    let platform: 'ios' | 'android' | 'desktop' | 'other' = 'other';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';
    else if (isDesktop && !isTouchDevice) platform = 'desktop';
    
    // Detecção básica de velocidade de rede
    let networkType: 'slow' | 'fast' | 'unknown' = 'unknown';
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection?.effectiveType) {
        networkType = ['slow-2g', '2g', '3g'].includes(connection.effectiveType) 
          ? 'slow' 
          : 'fast';
      }
    }

    return {
      isMobile,
      isTablet,
      isDesktop,
      width,
      height,
      orientation,
      touchDevice: isTouchDevice,
      platform,
      userAgent,
      networkType,
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < BREAKPOINTS.mobile;
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
      const isDesktop = width >= BREAKPOINTS.tablet;
      
      const orientation = width > height ? 'landscape' : 'portrait';
      
      setDeviceInfo(prev => ({
        ...prev,
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
        orientation,
      }));
    };

    // Listener para mudanças de tamanho
    window.addEventListener('resize', updateDeviceInfo);
    
    // Listener para mudanças de orientação (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDeviceInfo, 100); // Delay para garantir que as dimensões foram atualizadas
    });

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook simplificado para compatibilidade com código existente
 */
export function useIsMobile(): boolean {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook para detectar se é tablet
 */
export function useIsTablet(): boolean {
  const { isTablet } = useDevice();
  return isTablet;
}

/**
 * Hook para detectar se é desktop
 */
export function useIsDesktop(): boolean {
  const { isDesktop } = useDevice();
  return isDesktop;
}

/**
 * Hook para detectar se é dispositivo touch
 */
export function useIsTouchDevice(): boolean {
  const { touchDevice } = useDevice();
  return touchDevice;
}

/**
 * Hook para breakpoints responsivos customizados
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { width } = useDevice();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook para orientação do dispositivo
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useDevice();
  return orientation;
}

/**
 * Hook para plataforma do dispositivo
 */
export function usePlatform(): 'ios' | 'android' | 'desktop' | 'other' {
  const { platform } = useDevice();
  return platform;
} 