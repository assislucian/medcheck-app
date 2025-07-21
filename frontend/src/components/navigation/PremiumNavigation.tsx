import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIntelligentPreloader } from '@/utils/performance';
import { 
  ChevronRight, 
  Home, 
  LayoutDashboard,
  FileText,
  FileBarChart,
  Brain,
  HelpCircle,
  User,
  Settings,
  ArrowLeft,
  ExternalLink,
  Star,
  Zap
} from 'lucide-react';

/* ========================================================================
   PREMIUM NAVIGATION COMPONENTS
   ======================================================================== */

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant?: 'new' | 'hot' | 'premium' | 'beta';
  };
  priority?: 'high' | 'medium' | 'low';
  external?: boolean;
  children?: NavigationItem[];
}

interface PremiumBreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
  showHome?: boolean;
}

interface SmartNavigationProps {
  items: NavigationItem[];
  className?: string;
  variant?: 'sidebar' | 'horizontal' | 'mobile';
  onNavigate?: (href: string) => void;
}

interface QuickActionsProps {
  actions: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    hotkey?: string;
  }>;
  className?: string;
}

/* ========================================================================
   SMART BREADCRUMBS
   ======================================================================== */

export const PremiumBreadcrumbs: React.FC<PremiumBreadcrumbsProps> = ({
  items,
  className,
  showHome = true
}) => {
  const { preloadRoute } = useIntelligentPreloader();
  
  // Auto-generate breadcrumbs from current path
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const generateBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (showHome) {
      breadcrumbs.push({
        label: 'Início',
        href: '/',
        icon: Home
      });
    }

    // Map path segments to readable labels
    const pathMap: Record<string, { label: string; icon?: any }> = {
      'dashboard': { label: 'Dashboard', icon: LayoutDashboard },
      'guides': { label: 'Guias Médicas', icon: FileText },
      'demonstratives': { label: 'Demonstrativos', icon: FileBarChart },
      'intelligence-hub': { label: 'Central de Inteligência', icon: Brain },
      'profile': { label: 'Perfil', icon: User },
      'help': { label: 'Ajuda', icon: HelpCircle },
      'reports': { label: 'Relatórios', icon: FileBarChart },
      'unpaid-procedures': { label: 'Glosas Pendentes', icon: FileText },
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const mappedSegment = pathMap[segment];
      
      if (mappedSegment) {
        breadcrumbs.push({
          label: mappedSegment.label,
          href: index === pathSegments.length - 1 ? undefined : currentPath,
          icon: mappedSegment.icon
        });
      }
    });

    return breadcrumbs;
  };

  const finalBreadcrumbs = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <motion.nav
      className={cn(
        'flex items-center space-x-2 text-sm',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ol className="flex items-center space-x-2">
        {finalBreadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                onMouseEnter={() => preloadRoute(item.href!)}
                className="medical-nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-medical-600 hover:text-medical-700 hover:bg-medical-50 transition-all duration-200"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-3 py-2 text-medical-800 font-semibold">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
};

/* ========================================================================
   SMART NAVIGATION WITH PRELOADING
   ======================================================================== */

export const SmartNavigation: React.FC<SmartNavigationProps> = ({
  items,
  className,
  variant = 'sidebar',
  onNavigate
}) => {
  const { preloadRoute } = useIntelligentPreloader();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    // Preload on hover for instant navigation
    preloadRoute(href, priority);
  };

  const handleClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate?.(href);
      navigate(href);
    }
  };

  const getBadgeStyles = (variant: string = 'new') => {
    const styles = {
      new: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      hot: 'bg-red-100 text-red-700 border border-red-200',
      premium: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
      beta: 'bg-blue-100 text-blue-700 border border-blue-200'
    };
    return styles[variant as keyof typeof styles] || styles.new;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'horizontal':
        return 'flex flex-row space-x-2';
      case 'mobile':
        return 'flex flex-col space-y-1 p-4';
      default: // sidebar
        return 'flex flex-col space-y-2';
    }
  };

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    const isActive = location.pathname === item.href || 
                    location.pathname.startsWith(item.href + '/');

    return (
      <motion.div
        key={item.href}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
      >
        <button
          onClick={() => handleClick(item.href, item.external)}
          onMouseEnter={() => handleNavigation(item.href, item.priority)}
          onFocus={() => handleNavigation(item.href, item.priority)}
          className={cn(
            'medical-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300',
            'hover:bg-gradient-to-r hover:from-medical-50 hover:to-brand-50',
            'focus:outline-none focus:ring-2 focus:ring-medical-500/30',
            isActive 
              ? 'bg-gradient-to-r from-medical-100 to-brand-100 text-medical-700 border border-medical-200/50 shadow-sm' 
              : 'text-gray-700 hover:text-medical-700',
            variant === 'horizontal' && 'min-w-fit'
          )}
        >
          {/* Icon with animation */}
          {item.icon && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2 rounded-lg transition-colors duration-200',
                isActive 
                  ? 'bg-gradient-to-br from-medical-200 to-brand-200' 
                  : 'group-hover:bg-medical-100'
              )}
            >
              <item.icon className="h-5 w-5" />
            </motion.div>
          )}

          {/* Label */}
          <span className={cn(
            'flex-1 text-left',
            variant === 'horizontal' && 'text-center'
          )}>
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded-full',
                getBadgeStyles(item.badge.variant)
              )}
            >
              {item.badge.text}
            </motion.span>
          )}

          {/* External link indicator */}
          {item.external && (
            <ExternalLink className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Sub-navigation */}
        <AnimatePresence>
          {item.children && isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 mt-2 space-y-1 border-l-2 border-medical-200 pl-4"
            >
              {item.children.map((child, childIndex) => (
                <button
                  key={child.href}
                  onClick={() => handleClick(child.href, child.external)}
                  onMouseEnter={() => handleNavigation(child.href, 'medium')}
                  className="medical-nav-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-medical-600 hover:bg-medical-50"
                >
                  {child.icon && <child.icon className="h-4 w-4" />}
                  <span>{child.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <nav className={cn(getVariantClasses(), className)}>
      {items.map(renderNavigationItem)}
    </nav>
  );
};

/* ========================================================================
   QUICK ACTIONS MENU
   ======================================================================== */

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className
}) => {
  const { preloadRoute } = useIntelligentPreloader();
  const navigate = useNavigate();

  const getVariantStyles = (variant: string = 'primary') => {
    const styles = {
      primary: 'bg-gradient-to-r from-medical-500 to-brand-600 text-white hover:from-medical-600 hover:to-brand-700',
      secondary: 'bg-white text-medical-600 border border-medical-200 hover:bg-medical-50',
      success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
    };
    return styles[variant as keyof typeof styles] || styles.primary;
  };

  return (
    <motion.div
      className={cn('flex flex-wrap gap-3', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, staggerChildren: 0.1 }}
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(action.href)}
          onMouseEnter={() => preloadRoute(action.href, 'high')}
          className={cn(
            'medical-btn-enhanced inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl',
            getVariantStyles(action.variant),
            'group relative overflow-hidden'
          )}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Icon */}
          <action.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          
          {/* Label */}
          <span className="relative">{action.label}</span>
          
          {/* Hotkey indicator */}
          {action.hotkey && (
            <kbd className="relative ml-2 px-2 py-1 text-xs bg-black/10 rounded border border-white/20">
              {action.hotkey}
            </kbd>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

/* ========================================================================
   BACK NAVIGATION
   ======================================================================== */

export const BackNavigation: React.FC<{
  label?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}> = ({ 
  label = 'Voltar', 
  href, 
  className,
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className={cn(
        'medical-nav-item inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'text-medical-600 hover:text-medical-700 hover:bg-medical-50',
        'transition-all duration-200 font-medium',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
};

/* ========================================================================
   NAVIGATION HOOKS
   ======================================================================== */

export const useSmartNavigation = () => {
  const { preloadRoute } = useIntelligentPreloader();
  const navigate = useNavigate();

  const navigateWithPreload = React.useCallback((href: string) => {
    preloadRoute(href, 'high');
    navigate(href);
  }, [navigate, preloadRoute]);

  const preloadOnHover = React.useCallback((href: string) => {
    preloadRoute(href, 'medium');
  }, [preloadRoute]);

  return {
    navigateWithPreload,
    preloadOnHover,
    navigate
  };
};

/* ========================================================================
   DEFAULT NAVIGATION CONFIGURATIONS
   ======================================================================== */

export const MEDICAL_NAVIGATION: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    priority: 'high'
  },
  {
    label: 'Guias Médicas',
    href: '/guides',
    icon: FileText,
    priority: 'high',
    badge: { text: 'Principal', variant: 'premium' }
  },
  {
    label: 'Demonstrativos',
    href: '/demonstratives',
    icon: FileBarChart,
    priority: 'high'
  },
  {
    label: 'Central de IA',
    href: '/intelligence-hub',
    icon: Brain,
    priority: 'medium',
    badge: { text: 'IA', variant: 'hot' }
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: FileBarChart,
    priority: 'medium'
  },
  {
    label: 'Perfil',
    href: '/profile',
    icon: User,
    priority: 'low'
  },
  {
    label: 'Ajuda',
    href: '/help',
    icon: HelpCircle,
    priority: 'low'
  }
];

export const QUICK_ACTIONS_CONFIG = [
  {
    label: 'Nova Análise',
    href: '/guides?tab=upload',
    icon: Zap,
    variant: 'primary' as const,
    hotkey: 'Ctrl+N'
  },
  {
    label: 'Ver Relatórios',
    href: '/reports',
    icon: FileBarChart,
    variant: 'secondary' as const,
    hotkey: 'Ctrl+R'
  },
  {
    label: 'Central de IA',
    href: '/intelligence-hub',
    icon: Brain,
    variant: 'success' as const,
    hotkey: 'Ctrl+I'
  }
];

export default {
  PremiumBreadcrumbs,
  SmartNavigation,
  QuickActions,
  BackNavigation,
  useSmartNavigation,
  MEDICAL_NAVIGATION,
  QUICK_ACTIONS_CONFIG
}; 