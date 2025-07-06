import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RealTimeSyncConfig {
  enabled?: boolean;
  pollInterval?: number;
  maxRetries?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface ProcessingUpdate {
  type: 'upload_complete' | 'processing_complete' | 'error' | 'progress';
  data: {
    job_id?: string;
    user_id?: string;
    success?: boolean;
    progress?: number;
    message?: string;
    affectedQueries?: string[];
  };
}

/**
 * Hook para sincronização de dados em tempo real após uploads e processamentos
 * Implementa WebSockets com fallback para polling seguindo as melhores práticas
 */
export function useRealTimeSync(config: RealTimeSyncConfig = {}) {
  const {
    enabled = true,
    pollInterval = 5000,
    maxRetries = 3,
    onConnect,
    onDisconnect,
    onError,
  } = config;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Invalida queries relacionadas baseadas no tipo de atualização
   */
  const invalidateRelatedQueries = useCallback(
    (affectedQueries?: string[]) => {
      const defaultQueries = [
        'dashboardStats',
        'demonstrativos',
        'guias',
        'activity-logs',
      ];

      const queriesToInvalidate = affectedQueries || defaultQueries;

      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Força refetch imediato para dados críticos
      queryClient.refetchQueries({
        queryKey: ['dashboardStats'],
        type: 'active',
      });

      console.log('🔄 Dados sincronizados:', queriesToInvalidate);
    },
    [queryClient]
  );

  /**
   * Processa atualizações recebidas via WebSocket ou polling
   */
  const handleUpdate = useCallback(
    (update: ProcessingUpdate) => {
      console.log('📡 Atualização recebida:', update);

      switch (update.type) {
        case 'upload_complete':
          invalidateRelatedQueries(update.data.affectedQueries);
          toast.success('Upload processado!', {
            description: update.data.message || 'Dados atualizados automaticamente',
          });
          break;

        case 'processing_complete':
          invalidateRelatedQueries(update.data.affectedQueries);
          toast.success('Processamento concluído!', {
            description: update.data.message || 'Novos dados disponíveis',
          });
          break;

        case 'progress':
          // Atualiza progresso sem invalidar cache
          console.log(`⏳ Progresso: ${update.data.progress}%`);
          break;

        case 'error':
          toast.error('Erro no processamento', {
            description: update.data.message || 'Verifique os logs para mais detalhes',
          });
          break;
      }
    },
    [invalidateRelatedQueries]
  );

  /**
   * Conecta via WebSocket (atualmente desabilitado - usa polling)
   */
  const connectWebSocket = useCallback(() => {
    if (!enabled) return;

    // Por enquanto, inicia diretamente com polling
    // WebSocket será implementado quando o backend suportar
    console.log('📡 Iniciando sincronização via polling');
    startPolling();
    onConnect?.();
  }, [enabled, onConnect]);

  /**
   * Inicia polling inteligente
   */
  const startPolling = useCallback(() => {
    if (!enabled || pollIntervalRef.current) return;

    console.log('🔄 Iniciando sincronização automática');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Simula verificação de atualizações através de timestamp
        const lastSync = localStorage.getItem('lastDataSync');
        const currentTime = Date.now();

        // Se passou mais de 30 segundos desde a última sincronização manual
        // ou se nunca houve sincronização, força uma atualização
        if (!lastSync || currentTime - parseInt(lastSync) > 30000) {
          invalidateRelatedQueries();
          localStorage.setItem('lastDataSync', currentTime.toString());
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, pollInterval);
  }, [enabled, pollInterval, invalidateRelatedQueries]);

  /**
   * Para polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Desconecta WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Força sincronização manual
   */
  const forceSync = useCallback(() => {
    invalidateRelatedQueries();
    localStorage.setItem('lastDataSync', Date.now().toString());
    toast.success('Dados atualizados!');
  }, [invalidateRelatedQueries]);

  /**
   * Escuta eventos customizados de upload
   */
  useEffect(() => {
    const handleUploadComplete = () => {
      console.log('🎯 Upload detectado, sincronizando dados...');
      invalidateRelatedQueries();
      localStorage.setItem('lastDataSync', Date.now().toString());

      // Dispara evento para mostrar notificação
      window.dispatchEvent(
        new CustomEvent('dataAutoUpdate', {
          detail: { message: 'Dados atualizados após upload', type: 'success' },
        })
      );
    };

    const handleForceRefresh = () => {
      console.log('🔄 Refresh forçado detectado');
      invalidateRelatedQueries();
      localStorage.setItem('lastDataSync', Date.now().toString());
    };

    window.addEventListener('uploadComplete', handleUploadComplete);
    window.addEventListener('forceDataRefresh', handleForceRefresh);

    return () => {
      window.removeEventListener('uploadComplete', handleUploadComplete);
      window.removeEventListener('forceDataRefresh', handleForceRefresh);
    };
  }, [invalidateRelatedQueries]);

  // Setup inicial
  useEffect(() => {
    if (!enabled) return;

    // Tenta WebSocket primeiro
    connectWebSocket();

    // Cleanup
    return () => {
      disconnectWebSocket();
      stopPolling();
    };
  }, [enabled, connectWebSocket, disconnectWebSocket, stopPolling]);

  // Cleanup geral
  useEffect(() => {
    return () => {
      disconnectWebSocket();
      stopPolling();
    };
  }, [disconnectWebSocket, stopPolling]);

  return {
    forceSync,
    isConnected: pollIntervalRef.current !== null,
    connectionType: pollIntervalRef.current !== null ? 'polling' : 'offline',
  };
}
