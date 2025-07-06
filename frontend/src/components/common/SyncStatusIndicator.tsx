import { useRealTimeSyncContext } from '@/providers/RealTimeSyncProvider';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SyncStatusIndicatorProps {
  showLabel?: boolean;
  compact?: boolean;
}

export function SyncStatusIndicator({
  showLabel = false,
  compact = false,
}: SyncStatusIndicatorProps) {
  const { forceSync, isConnected, connectionType } = useRealTimeSyncContext();

  const getStatusConfig = () => {
    if (isConnected && connectionType === 'websocket') {
      return {
        icon: Wifi,
        color: 'bg-green-500',
        text: 'Tempo real ativo',
        description: 'Dados sincronizados automaticamente via WebSocket',
      };
    }

    if (connectionType === 'polling') {
      return {
        icon: Clock,
        color: 'bg-yellow-500',
        text: 'Sincronização periódica',
        description: 'Dados atualizados a cada 5 segundos',
      };
    }

    return {
      icon: WifiOff,
      color: 'bg-red-500',
      text: 'Desconectado',
      description: 'Sincronização offline - atualize manualmente',
    };
  };

  const { icon: StatusIcon, color, text, description } = getStatusConfig();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={forceSync}
              className="h-8 w-8 p-0"
            >
              <div className="relative">
                <StatusIcon className="h-4 w-4" />
                <div
                  className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${color}`}
                />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">{text}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
              <div className="text-xs mt-1">Clique para atualizar</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="flex items-center gap-2 cursor-help">
              <div className="relative">
                <StatusIcon className="h-3 w-3" />
                <div
                  className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${color}`}
                />
              </div>
              {showLabel && <span className="text-xs">{text}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">{text}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={forceSync}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">Forçar atualização</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
