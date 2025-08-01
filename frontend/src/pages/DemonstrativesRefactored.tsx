/**
 * Página de Demonstrativos REFATORADA
 * Redução de 1858 linhas para ~150 linhas usando componentes focados
 */
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { usePageSetup } from '../hooks/usePageSetup';
import { useDemonstratives } from '../hooks/useDemonstratives';
import { DemonstrativesHeader } from '../components/demonstratives/DemonstrativesHeader';
import { DemonstrativesStats } from '../components/demonstratives/DemonstrativesStats';
import { DemonstrativesFilters } from '../components/demonstratives/DemonstrativesFilters';
import { DemonstrativesUpload } from '../components/demonstratives/DemonstrativesUpload';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SkeletonInfoCard } from '../components/ui/SkeletonInfoCard';
import { 
  FileText, 
  Eye, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  Download
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { Helmet } from 'react-helmet-async';

const DemonstrativesRefactored = () => {
  // Setup da página
  usePageSetup('demonstratives');

  // Hook centralizado
  const {
    demonstratives,
    filteredDemonstratives,
    loading,
    filters,
    stats,
    updateFilter,
    clearFilters,
    fetchDemonstratives,
    deleteDemonstrative,
  } = useDemonstratives();

  if (loading) {
    return (
      <AuthenticatedLayout
        title="Central de Demonstrativos"
        description="Carregando seus demonstrativos..."
      >
        <div className="space-y-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonInfoCard key={idx} />
            ))}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestão de Demonstrativos | MedCheck</title>
        <meta
          name="description"
          content="Central de análise e gerenciamento de demonstrativos de pagamento médico"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-teal-50/30">
        <AuthenticatedLayout
          title="Central de Demonstrativos"
          description="Gerencie e analise seus demonstrativos de pagamento com total transparência"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <DemonstrativesHeader
              totalDemonstratives={demonstratives.length}
              totalProcessed={stats.totalProcessado}
              totalGlosas={stats.totalGlosa}
              filteredCount={filteredDemonstratives.length}
            />

            {/* Upload */}
            {demonstratives.length === 0 && (
              <div className="max-w-2xl mx-auto">
                <DemonstrativesUpload onUploadSuccess={fetchDemonstratives} />
              </div>
            )}

            {/* Content */}
            {demonstratives.length > 0 && (
              <div className="space-y-8">
                {/* Stats */}
                <DemonstrativesStats stats={stats} />

                {/* Upload + Filters */}
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <DemonstrativesUpload onUploadSuccess={fetchDemonstratives} />
                  </div>
                  <div className="lg:col-span-2">
                    <DemonstrativesFilters
                      searchTerm={filters.searchTerm}
                      setSearchTerm={(value) => updateFilter('searchTerm', value)}
                      selectedStatus={filters.selectedStatus}
                      setSelectedStatus={(value) => updateFilter('selectedStatus', value)}
                      selectedPeriod={filters.selectedPeriod}
                      setSelectedPeriod={(value) => updateFilter('selectedPeriod', value)}
                      startDate={filters.startDate}
                      setStartDate={(value) => updateFilter('startDate', value)}
                      endDate={filters.endDate}
                      setEndDate={(value) => updateFilter('endDate', value)}
                      onRefresh={fetchDemonstratives}
                      totalCount={demonstratives.length}
                      filteredCount={filteredDemonstratives.length}
                    />
                  </div>
                </div>

                {/* Results Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Demonstrativos ({filteredDemonstratives.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredDemonstratives.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum demonstrativo encontrado
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {demonstratives.length === 0
                            ? 'Faça upload dos seus primeiros demonstrativos'
                            : 'Tente ajustar os filtros ou fazer novo upload'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Período</th>
                              <th className="text-left py-3 px-4">Apresentado</th>
                              <th className="text-left py-3 px-4">Liberado</th>
                              <th className="text-left py-3 px-4">Glosas</th>
                              <th className="text-left py-3 px-4">Procedimentos</th>
                              <th className="text-left py-3 px-4">Status</th>
                              <th className="text-left py-3 px-4">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDemonstratives.map((demo) => (
                              <tr key={demo.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium">{demo.periodo}</div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(demo.upload_time).toLocaleDateString()}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium">
                                    {formatCurrency(demo.total_presented)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(demo.total_approved)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-red-600">
                                    {formatCurrency(demo.total_glosa)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium">
                                    {demo.total_procedures}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    variant={demo.total_glosa > 0 ? "destructive" : "default"}
                                  >
                                    {demo.total_glosa > 0 ? "Com Glosas" : "Liberado"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => deleteDemonstrative(demo.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default DemonstrativesRefactored;