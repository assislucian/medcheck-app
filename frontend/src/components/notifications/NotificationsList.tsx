import { NotificationCard } from './NotificationCard';
import { EmptyNotifications } from './EmptyNotifications';
import { Notification } from '@/contexts/NotificationContext';

interface NotificationsListProps {
  notifications: Notification[];
}

export const NotificationsList = ({ notifications }: NotificationsListProps) => {
  if (!notifications.length) {
    return <EmptyNotifications />;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} fullWidth />
      ))}
    </div>
  );
};
