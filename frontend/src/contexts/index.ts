/**
 * index.ts
 *
 * Re-exporta o contexto de autenticação para manter compatibilidade
 * com a estrutura de importação existente.
 */

// Re-export from AuthContext.ts to maintain the existing import structure
export { AuthProvider, useAuth } from './AuthContext';
export type { AuthContextProps } from './auth/types';
