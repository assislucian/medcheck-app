import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Notification, useNotifications } from '@/contexts/NotificationContext';

interface NotificationCardProps {
  notification: Notification;
  fullWidth?: boolean;
}

export const NotificationCard = ({
  notification,
  fullWidth = false,
}: NotificationCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { markAsRead, removeNotification } = useNotifications();

  const getIconByType = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const handleCardClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const NotificationContent = () => (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIconByType()}
          <span className="font-medium">{notification.title}</span>
        </div>
        <div
          className={`transition-opacity duration-200 ${isHovering || !fullWidth ? 'opacity-100' : 'opacity-0'}`}
        >
          {!notification.read ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Marcar como lida</span>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remover</span>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">{getTimeAgo(notification.time)}</p>
        {notification.link && (
          <Button variant="ghost" size="sm" className="h-6 px-2 py-1 text-xs" asChild>
            <Link to={notification.link}>
              <span>Ver detalhes</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        'p-3 transition-all cursor-pointer hover:bg-accent',
        !notification.read && 'bg-primary/5 border-l-4 border-l-primary',
        fullWidth ? 'w-full' : 'w-80'
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <NotificationContent />
    </Card>
  );
};
