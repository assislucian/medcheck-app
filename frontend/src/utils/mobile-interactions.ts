/**
 * Utilitários para interações mobile otimizadas
 * Implementa as melhores práticas de UX mobile
 */

/**
 * Configura scroll listeners para sticky CTA
 */
export function setupStickyCTA() {
  if (typeof window === 'undefined') return;

  let lastScrollY = 0;
  let ticking = false;

  const stickyCTA = document.getElementById('sticky-cta');
  if (!stickyCTA) return;

  const updateStickyCTA = () => {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight * 0.8; // 80% da altura da tela

    if (scrollY > heroHeight) {
      // Mostrar CTA depois do hero
      stickyCTA.style.transform = 'translateY(0)';
      stickyCTA.style.opacity = '1';
    } else {
      // Esconder CTA
      stickyCTA.style.transform = 'translateY(100%)';
      stickyCTA.style.opacity = '0';
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateStickyCTA);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });

  // Cleanup function
  return () => {
    window.removeEventListener('scroll', requestTick);
  };
}

/**
 * Otimizações para iOS Safari
 */
export function setupIOSOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Fix para 100vh no iOS Safari
  const setVHProperty = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVHProperty();
  window.addEventListener('resize', setVHProperty);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVHProperty, 100);
  });

  // Prevenir zoom em inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (input instanceof HTMLElement) {
      input.style.fontSize = '16px';
    }
  });

  return () => {
    window.removeEventListener('resize', setVHProperty);
    window.removeEventListener('orientationchange', setVHProperty);
  };
}

/**
 * Configura smooth scrolling para navegação
 */
export function setupSmoothScrolling() {
  if (typeof window === 'undefined') return;

  // Polyfill para browsers antigos
  if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothscroll = require('smoothscroll-polyfill');
    smoothscroll.polyfill();
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Otimizações de performance para mobile
 */
export function setupPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Lazy loading para imagens
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('blur-sm');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Reduzir motion se preferência do usuário
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Configura touch interactions otimizadas
 */
export function setupTouchOptimizations() {
  if (typeof window === 'undefined') return;

  // Remove delay de 300ms em taps
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Adiciona classe para hover states em devices touch
  let isTouch = false;
  document.addEventListener('touchstart', () => {
    if (!isTouch) {
      isTouch = true;
      document.body.classList.add('touch-device');
    }
  });

  document.addEventListener('mouseover', () => {
    if (isTouch) {
      isTouch = false;
      document.body.classList.remove('touch-device');
    }
  });
}

/**
 * Network-aware loading
 */
export function setupNetworkOptimizations() {
  if (typeof window === 'undefined') return;

  const connection = (navigator as any).connection;
  if (connection) {
    // Reduzir qualidade de imagens em conexões lentas
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      document.body.classList.add('slow-connection');
    }

    // Listener para mudanças na conexão
    connection.addEventListener('change', () => {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-connection');
      } else {
        document.body.classList.remove('slow-connection');
      }
    });
  }
}

/**
 * Inicializa todas as otimizações mobile
 */
export function initializeMobileOptimizations() {
  const cleanupFunctions: (() => void)[] = [];

  // Setup all optimizations
  cleanupFunctions.push(setupStickyCTA() || (() => {}));
  cleanupFunctions.push(setupIOSOptimizations() || (() => {}));
  
  setupSmoothScrolling();
  setupPerformanceOptimizations();
  setupTouchOptimizations();
  setupNetworkOptimizations();

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

/**
 * Hook React para usar as otimizações mobile
 */
export function useMobileOptimizations() {
  React.useEffect(() => {
    const cleanup = initializeMobileOptimizations();
    return cleanup;
  }, []);
}

// CSS customizado para otimizações
export const mobileOptimizationCSS = `
  /* Fix para 100vh no iOS */
  .mobile-height {
    height: calc(var(--vh, 1vh) * 100);
  }

  /* Touch device optimizations */
  .touch-device *:hover {
    background-color: transparent !important;
  }

  /* Slow connection optimizations */
  .slow-connection img {
    filter: blur(5px);
    transition: filter 0.3s;
  }

  .slow-connection img.loaded {
    filter: none;
  }

  /* Hardware acceleration */
  .mobile-card, .mobile-button {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
`;

export default {
  setupStickyCTA,
  setupIOSOptimizations,
  setupSmoothScrolling,
  setupPerformanceOptimizations,
  setupTouchOptimizations,
  setupNetworkOptimizations,
  initializeMobileOptimizations,
  useMobileOptimizations,
  mobileOptimizationCSS,
}; 