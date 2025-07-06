import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

type AlertType = 'success' | 'error' | 'warning' | 'info';

export const showAlert = (
  title: string,
  message: string,
  type: AlertType = 'info',
  options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    onDismiss?: () => void;
    onAutoClose?: () => void;
  }
) => {
  const alertOptions: any = {
    duration: options?.duration || 5000,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  };

  if (options?.action) {
    alertOptions.action = options.action;
  }

  switch (type) {
    case 'success':
      toast.success(title, {
        description: message,
        ...alertOptions,
      });
      break;
    case 'error':
      toast.error(title, {
        description: message,
        ...alertOptions,
      });
      break;
    case 'warning':
      toast.warning(title, {
        description: message,
        ...alertOptions,
      });
      break;
    case 'info':
    default:
      toast.info(title, {
        description: message,
        ...alertOptions,
      });
      break;
  }
};

export const useAlert = () => {
  const { addNotification } = useNotifications();

  const showNotification = (
    title: string,
    description: string,
    type: AlertType = 'info',
    options?: {
      showToast?: boolean;
      link?: string;
      data?: Record<string, any>;
    }
  ) => {
    // Add notification to the context
    addNotification({
      title,
      message: description,
      description,
      type,
      time: new Date().toISOString(), // Add the missing time property
      link: options?.link,
      data: options?.data,
    });

    // Optionally show toast as well
    if (options?.showToast !== false) {
      showAlert(
        title,
        description,
        type,
        options?.link
          ? {
              action: {
                label: 'Ver',
                onClick: () => {
                  window.location.href = options.link!;
                },
              },
            }
          : undefined
      );
    }
  };

  return {
    showNotification,
    showSuccess: (
      title: string,
      description: string,
      options?: { showToast?: boolean; link?: string }
    ) => showNotification(title, description, 'success', options),
    showError: (
      title: string,
      description: string,
      options?: { showToast?: boolean; link?: string }
    ) => showNotification(title, description, 'error', options),
    showWarning: (
      title: string,
      description: string,
      options?: { showToast?: boolean; link?: string }
    ) => showNotification(title, description, 'warning', options),
    showInfo: (
      title: string,
      description: string,
      options?: { showToast?: boolean; link?: string }
    ) => showNotification(title, description, 'info', options),
  };
};
