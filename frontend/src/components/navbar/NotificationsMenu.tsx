import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { EmptyNotifications } from '@/components/notifications/EmptyNotifications';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationsMenu = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex items-center text-xs gap-1"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-4 w-4" />
                <span>Marcar todas como lidas</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex items-center text-xs gap-1 text-destructive hover:text-destructive"
                onClick={() => clearNotifications()}
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar tudo</span>
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px] overflow-y-auto p-1">
          {notifications.length > 0 ? (
            <DropdownMenuGroup className="space-y-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-transparent cursor-default"
                >
                  <NotificationCard notification={notification} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <EmptyNotifications />
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link to="/notifications">Ver todas as notificações</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
