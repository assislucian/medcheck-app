import { useEffect, useState, useCallback } from 'react';
import { useDevice } from './use-device';

/**
 * Hook customizado para gerenciar todas as funcionalidades da Hero Section mobile
 * Inclui scroll tracking, sticky CTA, animations e otimizações
 */
export function useMobileHero() {
  const { isMobile, platform } = useDevice();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll handler otimizado com throttling
  const handleScroll = useCallback(() => {
    let ticking = false;

    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const threshold = window.innerHeight * 0.6;
        
        setIsScrolled(scrollY > 100);
        setShowStickyCTA(scrollY > threshold);
        
        // Update sticky CTA visibility
        const stickyCTA = document.getElementById('mobile-sticky-cta');
        if (stickyCTA) {
          if (scrollY > threshold) {
            stickyCTA.classList.add('visible');
            stickyCTA.style.transform = 'translateY(0)';
            stickyCTA.style.opacity = '1';
          } else {
            stickyCTA.classList.remove('visible');
            stickyCTA.style.transform = 'translateY(100%)';
            stickyCTA.style.opacity = '0';
          }
        }
        
        ticking = false;
      });
      ticking = true;
    }
  }, []);

  // Setup scroll listener
  useEffect(() => {
    if (!isMobile) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, handleScroll]);

  // iOS specific optimizations
  useEffect(() => {
    if (platform === 'ios') {
      // Fix 100vh issue on iOS Safari
      const setVHProperty = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVHProperty();
      window.addEventListener('resize', setVHProperty);
      window.addEventListener('orientationchange', () => {
        setTimeout(setVHProperty, 100);
      });

      return () => {
        window.removeEventListener('resize', setVHProperty);
        window.removeEventListener('orientationchange', setVHProperty);
      };
    }
  }, [platform]);

  // Touch optimizations
  useEffect(() => {
    if (!isMobile) return;

    // Remove 300ms tap delay
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, false);

    // Add touch device class
    document.body.classList.add('touch-device');

    return () => {
      document.removeEventListener('touchend', handleTouchEnd, false);
      document.body.classList.remove('touch-device');
    };
  }, [isMobile]);

  // Smooth scrolling to sections
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setMenuOpen(false); // Close mobile menu after navigation
    }
  }, []);

  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Performance optimization: Intersection Observer for animations
  useEffect(() => {
    if (!isMobile) return;

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

    // Observe elements with animate class
    const elementsToAnimate = document.querySelectorAll('.mobile-animate');
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el));
    };
  }, [isMobile]);

  // Network optimization
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnectionType = () => {
        if (connection.effectiveType) {
          const slowTypes = ['slow-2g', '2g', '3g'];
          setConnectionType(
            slowTypes.includes(connection.effectiveType) ? 'slow' : 'fast'
          );
        }
      };

      updateConnectionType();
      connection.addEventListener('change', updateConnectionType);

      return () => {
        connection.removeEventListener('change', updateConnectionType);
      };
    }
  }, []);

  // Haptic feedback for iOS
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

  return {
    // State
    isScrolled,
    showStickyCTA,
    menuOpen,
    connectionType,

    // Actions
    scrollToSection,
    toggleMenu,
    triggerHaptic,

    // Utilities
    isMobile,
    platform,
  };
}

/**
 * Hook for managing card animations in horizontal scroll
 */
export function useHorizontalScroll(containerRef: React.RefObject<HTMLDivElement>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollability();
    container.addEventListener('scroll', checkScrollability, { passive: true });

    return () => {
      container.removeEventListener('scroll', checkScrollability);
    };
  }, [checkScrollability, containerRef]);

  const scrollLeft = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  }, [containerRef]);

  const scrollRight = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  }, [containerRef]);

  return {
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  };
}

/**
 * Hook for managing accordion state in solutions section
 */
export function useAccordion(itemCount: number) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const isExpanded = useCallback((index: number) => {
    return expandedItems.has(index);
  }, [expandedItems]);

  const expandAll = useCallback(() => {
    setExpandedItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
  }, [itemCount]);

  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  return {
    isExpanded,
    toggleItem,
    expandAll,
    collapseAll,
    expandedCount: expandedItems.size,
  };
}

/**
 * Hook for managing video modal state
 */
export function useVideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setIsPlaying(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  return {
    isOpen,
    isPlaying,
    openModal,
    closeModal,
  };
}

export default useMobileHero; 