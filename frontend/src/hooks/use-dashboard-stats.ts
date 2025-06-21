import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '../types/medical';
import { useAuth } from '../contexts/auth/AuthContext';

export function useDashboardStats() {
  const { session } = useAuth();

  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error('Não autenticado');
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        };

        // Primeiro tenta buscar os demonstrativos
        const demonstrativosRes = await fetch(`${apiUrl}/api/v1/demonstrativos`, { headers });
        if (!demonstrativosRes.ok) {
          if (demonstrativosRes.status === 401) {
            const error: any = new Error('Não autenticado');
            error.isUnauthorized = true;
            throw error;
          }
          throw new Error('Erro ao buscar demonstrativos');
        }
        const demonstrativos = await demonstrativosRes.json();

        // Depois busca os detalhes do primeiro demonstrativo
        const detalhesRes = await fetch(`${apiUrl}/api/v1/demonstrativos/1/detalhes`, { headers });
        if (!detalhesRes.ok) {
          if (detalhesRes.status === 401) {
            const error: any = new Error('Não autenticado');
            error.isUnauthorized = true;
            throw error;
          }
          throw new Error('Erro ao buscar detalhes');
        }
        const detalhes = await detalhesRes.json();

        // Combina os dados
        return {
          totals: {
            totalRecebido: demonstrativos.totalRecebido || 0,
            totalGlosado: demonstrativos.totalGlosado || 0,
            totalRecuperado: demonstrativos.totalRecuperado || 11159.00, // Valor fixo temporário
            potencialRecuperacao: demonstrativos.potencialRecuperacao || 167.68, // Valor da glosa pendente
            tempoEconomizado: 80,
            taxaSucesso: 99
          },
          procedures: detalhes.procedures || [],
          glosas: detalhes.glosas || []
        };
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        if (error.isUnauthorized) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error('Erro ao carregar dados do dashboard');
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 segundos
    cacheTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!session?.access_token // Só executa a query se houver token
  });
}
