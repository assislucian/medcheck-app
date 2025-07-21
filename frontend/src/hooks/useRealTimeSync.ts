/**
 * Hook profissional para sincronização em tempo real
 * Usa Server-Sent Events + BroadcastChannel como SaaS globais
 * TEMPORARIAMENTE DESABILITADO SSE - apenas BroadcastChannel ativo
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

  // Notificar servidor sobre mudanças (DESABILITADO)
  const notifyServer = useCallback(async (eventType: string, data: any = {}) => {
    // TEMPORARIAMENTE DESABILITADO - backend não possui endpoint
    console.log('📝 Notificação servidor (simulada):', eventType, data);
    return Promise.resolve();
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

      // 3. Simular notificação servidor (sem erro)
      notifyServer(eventType, data);

      // 4. Atualizar timestamp
      setLastUpdate(new Date());

      console.log('🔄 Update disparado:', eventType, data);
    },
    [onActivityUpdate, broadcastUpdate, notifyServer]
  );

  // Inicializar conexões (APENAS BROADCASTCHANNEL)
  useEffect(() => {
    if (!enabled) return;

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
      // Simular conexão ativa
      setIsConnected(true);
    } catch (error) {
      console.warn('BroadcastChannel não suportado:', error);
    }

    // 2. SSE TEMPORARIAMENTE DESABILITADO
    // Evita erros de conexão com endpoint inexistente
    console.log('ℹ️ SSE desabilitado temporariamente - apenas sync local ativo');

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
