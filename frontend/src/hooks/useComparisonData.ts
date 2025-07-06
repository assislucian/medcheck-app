import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { fetchComparisonData } from '@/utils/comparisonSupabase';

/**
 * Custom hook to fetch CBHPM comparison data for a specific analysis
 * Enhanced with secure handling of user metadata and error validation
 *
 * @param analysisId The ID of the analysis to fetch comparison data for
 */
export function useComparisonData(analysisId: string | null) {
  const { user, userProfile } = useAuth();

  // Get CRM from user profile for enhanced security (preferred) or fallback to metadata
  const crm = userProfile?.crm || user?.user_metadata?.crm || null;

  // Get role from user metadata with validation
  const role = user?.user_metadata?.role || 'cirurgiao'; // Default to cirurgiao for demo

  console.log('useComparisonData hook called with:', { analysisId, crm, role });

  return useQuery({
    queryKey: ['cbhpm-comparison', analysisId, crm, role],
    queryFn: async (): Promise<any | null> => {
      try {
        if (!analysisId) {
          throw new Error('ID de análise não fornecido');
        }

        if (!crm) {
          throw new Error('CRM não encontrado no perfil do usuário');
        }

        // Check if role is valid
        const validRoles = [
          'cirurgiao',
          'primeiro_auxiliar',
          'segundo_auxiliar',
          'anestesista',
        ];
        if (!validRoles.includes(role)) {
          console.warn(
            `Role "${role}" não reconhecida, usando "cirurgiao" como padrão`
          );
        }

        const data = await fetchComparisonData(analysisId, crm, role);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar comparativo';
        console.error('Error in useComparisonData:', errorMessage);

        toast.error('Falha ao carregar comparativo CBHPM', {
          description: errorMessage,
        });

        throw error;
      }
    },
    enabled: !!analysisId && !!crm,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
