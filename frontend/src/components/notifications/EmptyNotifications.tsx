import { BellOff } from 'lucide-react';

export const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <BellOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-sm">Nenhuma notificação</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Você não tem nenhuma notificação no momento.
      </p>
    </div>
  );
};
