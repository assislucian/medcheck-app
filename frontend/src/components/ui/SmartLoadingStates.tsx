import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Brain, 
  BarChart3,
  Activity,
  Target,
  AlertTriangle
} from 'lucide-react';

interface SmartSkeletonProps {
  variant: 'dashboard' | 'table' | 'analytics' | 'list' | 'chart' | 'card' | 'financial';
  count?: number;
  className?: string;
}

export function SmartSkeleton({ variant, count = 1, className }: SmartSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header com título animado */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
                <Skeleton className="h-6 w-48 animate-pulse" />
              </div>
              <Skeleton className="h-4 w-96 animate-pulse" />
            </div>

            {/* Cards de métricas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        {i === 0 && <DollarSign className="h-6 w-6 text-blue-600" />}
                        {i === 1 && <TrendingUp className="h-6 w-6 text-green-600" />}
                        {i === 2 && <FileText className="h-6 w-6 text-purple-600" />}
                        {i === 3 && <Activity className="h-6 w-6 text-orange-600" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Área de alertas */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-96" />
                        <Skeleton className="h-6 w-20 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    </div>
                    <Skeleton className="h-8 w-20 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-end gap-2">
                  {[...Array(12)].map((_, i) => (
                    <Skeleton 
                      key={i} 
                      className="flex-1"
                      style={{ height: `${Math.random() * 200 + 40}px` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Tabela */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {/* Header da tabela */}
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  
                  {/* Linhas da tabela */}
                  {[...Array(count)].map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráficos */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-center gap-2">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton 
                        key={i} 
                        className="w-8"
                        style={{ height: `${Math.random() * 200 + 40}px` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-96" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'chart':
        return (
          <Card className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end gap-1">
                {[...Array(20)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1"
                    style={{ height: `${Math.random() * 250 + 30}px` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'card':
      default:
        return (
          <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2">
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
}

// Loading específico para diferentes contextos médicos
export function MedicalLoadingState({ type }: { type: 'processing' | 'analyzing' | 'calculating' | 'uploading' }) {
  const getLoadingContent = () => {
    switch (type) {
      case 'processing':
        return {
          icon: <FileText className="h-8 w-8 text-blue-600 animate-bounce" />,
          title: 'Organizando suas Guias',
          description: 'Verificando procedimentos e valores CBHPM...',
        };
      case 'analyzing':
        return {
          icon: <Brain className="h-8 w-8 text-purple-600 animate-pulse" />,
          title: 'Analisando Honorários',
          description: 'Identificando glosas e oportunidades de recuperação...',
        };
      case 'calculating':
        return {
          icon: <BarChart3 className="h-8 w-8 text-green-600 animate-bounce" />,
          title: 'Calculando Resultados',
          description: 'Processando seus honorários e indicadores...',
        };
      case 'uploading':
        return {
          icon: <Target className="h-8 w-8 text-orange-600 animate-spin" />,
          title: 'Recebendo Arquivos',
          description: 'Preparando seus documentos para análise...',
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-sm text-gray-600 text-center max-w-md">
        {content.description}
      </p>
      <div className="mt-6 flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Estados vazios inteligentes
export function SmartEmptyState({ 
  type, 
  onAction 
}: { 
  type: 'glosas' | 'demonstrativos' | 'guias' | 'alerts';
  onAction?: () => void;
}) {
  const getEmptyContent = () => {
    switch (type) {
      case 'glosas':
        return {
          icon: <AlertTriangle className="h-16 w-16 text-green-500" />,
          title: 'Nenhuma Glosa Detectada! 🎉',
          description: 'Excelente! Todos os seus procedimentos foram pagos corretamente.',
          actionText: 'Verificar Histórico',
        };
      case 'demonstrativos':
        return {
          icon: <FileText className="h-16 w-16 text-blue-500" />,
          title: 'Adicione seus Demonstrativos',
          description: 'Envie seus demonstrativos de pagamento para análise automática de glosas.',
          actionText: 'Começar Análise',
        };
      case 'guias':
        return {
          icon: <Target className="h-16 w-16 text-purple-500" />,
          title: 'Adicione suas Guias Médicas',
          description: 'Envie suas guias TISS para verificação automática de procedimentos.',
          actionText: 'Analisar Guias',
        };
      case 'alerts':
        return {
          icon: <Brain className="h-16 w-16 text-green-500" />,
          title: 'Tudo em Ordem!',
          description: 'Nenhum alerta importante. Seus dados estão organizados e protegidos.',
          actionText: 'Ver Painel',
        };
    }
  };

  const content = getEmptyContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6">
        {content.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {content.title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md">
        {content.description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {content.actionText}
        </button>
      )}
    </div>
  );
}