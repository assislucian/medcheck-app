import { useEffect, useState, useCallback, useRef } from 'react';
import { useDevice } from './use-device';
import { toast } from 'sonner';

/**
 * Hook específico para funcionalidades mobile da página de Guias
 * Gerencia upload, filtros, navegação e otimizações touch
 */
export function useMobileGuides() {
  const { isMobile, platform } = useDevice();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Haptic feedback para iOS
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (platform === 'ios' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [platform]);

  // Upload otimizado para mobile
  const handleMobileUpload = useCallback(async (
    files: FileList,
    onProgress?: (progress: number) => void,
    onComplete?: (results: any[]) => void
  ) => {
    if (!files.length) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    triggerHaptic('medium');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Adicionar arquivos com validação
      Array.from(files).forEach((file) => {
        // Validar tipo de arquivo
        const validTypes = ['.pdf', '.xml'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
          throw new Error(`Arquivo ${file.name} não é válido. Use apenas PDF ou XML.`);
        }

        // Validar tamanho (max 10MB por arquivo)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Arquivo ${file.name} é muito grande. Máximo 10MB por arquivo.`);
        }

        formData.append('files', file);
      });

      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          onProgress?.(newProgress);
          return Math.min(newProgress, 90);
        });
      }, 200);

      const response = await fetch('/api/v1/guias/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const results = await response.json();
      
      // Feedback de sucesso
      toast.success(`${files.length} arquivo(s) processado(s) com sucesso!`);
      triggerHaptic('heavy');
      
      onComplete?.(results);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro durante o upload');
      triggerHaptic('heavy');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [triggerHaptic]);

  // Abrir seletor de arquivos mobile
  const openFileSelector = useCallback(() => {
    triggerHaptic('light');
    fileInputRef.current?.click();
  }, [triggerHaptic]);

  // Filtros otimizados para mobile
  const toggleFilters = useCallback(() => {
    setFilterCollapsed(prev => !prev);
    triggerHaptic('light');
  }, [triggerHaptic]);

  // Scroll suave para seções
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      triggerHaptic('light');
    }
  }, [triggerHaptic]);

  // Otimizações de performance para mobile
  useEffect(() => {
    if (!isMobile) return;

    // Otimizar scrolling
    const optimizeScrolling = () => {
      document.body.style.webkitOverflowScrolling = 'touch';
      document.body.style.overscrollBehaviorY = 'contain';
    };

    // Prevenir zoom em inputs
    const preventZoom = () => {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        if (input instanceof HTMLElement) {
          const fontSize = window.getComputedStyle(input).fontSize;
          if (parseFloat(fontSize) < 16) {
            input.style.fontSize = '16px';
          }
        }
      });
    };

    optimizeScrolling();
    preventZoom();

    // Observer para lazy loading de cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    // Observar cards de guias
    const guideCards = document.querySelectorAll('.guide-mobile-card');
    guideCards.forEach((card) => observer.observe(card));

    return () => {
      guideCards.forEach((card) => observer.unobserve(card));
    };
  }, [isMobile]);

  // Pull-to-refresh simulation
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && startY > 0) {
      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100) {
        setPullToRefreshActive(true);
      }
    }
  }, [startY]);

  const handleTouchEnd = useCallback(() => {
    if (pullToRefreshActive) {
      triggerHaptic('medium');
      // Trigger refresh action
      window.dispatchEvent(new CustomEvent('guides-refresh'));
    }
    setPullToRefreshActive(false);
    setStartY(0);
  }, [pullToRefreshActive, triggerHaptic]);

  // Setup pull-to-refresh listeners
  useEffect(() => {
    if (!isMobile) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Share guide (Web Share API)
  const shareGuide = useCallback(async (guide: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Guia #${guide.numero_guia}`,
          text: `Guia médica de ${guide.beneficiario}`,
          url: window.location.href,
        });
        triggerHaptic('light');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Guia #${guide.numero_guia} - ${guide.beneficiario}`
        );
        toast.success('Dados da guia copiados!');
        triggerHaptic('light');
      } catch (error) {
        toast.error('Erro ao copiar dados');
      }
    }
  }, [triggerHaptic]);

  // Keyboard shortcuts para desktop quando necessário
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + U para upload
      if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        openFileSelector();
      }
      
      // Ctrl/Cmd + F para busca
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [openFileSelector]);

  // Connection quality awareness
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnectionQuality = () => {
        if (connection.effectiveType) {
          const slowTypes = ['slow-2g', '2g', '3g'];
          setConnectionQuality(
            slowTypes.includes(connection.effectiveType) ? 'slow' : 'fast'
          );
        }
      };

      updateConnectionQuality();
      connection.addEventListener('change', updateConnectionQuality);

      return () => {
        connection.removeEventListener('change', updateConnectionQuality);
      };
    }
  }, []);

  return {
    // States
    isUploading,
    uploadProgress,
    filterCollapsed,
    pullToRefreshActive,
    connectionQuality,

    // Refs
    fileInputRef,

    // Actions
    handleMobileUpload,
    openFileSelector,
    toggleFilters,
    scrollToSection,
    shareGuide,
    triggerHaptic,

    // Utils
    isMobile,
    platform,
  };
}

/**
 * Hook para gerenciar estado de filtros mobile
 */
export function useMobileFilters() {
  const [activeFilters, setActiveFilters] = useState<{
    search: string;
    status: string;
    dateRange: { start: string; end: string };
  }>({
    search: '',
    status: 'all',
    dateRange: { start: '', end: '' },
  });

  const [filtersVisible, setFiltersVisible] = useState(false);

  const updateFilter = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({
      search: '',
      status: 'all',
      dateRange: { start: '', end: '' },
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      activeFilters.search !== '' ||
      activeFilters.status !== 'all' ||
      activeFilters.dateRange.start !== '' ||
      activeFilters.dateRange.end !== ''
    );
  }, [activeFilters]);

  return {
    activeFilters,
    filtersVisible,
    setFiltersVisible,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
}

export default useMobileGuides; 