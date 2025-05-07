
/**
 * AuthContext.ts
 * 
 * Re-exporta o contexto de autenticação de auth/AuthContext.tsx
 * para manter compatibilidade com a estrutura de importação existente.
 */

// This is a re-export file to maintain backward compatibility with existing imports
export { AuthProvider, useAuth } from './auth/AuthContext';
export type { AuthContextProps } from './auth/types';
