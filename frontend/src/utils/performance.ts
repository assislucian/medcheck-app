/* ========================================================================
   MEDCHECK PERFORMANCE SYSTEM - ULTRA PREMIUM OPTIMIZATION
   ======================================================================== */

import React, { Suspense, lazy } from 'react';

/* ========================================================================
   PERFORMANCE MONITORING & METRICS
   ======================================================================== */

interface PerformanceMetrics {
  navigation: PerformanceNavigationTiming;
  paint: PerformancePaintTiming[];
  resources: PerformanceResourceTiming[];
  memory?: any;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics | null = null;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  init(): void {
    this.setupPerformanceObservers();
    this.trackCoreWebVitals();
    this.monitorResourceLoading();
  }

  private setupPerformanceObservers(): void {
    // First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.logMetric('FCP', entry.startTime);
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(paintObserver);

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.logMetric('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.logMetric('CLS', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  private trackCoreWebVitals(): void {
    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        this.logMetric('FID', fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);
  }

  private monitorResourceLoading(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        if (resource.duration > 1000) { // Resources taking > 1s
          console.warn(`Slow resource detected: ${resource.name} (${resource.duration}ms)`);
        }
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  private logMetric(name: string, value: number): void {
    console.log(`🚀 Performance Metric - ${name}: ${Math.round(value)}ms`);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics integration here
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  getMetrics(): PerformanceMetrics {
    if (!this.metrics) {
      this.metrics = {
        navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
        paint: performance.getEntriesByType('paint') as PerformancePaintTiming[],
        resources: performance.getEntriesByType('resource') as PerformanceResourceTiming[],
        memory: (performance as any).memory
      };
    }
    return this.metrics;
  }
}

/* ========================================================================
   INTELLIGENT PRELOADING SYSTEM
   ======================================================================== */

export class IntelligentPreloader {
  private static instance: IntelligentPreloader;
  private preloadedRoutes = new Set<string>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  static getInstance(): IntelligentPreloader {
    if (!IntelligentPreloader.instance) {
      IntelligentPreloader.instance = new IntelligentPreloader();
    }
    return IntelligentPreloader.instance;
  }

  // Preload route based on user behavior
  async preloadRoute(routePath: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    if (this.preloadedRoutes.has(routePath)) {
      return; // Already preloaded
    }

    if (priority === 'high') {
      await this.immediatePreload(routePath);
    } else {
      this.queuePreload(routePath);
    }
  }

  private async immediatePreload(routePath: string): Promise<void> {
    try {
      // Simulate route preloading for performance tracking
      await new Promise(resolve => setTimeout(resolve, 10));
      this.preloadedRoutes.add(routePath);
      console.log(`🚀 Route marked for preload: ${routePath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload route: ${routePath}`, error);
    }
  }

  private queuePreload(routePath: string): void {
    if (!this.preloadQueue.includes(routePath)) {
      this.preloadQueue.push(routePath);
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const routePath = this.preloadQueue.shift()!;
      
      // Wait for idle time
      await this.waitForIdleTime();
      
      try {
        await this.immediatePreload(routePath);
      } catch (error) {
        console.warn(`⚠️ Queue preload failed: ${routePath}`, error);
      }
    }

    this.isPreloading = false;
  }

  private waitForIdleTime(): Promise<void> {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve());
      } else {
        setTimeout(() => resolve(), 100);
      }
    });
  }

  // Preload based on hover (for navigation items)
  onHover(routePath: string): void {
    this.preloadRoute(routePath, 'high');
  }

  // Preload based on user patterns
  onUserActivity(mostLikelyNextRoutes: string[]): void {
    mostLikelyNextRoutes.forEach(route => {
      this.preloadRoute(route, 'medium');
    });
  }
}

/* ========================================================================
   RESOURCE OPTIMIZATION UTILITIES
   ======================================================================== */

export class ResourceOptimizer {
  // Compress and optimize images
  static optimizeImage(src: string, quality: number = 80): string {
    // Integration with image optimization service
    if (src.includes('placeholder.svg')) {
      return src; // Don't optimize placeholders
    }
    
    // Return optimized version
    return `${src}?quality=${quality}&format=webp`;
  }

  // Critical CSS injection
  static injectCriticalCSS(css: string): void {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Lazy load non-critical resources
  static lazyLoadResource(src: string, type: 'script' | 'style'): Promise<void> {
    return new Promise((resolve, reject) => {
      const element = type === 'script' 
        ? document.createElement('script')
        : document.createElement('link');

      element.onload = () => resolve();
      element.onerror = () => reject(new Error(`Failed to load ${src}`));

      if (type === 'script') {
        (element as HTMLScriptElement).src = src;
        (element as HTMLScriptElement).async = true;
      } else {
        (element as HTMLLinkElement).href = src;
        (element as HTMLLinkElement).rel = 'stylesheet';
      }

      document.head.appendChild(element);
    });
  }

  // Prefetch DNS for external resources
  static prefetchDNS(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

/* ========================================================================
   MEMORY MANAGEMENT
   ======================================================================== */

export class MemoryManager {
  private static cleanupTasks: (() => void)[] = [];

  static addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  static cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  static getMemoryUsage(): any {
    return (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }

  static isMemoryPressure(): boolean {
    const memory = this.getMemoryUsage();
    return memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8;
  }
}

/* ========================================================================
   PERFORMANCE HOOKS
   ======================================================================== */

export const usePerformanceTracking = () => {
  const tracker = PerformanceTracker.getInstance();
  
  React.useEffect(() => {
    tracker.init();
    return () => tracker.cleanup();
  }, []);

  return {
    getMetrics: () => tracker.getMetrics(),
    logCustomMetric: (name: string, value: number) => {
      console.log(`📊 Custom Metric - ${name}: ${value}`);
    }
  };
};

export const useIntelligentPreloader = () => {
  const preloader = IntelligentPreloader.getInstance();
  
  return {
    preloadRoute: preloader.preloadRoute.bind(preloader),
    onHover: preloader.onHover.bind(preloader),
    onUserActivity: preloader.onUserActivity.bind(preloader)
  };
};

/* ========================================================================
   PERFORMANCE CONSTANTS
   ======================================================================== */

export const PERFORMANCE_THRESHOLDS = {
  FCP: 1800, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
} as const;

export const PRELOAD_STRATEGIES = {
  CRITICAL: ['/', '/dashboard', '/login'],
  HIGH_PRIORITY: ['/guides', '/demonstratives'],
  MEDIUM_PRIORITY: ['/profile', '/help', '/reports'],
  LOW_PRIORITY: ['/pricing', '/contact']
} as const; 