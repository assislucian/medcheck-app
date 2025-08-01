import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Activity,
  Database,
  Cloud,
} from 'lucide-react';
import { toast } from 'sonner';

interface SyncStatus {
  connected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

interface DataUpdate {
  type: 'glosas' | 'demonstrativos' | 'guias' | 'alerts';
  timestamp: Date;
  count: number;
  priority: 'high' | 'normal' | 'low';
}

export function RealTimeDataSync({ onDataUpdate }: { onDataUpdate?: (update: DataUpdate) => void }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    connectionQuality: 'offline',
  });

  const [recentUpdates, setRecentUpdates] = useState<DataUpdate[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simular conexão WebSocket para updates em tempo real
  const connectWebSocket = () => {
    try {
      // Em um ambiente real, seria: const ws = new WebSocket(WS_URL);
      // Para demonstração, vamos simular
      simulateWebSocketConnection();
      
      setSyncStatus(prev => ({
        ...prev,
        connected: true,
        connectionQuality: 'excellent',
      }));

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        connectionQuality: 'offline',
      }));
      
      // Tentar reconectar em 5 segundos
      retryTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    }
  };

  const simulateWebSocketConnection = () => {
    // Simular recebimento de updates periódicos
    syncIntervalRef.current = setInterval(() => {
      // Simular diferentes tipos de updates
      const updateTypes: DataUpdate['type'][] = ['glosas', 'demonstrativos', 'guias', 'alerts'];
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      const randomCount = Math.floor(Math.random() * 5) + 1;
      const randomPriority: DataUpdate['priority'] = Math.random() > 0.7 ? 'high' : 'normal';

      const update: DataUpdate = {
        type: randomType,
        timestamp: new Date(),
        count: randomCount,
        priority: randomPriority,
      };

      // Adicionar à lista de updates recentes
      setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Manter apenas os 10 mais recentes

      // Atualizar status de sync
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges: Math.max(0, prev.pendingChanges - randomCount),
      }));

      // Notificar componente pai
      if (onDataUpdate) {
        onDataUpdate(update);
      }

      // Mostrar notificação para updates importantes
      if (randomPriority === 'high') {
        toast.info(`${randomCount} nova(s) ${getUpdateTypeLabel(randomType)} detectada(s)`, {
          duration: 3000,
        });
      }

    }, Math.random() * 10000 + 5000); // Entre 5-15 segundos
  };

  const getUpdateTypeLabel = (type: DataUpdate['type']) => {
    switch (type) {
      case 'glosas': return 'glosa(s)';
      case 'demonstrativos': return 'demonstrativo(s)';
      case 'guias': return 'guia(s)';
      case 'alerts': return 'alerta(s)';
    }
  };

  const getUpdateTypeIcon = (type: DataUpdate['type']) => {
    switch (type) {
      case 'glosas': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'demonstrativos': return <Database className="h-4 w-4 text-blue-500" />;
      case 'guias': return <Activity className="h-4 w-4 text-green-500" />;
      case 'alerts': return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const manualSync = async () => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
    
    try {
      // Simular sincronização manual
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingChanges: 0,
      }));

      toast.success('Dados sincronizados com sucesso!');
      
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
      toast.error('Erro na sincronização. Tente novamente.');
    }
  };

  const getConnectionStatusColor = () => {
    switch (syncStatus.connectionQuality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'poor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getConnectionStatusText = () => {
    switch (syncStatus.connectionQuality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'poor': return 'Instável';
      case 'offline': return 'Offline';
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {syncStatus.connected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Sincronização em Tempo Real
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getConnectionStatusColor()}>
              {getConnectionStatusText()}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={manualSync}
              disabled={syncStatus.syncInProgress}
              className="h-8"
            >
              {syncStatus.syncInProgress ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-800">
              {syncStatus.lastSync ? formatTimeAgo(syncStatus.lastSync) : 'Nunca'}
            </div>
            <div className="text-xs text-blue-600">Última sync</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-1">
              <Database className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-purple-800">
              {syncStatus.pendingChanges}
            </div>
            <div className="text-xs text-purple-600">Pendentes</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-1">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-800">
              {recentUpdates.length}
            </div>
            <div className="text-xs text-green-600">Updates hoje</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Feed de Updates Recentes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade Recente
          </h4>
          
          {recentUpdates.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aguardando atualizações...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentUpdates.map((update, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg border text-sm ${
                    update.priority === 'high'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {getUpdateTypeIcon(update.type)}
                  <div className="flex-1">
                    <span className="font-medium">
                      {update.count} nova(s) {getUpdateTypeLabel(update.type)}
                    </span>
                    <div className="text-xs text-gray-600">
                      {formatTimeAgo(update.timestamp)}
                    </div>
                  </div>
                  {update.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      Urgente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}