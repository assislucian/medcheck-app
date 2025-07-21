import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Stethoscope, 
  Activity,
  Heart,
  Brain,
  Shield,
  Zap
} from 'lucide-react';

/* ========================================================================
   PREMIUM LOADING COMPONENTS - ULTRA SOPHISTICATED
   ======================================================================== */

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'form' | 'dashboard' | 'medical';
  lines?: number;
  className?: string;
  animated?: boolean;
}

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  direction?: 'forward' | 'backward';
  className?: string;
}

interface MedicalLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'pulse' | 'orbit' | 'heartbeat' | 'brain' | 'stethoscope';
  message?: string;
  progress?: number;
  className?: string;
}

/* ========================================================================
   SKELETON LOADING COMPONENTS
   ======================================================================== */

export const PremiumSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  lines = 3,
  className,
  animated = true
}) => {
  const getSkeletonPattern = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="medical-skeleton h-8 w-64 mx-auto rounded-lg" />
              <div className="medical-skeleton h-4 w-96 mx-auto rounded" />
            </div>
            
            {/* Metrics Grid Skeleton */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="medical-skeleton h-32 rounded-2xl" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              <div className="medical-skeleton h-6 w-48 rounded" />
              <div className="medical-skeleton h-64 w-full rounded-2xl" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b border-medical-200/30">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="medical-skeleton h-4 rounded" />
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-6 gap-4 p-4">
                {Array.from({ length: 6 }).map((_, colIdx) => (
                  <div 
                    key={colIdx} 
                    className="medical-skeleton h-4 rounded"
                    style={{ animationDelay: `${(rowIdx * 6 + colIdx) * 100}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        );

      case 'medical':
        return (
          <div className="space-y-6">
            {/* Medical Header */}
            <div className="flex items-center gap-4">
              <div className="medical-skeleton h-12 w-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="medical-skeleton h-6 w-64 rounded" />
                <div className="medical-skeleton h-4 w-96 rounded" />
              </div>
            </div>

            {/* Medical Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="medical-skeleton h-20 rounded-xl" />
              ))}
            </div>

            {/* Medical Content */}
            <div className="space-y-3">
              {Array.from({ length: lines }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "medical-skeleton h-4 rounded",
                    idx === lines - 1 ? "w-3/4" : "w-full"
                  )}
                  style={{ animationDelay: `${idx * 200}ms` }}
                />
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            {Array.from({ length: lines }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="medical-skeleton h-4 w-24 rounded" />
                <div className="medical-skeleton h-12 w-full rounded-lg" />
              </div>
            ))}
            <div className="medical-skeleton h-12 w-32 rounded-lg" />
          </div>
        );

      default: // card
        return (
          <div className="space-y-4">
            <div className="medical-skeleton h-6 w-3/4 rounded" />
            {Array.from({ length: lines }).map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "medical-skeleton h-4 rounded",
                  idx === lines - 1 ? "w-1/2" : "w-full"
                )}
                style={{ animationDelay: `${idx * 150}ms` }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {getSkeletonPattern()}
    </div>
  );
};

/* ========================================================================
   MEDICAL LOADING INDICATORS
   ======================================================================== */

export const MedicalLoader: React.FC<MedicalLoaderProps> = ({
  size = 'md',
  variant = 'pulse',
  message,
  progress,
  className
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
      xl: 'h-24 w-24'
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    };
    return sizes[size];
  };

  const renderVariant = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-br from-medical-500 to-brand-600 flex items-center justify-center',
              getSizeClasses()
            )}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Stethoscope className={cn('text-white', getIconSize())} />
          </motion.div>
        );

      case 'orbit':
        return (
          <div className={cn('relative', getSizeClasses())}>
            {/* Central Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className={cn('text-medical-600', getIconSize())} />
            </div>
            
            {/* Orbiting Elements */}
            {Array.from({ length: 3 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="absolute inset-0 border-2 border-medical-300 rounded-full opacity-30"
                style={{ borderStyle: 'dashed' }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3 + idx,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        );

      case 'heartbeat':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center',
              getSizeClasses()
            )}
            animate={{
              scale: [1, 1.2, 1, 1.05, 1]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className={cn('text-white', getIconSize())} />
          </motion.div>
        );

      case 'brain':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center relative',
              getSizeClasses()
            )}
          >
            <Brain className={cn('text-white', getIconSize())} />
            
            {/* Neural Activity */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: '20%',
                  left: '20%',
                  transformOrigin: '50% 50%'
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.5
                }}
              />
            ))}
          </motion.div>
        );

      case 'stethoscope':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-br from-medical-500 to-mint-600 flex items-center justify-center',
              getSizeClasses()
            )}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Stethoscope className={cn('text-white', getIconSize())} />
          </motion.div>
        );

      default:
        return (
          <Loader2 className={cn('animate-spin text-medical-600', getSizeClasses())} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {renderVariant()}
      
      {message && (
        <motion.p 
          className="medical-body text-medical-600 text-center max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}

      {progress !== undefined && (
        <div className="w-48 h-2 bg-medical-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-medical-500 to-brand-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
};

/* ========================================================================
   PAGE TRANSITIONS
   ======================================================================== */

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isLoading = false,
  direction = 'forward',
  className
}) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 50 : -50,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -50 : 50,
      scale: 0.98
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center min-h-[400px]"
        >
          <MedicalLoader 
            size="lg" 
            variant="brain"
            message="Carregando experiência premium..."
          />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ========================================================================
   SUSPENSE FALLBACKS
   ======================================================================== */

export const PremiumSuspenseFallback: React.FC<{
  message?: string;
  variant?: 'page' | 'component' | 'modal';
}> = ({ 
  message = "Carregando...", 
  variant = 'component' 
}) => {
  const getContainerClasses = () => {
    switch (variant) {
      case 'page':
        return 'min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30';
      case 'modal':
        return 'min-h-[300px] flex items-center justify-center';
      default:
        return 'min-h-[200px] flex items-center justify-center';
    }
  };

  return (
    <div className={getContainerClasses()}>
      <MedicalLoader
        size={variant === 'page' ? 'xl' : 'lg'}
        variant="orbit"
        message={message}
      />
    </div>
  );
};

/* ========================================================================
   ERROR BOUNDARIES
   ======================================================================== */

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  className?: string;
}

export const PremiumErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  className
}) => {
  return (
    <div className={cn(
      'min-h-[400px] flex items-center justify-center p-8',
      className
    )}>
      <div className="text-center space-y-6 max-w-md">
        <div className="p-6 rounded-full bg-gradient-to-br from-red-100 to-rose-100 mx-auto w-fit">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        
        <div className="space-y-3">
          <h3 className="medical-heading-tertiary text-red-700">
            Oops! Algo inesperado aconteceu
          </h3>
          <p className="medical-body text-gray-600">
            Nosso sistema de proteção médica detectou um problema. 
            Estamos trabalhando para resolver.
          </p>
          {error && (
            <details className="text-sm text-gray-500 mt-4">
              <summary className="cursor-pointer hover:text-gray-700">
                Detalhes técnicos
              </summary>
              <code className="mt-2 block p-2 bg-gray-100 rounded text-xs">
                {error.message}
              </code>
            </details>
          )}
        </div>

        {resetError && (
          <button
            onClick={resetError}
            className="medical-btn-enhanced medical-btn-primary px-6 py-3 rounded-lg font-semibold"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};

/* ========================================================================
   LOADING PROVIDER CONTEXT
   ======================================================================== */

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('Carregando...');

  const setLoading = React.useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setLoading,
      loadingMessage,
      setLoadingMessage
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export default {
  PremiumSkeleton,
  MedicalLoader,
  PageTransition,
  PremiumSuspenseFallback,
  PremiumErrorFallback,
  LoadingProvider,
  useLoading
}; 