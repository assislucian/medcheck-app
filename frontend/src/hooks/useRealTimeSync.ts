/**
 * Hook profissional para sincronização em tempo real
 * Usa Server-Sent Events + BroadcastChannel como SaaS globais
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface RealTimeEvent {
  type: string;
  data?: any;
  timestamp: string;
}

interface UseRealTimeSyncOptions {
  onActivityUpdate?: () => void;
  onDataChange?: (event: RealTimeEvent) => void;
  enabled?: boolean;
}

/**
 * Hook profissional para sincronização em tempo real
 * Usa Server-Sent Events + BroadcastChannel como SaaS globais
 */
export const useRealTimeSync = (options: UseRealTimeSyncOptions = {}) => {
  const { onActivityUpdate, onDataChange, enabled = true } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Broadcast para outras abas
  const broadcastUpdate = useCallback((eventType: string, data: any = {}) => {
    if (broadcastChannelRef.current) {
      const event: RealTimeEvent = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      };

      broadcastChannelRef.current.postMessage(event);
      console.log('📡 Evento enviado para outras abas:', eventType, data);
    }
  }, []);

  // Notificar servidor sobre mudanças
  const notifyServer = useCallback(async (eventType: string, data: any = {}) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      await fetch(`${apiUrl}/api/v1/events/notify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          data,
        }),
      });
    } catch (error) {
      console.warn('Falha ao notificar servidor:', error);
    }
  }, []);

  // Função principal para disparar updates
  const triggerUpdate = useCallback(
    (eventType: string, data: any = {}) => {
      // 1. Executar callback local imediatamente
      if (onActivityUpdate) {
        onActivityUpdate();
      }

      // 2. Broadcast para outras abas
      broadcastUpdate(eventType, data);

      // 3. Notificar servidor (não blocking)
      notifyServer(eventType, data);

      // 4. Atualizar timestamp
      setLastUpdate(new Date());

      console.log('🔄 Update disparado:', eventType, data);
    },
    [onActivityUpdate, broadcastUpdate, notifyServer]
  );

  // Inicializar conexões
  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token não encontrado - não é possível conectar ao tempo real');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // 1. Inicializar BroadcastChannel (sync entre abas)
    try {
      broadcastChannelRef.current = new BroadcastChannel('medcheck-updates');

      broadcastChannelRef.current.onmessage = (event) => {
        const realTimeEvent = event.data as RealTimeEvent;
        console.log('📨 Evento recebido de outra aba:', realTimeEvent);

        // Executar callback
        if (onDataChange) {
          onDataChange(realTimeEvent);
        }

        // Auto-refresh específico para atividades
        if (
          realTimeEvent.type.includes('activity') ||
          realTimeEvent.type.includes('delete') ||
          realTimeEvent.type.includes('upload')
        ) {
          if (onActivityUpdate) {
            onActivityUpdate();
          }
        }

        setLastUpdate(new Date());
      };

      console.log('✅ BroadcastChannel inicializado');
    } catch (error) {
      console.warn('BroadcastChannel não suportado:', error);
    }

    // 2. Inicializar Server-Sent Events (updates do servidor) - apenas se tiver token
    if (token && token.trim()) {
      try {
        eventSourceRef.current = new EventSource(
          `${apiUrl}/api/v1/events/stream?token=${token}`
        );

        eventSourceRef.current.onopen = () => {
          setIsConnected(true);
          console.log('✅ Conectado ao servidor em tempo real');
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
              console.log('🎯 Tempo real ativo:', data.message);
            } else if (data.type === 'heartbeat') {
              // Heartbeat silencioso para manter conexão
            } else {
              // Eventos reais de dados
              if (onDataChange) {
                onDataChange({
                  type: data.type,
                  data: data.data,
                  timestamp: data.timestamp,
                });
              }
            }
          } catch (error) {
            console.warn('Erro ao processar SSE:', error);
          }
        };

        eventSourceRef.current.onerror = (error) => {
          setIsConnected(false);
          console.warn('Erro na conexão SSE:', error);

          // Reconectar automaticamente após 5s
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              console.log('🔄 Tentando reconectar...');
              // A reconexão será feita quando o useEffect rodar novamente
            }
          }, 5000);
        };
      } catch (error) {
        console.warn('Erro ao inicializar SSE:', error);
      }
    } else {
      console.log('⚠️ SSE não inicializado: token não disponível');
    }

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }

      setIsConnected(false);
    };
  }, [enabled, onActivityUpdate, onDataChange]);

  return {
    isConnected,
    lastUpdate,
    triggerUpdate,
    broadcastUpdate,
    notifyServer,
  };
};

// Eventos padrão do sistema
export const REAL_TIME_EVENTS = {
  GUIA_DELETED: 'guia_deleted',
  GUIA_UPLOADED: 'guia_uploaded',
  DEMONSTRATIVE_DELETED: 'demonstrative_deleted',
  DEMONSTRATIVE_UPLOADED: 'demonstrative_uploaded',
  ACTIVITY_LOGGED: 'activity_logged',
  DATA_UPDATED: 'data_updated',
} as const;
