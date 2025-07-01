import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProceduresTable } from './comparison/ProceduresTable';
import { SummaryCards } from './comparison/SummaryCards';
import { ComparisonHeader } from './comparison/ComparisonHeader';
import { DemonstrativeInfo } from './comparison/DemonstrativeInfo';
import { getExtractedData } from '@/services/analysisService';
import { ExtractedData } from '@/types/upload';
import { Procedure } from '@/types/medical';
import { Skeleton } from '@/components/ui/skeleton';

interface ComparisonViewProps {
  analysisId?: string | null;
}

/**
 * ComparisonView Component
 *
 * Exibe os resultados da comparação entre as guias e demonstrativos,
 * mostrando valores CBHPM x valores pagos e destacando diferenças.
 */
const ComparisonView = ({ analysisId }: ComparisonViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ExtractedData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const extractedData = await getExtractedData(analysisId);
        setData(extractedData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [analysisId]);

  if (isLoading) {
    return (
      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="pb-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 bg-white shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Erro ao carregar dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-red-50 p-4 rounded-2xl inline-block mb-4">
              <div className="text-red-600 text-2xl">⚠️</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Não foi possível carregar os dados
            </h3>
            <p className="text-gray-600 mb-6">
              Por favor, tente processar os arquivos novamente ou entre em contato com o
              suporte.
            </p>
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all">
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardHeader className="pb-6">
        <ComparisonHeader
          totalProcedimentos={data.procedimentos.length}
          hospital={data.demonstrativoInfo?.hospital}
          competencia={data.demonstrativoInfo?.competencia}
        />
      </CardHeader>
      <CardContent className="space-y-8">
        <SummaryCards
          totalCBHPM={data.totais.valorCBHPM}
          totalPago={data.totais.valorPago}
          totalDiferenca={data.totais.diferenca}
          procedimentosNaoPagos={data.totais.procedimentosNaoPagos}
        />

        <DemonstrativeInfo info={data.demonstrativoInfo} />

        <div className="bg-gray-50/50 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Detalhamento dos Procedimentos
            </h3>
            <p className="text-gray-600">
              Análise detalhada de cada procedimento com comparação CBHPM vs valor pago
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ProceduresTable
              procedimentos={data.procedimentos as unknown as Procedure[]}
              isDetailView={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonView;
