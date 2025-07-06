import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Define the context value type
export interface Notification {
  id: string;
  title: string;
  message: string;
  description: string; // Added this field
  time: string; // Added this field
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string; // Added this field
  data?: Record<string, any>;
}

// Define the context value type
interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  clearNotifications: () => void; // Added this method
  removeNotification: (id: string) => void; // Added this method
  addNotification: (
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => void; // Added this method
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

// Provider component
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notification data - would be replaced with real API call
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Nova análise concluída',
      message: 'Sua análise de contracheque foi processada com sucesso.',
      description: 'Sua análise de contracheque foi processada com sucesso.',
      read: false,
      createdAt: new Date().toISOString(),
      time: new Date().toISOString(),
      type: 'success',
    },
    {
      id: '2',
      title: 'Atualização disponível',
      message: 'Uma nova versão do sistema está disponível.',
      description: 'Uma nova versão do sistema está disponível.',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      time: new Date(Date.now() - 86400000).toISOString(),
      type: 'info',
    },
    {
      id: '3',
      title: 'Discrepância detectada',
      message: 'Encontramos uma discrepância em seu último pagamento.',
      description: 'Encontramos uma discrepância em seu último pagamento.',
      read: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      time: new Date(Date.now() - 172800000).toISOString(),
      type: 'warning',
    },
  ];

  // Fetch notifications from API/mock
  const fetchNotifications = async () => {
    try {
      // This would be replaced with a real API call
      setNotifications(mockNotifications);
      updateUnreadCount(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Update unread count
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter((notification) => !notification.read).length;
    setUnreadCount(count);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Add a new notification
  const addNotification = (
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => {
    const now = new Date();
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      read: false,
      createdAt: now.toISOString(),
      time: now.toISOString(),
      ...notification,
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const value = {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    clearNotifications,
    removeNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
