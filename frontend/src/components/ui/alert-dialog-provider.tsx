import React, { createContext, useContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertDialogContextType {
  showAlert: (props: {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider');
  }
  return context;
};

export const AlertDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [alertProps, setAlertProps] = useState({
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'default' as 'default' | 'destructive',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlert = ({
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'default',
    onConfirm = () => {},
    onCancel = () => {},
  }) => {
    setAlertProps({
      title,
      description,
      confirmLabel,
      cancelLabel,
      variant: variant as 'default' | 'destructive', // Fix the type casting here
      onConfirm,
      onCancel,
    });
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    alertProps.onConfirm();
  };

  const handleCancel = () => {
    setOpen(false);
    alertProps.onCancel();
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertProps.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertProps.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {alertProps.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                alertProps.variant === 'destructive'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {alertProps.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};
