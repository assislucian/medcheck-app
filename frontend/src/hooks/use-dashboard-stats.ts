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
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };

        // Nova rota consolidada
        const res = await fetch(`${apiUrl}/api/v1/dashboard`, { headers });
        if (!res.ok) {
          if (res.status === 401) {
            const error: any = new Error('Não autenticado');
            error.isUnauthorized = true;
            throw error;
          }
          throw new Error('Erro ao buscar resumo do dashboard');
        }
        const payload = await res.json();

        const mappedProcedures = (payload.procedures || []).map((p: any): any => {
          const valorCBHPM = p.valorTabela2015 ?? p.valorCBHPM ?? 0;
          const valorPago = p.valorPago ?? p.liberado ?? 0;
          const diferenca =
            valorCBHPM > 0 ? ((valorPago - valorCBHPM) / valorCBHPM) * 100 : 0;
          return {
            id: p.id ?? `${p.codigo}-${p.guia}`,
            codigo: p.codigo,
            procedimento: p.descricao || p.procedimento || '',
            papel: p.funcao || p.papel || '--',
            valorCBHPM,
            valorPago,
            diferenca,
            pago: !!p.pago,
            guia: p.guia,
            beneficiario: p.beneficiario || '',
            doctors: [],
          };
        });

        const totals = payload.totals || {};
        if (!totals.totalRecebido && mappedProcedures.length) {
          totals.totalRecebido = mappedProcedures.reduce(
            (acc, p) => acc + (p.valorPago || 0),
            0
          );
        }
        if (!totals.totalProcedimentos) {
          totals.totalProcedimentos = mappedProcedures.length;
        }
        if (!totals.totalGlosado && Array.isArray(payload.glosas)) {
          totals.totalGlosado = payload.glosas.reduce(
            (acc: number, g: any) => acc + (g.valorGlosa || 0),
            0
          );
        }

        return {
          totals: {
            totalRecebido: totals.totalRecebido || 0,
            totalGlosado: totals.totalGlosado || 0,
            totalProcedimentos: totals.totalProcedimentos || 0,
            auditoriaPendente: totals.auditoriaPendente || 0,
          },
          procedures: mappedProcedures,
          glosas: payload.glosas || [],
          hasData: payload.hasData,
          message: payload.message,
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
    enabled: !!session?.access_token, // Só executa a query se houver token
  });
}
