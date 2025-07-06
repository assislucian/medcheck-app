import { createContext, useContext, ReactNode } from 'react';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';

interface RealTimeSyncContextValue {
  forceSync: () => void;
  isConnected: boolean;
  connectionType: 'websocket' | 'polling' | 'offline';
}

const RealTimeSyncContext = createContext<RealTimeSyncContextValue | null>(null);

interface RealTimeSyncProviderProps {
  children: ReactNode;
}

export function RealTimeSyncProvider({ children }: RealTimeSyncProviderProps) {
  const { forceSync, isConnected, connectionType } = useRealTimeSync({
    enabled: true,
    pollInterval: 5000, // 5 segundos para fallback
    maxRetries: 3,
    onConnect: () => {
      console.log('🔗 Sistema de sincronização conectado');
    },
    onDisconnect: () => {
      console.log('❌ Sistema de sincronização desconectado');
    },
    onError: (error) => {
      console.error('❌ Erro na sincronização:', error);
    },
  });

  const value: RealTimeSyncContextValue = {
    forceSync,
    isConnected,
    connectionType,
  };

  return (
    <RealTimeSyncContext.Provider value={value}>
      {children}
    </RealTimeSyncContext.Provider>
  );
}

export function useRealTimeSyncContext() {
  const context = useContext(RealTimeSyncContext);
  if (!context) {
    throw new Error(
      'useRealTimeSyncContext deve ser usado dentro de RealTimeSyncProvider'
    );
  }
  return context;
}
