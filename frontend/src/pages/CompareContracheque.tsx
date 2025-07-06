import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { fetchAnalysisById, fetchProceduresByAnalysisId } from '@/utils/supabase';
import { ExtractedData } from '@/types';
import ComparisonView from '@/components/ComparisonView';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { FileBarChart, FileText, Upload } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from 'react-router-dom';

const CompareContracheque = () => {
  const location = useLocation();
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract analysis ID from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('analysisId');
    setAnalysisId(id);
  }, [location]);

  return (
    <MainLayout title="Comparação">
      <Helmet>
        <title>Comparativo | MedCheck</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Comparativo de Pagamentos</h1>
            <p className="text-muted-foreground">
              Compare os valores pagos com os valores de referência CBHPM
            </p>
          </div>
        </div>

        {analysisId ? (
          <ComparisonView analysisId={analysisId} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Nova Análise</CardTitle>
              <CardDescription>
                Selecione os documentos para realizar uma nova análise comparativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center p-6 hover:bg-accent/5 transition-colors">
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Guias Médicas</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Faça upload de guias TISS para análise comparativa
                  </p>
                  <Button asChild>
                    <Link to="/guides?tab=upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload de Guias
                    </Link>
                  </Button>
                </Card>

                <Card className="flex flex-col items-center p-6 hover:bg-accent/5 transition-colors">
                  <FileBarChart className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Demonstrativos</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Faça upload de demonstrativos de pagamento para análise
                  </p>
                  <Button asChild>
                    <Link to="/demonstratives?tab=upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload de Demonstrativos
                    </Link>
                  </Button>
                </Card>
              </div>

              <div className="border-t pt-4 flex justify-center">
                <Link to="/history">Ver análises anteriores</Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default CompareContracheque;
