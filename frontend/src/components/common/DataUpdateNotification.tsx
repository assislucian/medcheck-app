import { useEffect, useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface DataUpdateNotificationProps {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'loading';
  duration?: number;
  onClose?: () => void;
}

export function DataUpdateNotification({
  show,
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: DataUpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300); // Aguarda animação de saída
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          badgeColor: 'bg-green-600/20 text-green-100',
        };
      case 'loading':
        return {
          icon: RefreshCw,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          badgeColor: 'bg-blue-600/20 text-blue-100',
        };
      default:
        return {
          icon: RefreshCw,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          badgeColor: 'bg-gray-600/20 text-gray-100',
        };
    }
  };

  const { icon: Icon, bgColor, textColor, badgeColor } = getConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div
            className={`
            ${bgColor} ${textColor} 
            rounded-xl shadow-lg border border-white/20 
            p-4 backdrop-blur-sm
          `}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Icon
                  className={`h-5 w-5 ${type === 'loading' ? 'animate-spin' : ''}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{message}</p>
              </div>

              <Badge className={`${badgeColor} text-xs font-medium`}>Automático</Badge>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
