import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

// Performance Systems
import { 
  PerformanceTracker, 
  IntelligentPreloader, 
  ResourceOptimizer,
  MemoryManager,
  PRELOAD_STRATEGIES 
} from '@/utils/performance';

// Premium Loading Components
import { 
  LoadingProvider, 
  PremiumSuspenseFallback,
  PremiumErrorFallback,
  PageTransition 
} from '@/components/ui/PremiumLoading';

// Context and Auth
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Layout Components
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';

// Lazy-loaded Components with Preloading
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback'));
const HealthPlanSelection = React.lazy(() => import('./pages/HealthPlanSelection'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Guides = React.lazy(() => import('@/pages/Guides'));
const Demonstratives = React.lazy(() => import('@/pages/Demonstratives'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const IntelligenceHub = React.lazy(() => import('@/pages/IntelligenceHub'));
const UnpaidProcedures = React.lazy(() => import('@/pages/UnpaidProcedures'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Help = React.lazy(() => import('@/pages/Help'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const About = React.lazy(() => import('@/pages/About'));
const Index = React.lazy(() => import('@/pages/Index'));
const UpgradeEnterprise = React.lazy(() => import('@/pages/UpgradeEnterprise'));
const PricingPage = React.lazy(() => import('@/pages/Pricing'));
const CheckoutPage = React.lazy(() => import('@/pages/Checkout'));

/* ========================================================================
   PERFORMANCE MONITORING COMPONENT
   ======================================================================== */

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    const tracker = PerformanceTracker.getInstance();
    const preloader = IntelligentPreloader.getInstance();
    
    // Initialize performance tracking
    tracker.init();
    
    // Preload critical routes
    PRELOAD_STRATEGIES.CRITICAL.forEach(route => {
      preloader.preloadRoute(route, 'high');
    });
    
    // Setup DNS prefetching for external resources
    ResourceOptimizer.prefetchDNS([
      'https://api.medcheck.com',
      'https://cdn.medcheck.com',
      'https://fonts.googleapis.com'
    ]);
    
    // Cleanup on unmount
    return () => {
      tracker.cleanup();
      MemoryManager.cleanup();
    };
  }, []);

  return null;
};

/* ========================================================================
   ROUTE PRELOADER COMPONENT
   ======================================================================== */

interface RoutePreloaderProps {
  children: React.ReactNode;
}

const RoutePreloader: React.FC<RoutePreloaderProps> = ({ children }) => {
  const location = useLocation();
  const preloader = IntelligentPreloader.getInstance();

  useEffect(() => {
    // Preload likely next routes based on current location
    const currentPath = location.pathname;
    
    const routePatterns: Record<string, string[]> = {
      '/dashboard': ['/guides', '/reports', '/demonstratives'],
      '/guides': ['/demonstratives', '/reports', '/intelligence-hub'],
      '/demonstratives': ['/guides', '/reports', '/unpaid-procedures'],
      '/reports': ['/guides', '/demonstratives', '/intelligence-hub'],
      '/intelligence-hub': ['/guides', '/reports', '/demonstratives'],
      '/profile': ['/dashboard', '/help'],
      '/': ['/dashboard', '/login', '/about']
    };

    const nextRoutes = routePatterns[currentPath] || [];
    preloader.onUserActivity(nextRoutes);
  }, [location.pathname, preloader]);

  return <>{children}</>;
};

/* ========================================================================
   ERROR BOUNDARY
   ======================================================================== */

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to performance monitoring
    const tracker = PerformanceTracker.getInstance();
    // tracker.logError(error, errorInfo); // Would implement in real system
  }

  render() {
    if (this.state.hasError) {
      return (
        <PremiumErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

/* ========================================================================
   ROUTE WRAPPER WITH TRANSITIONS
   ======================================================================== */

interface RouteWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ children, isLoading = false }) => {
  return (
    <PageTransition isLoading={isLoading}>
      {children}
    </PageTransition>
  );
};

/* ========================================================================
   MAIN APP COMPONENT
   ======================================================================== */

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <LoadingProvider>
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <PerformanceMonitor />
              
              <RoutePreloader>
                <motion.div 
                  className="min-h-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense 
                    fallback={
                      <PremiumSuspenseFallback 
                        variant="page" 
                        message="Carregando MedCheck Premium..." 
                      />
                    }
                  >
                    <AnimatePresence mode="wait">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={
                          <RouteWrapper>
                            <Index />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/about" element={
                          <RouteWrapper>
                            <PublicLayout title="Sobre - MedCheck">
                              <About />
                            </PublicLayout>
                          </RouteWrapper>
                        } />
                        
                        <Route path="/pricing" element={
                          <RouteWrapper>
                            <PublicLayout title="Preços - MedCheck">
                              <PricingPage />
                            </PublicLayout>
                          </RouteWrapper>
                        } />

                        {/* Auth Routes */}
                        <Route path="/login" element={
                          <RouteWrapper>
                            <Login />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/register" element={
                          <RouteWrapper>
                            <Register />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/auth/callback" element={
                          <RouteWrapper>
                            <AuthCallback />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/health-plan-selection" element={
                          <RouteWrapper>
                            <HealthPlanSelection />
                          </RouteWrapper>
                        } />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                          <RouteWrapper>
                            <Dashboard />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/guides" element={
                          <RouteWrapper>
                            <Guides />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/demonstratives" element={
                          <RouteWrapper>
                            <Demonstratives />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/reports" element={
                          <RouteWrapper>
                            <Reports />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/intelligence-hub" element={
                          <RouteWrapper>
                            <IntelligenceHub />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/unpaid-procedures" element={
                          <RouteWrapper>
                            <UnpaidProcedures />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/profile" element={
                          <RouteWrapper>
                            <Profile />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/help" element={
                          <RouteWrapper>
                            <Help />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/notifications" element={
                          <RouteWrapper>
                            <Notifications />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/upgrade-enterprise" element={
                          <RouteWrapper>
                            <UpgradeEnterprise />
                          </RouteWrapper>
                        } />
                        
                        <Route path="/checkout" element={
                          <RouteWrapper>
                            <CheckoutPage />
                          </RouteWrapper>
                        } />

                        {/* 404 Route */}
                        <Route path="*" element={
                          <RouteWrapper>
                            <div className="min-h-screen flex items-center justify-center">
                              <PremiumErrorFallback 
                                error={new Error('Página não encontrada')}
                                resetError={() => window.location.href = '/dashboard'}
                              />
                            </div>
                          </RouteWrapper>
                        } />
                      </Routes>
                    </AnimatePresence>
                  </Suspense>
                </motion.div>
              </RoutePreloader>

              {/* Toast Notifications */}
              <Toaster 
                richColors 
                position="top-right"
                className="medical-toaster"
                toastOptions={{
                  style: {
                    background: 'rgb(var(--surface-1))',
                    color: 'rgb(var(--text-body))',
                    border: '1px solid rgb(var(--medical-blue-500) / 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-medium)',
                    backdropFilter: 'blur(8px)',
                  }
                }}
              />
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </LoadingProvider>
    </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
