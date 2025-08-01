/**
 * Filtros da página de Demonstrativos
 * Componente isolado para controle de filtros
 */
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Search, Filter, Calendar, RefreshCw } from 'lucide-react';

interface DemonstrativesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onRefresh: () => void;
  totalCount: number;
  filteredCount: number;
}

export function DemonstrativesFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedPeriod,
  setSelectedPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRefresh,
  totalCount,
  filteredCount
}: DemonstrativesFiltersProps) {
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filteredCount} de {totalCount} demonstrativos
          </span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Busca */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              placeholder="Período, arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="liberado">Liberado</SelectItem>
              <SelectItem value="glosado">Com Glosas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Período Pré-definido */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Início */}
        <div className="space-y-2">
          <Label htmlFor="start-date">Data Início</Label>
          <div className="relative">
            <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <Label htmlFor="end-date">Data Fim</Label>
          <div className="relative">
            <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <Button variant="ghost" onClick={clearFilters}>
          Limpar Filtros
        </Button>
        
        <div className="text-sm text-gray-500">
          {filteredCount === totalCount 
            ? `Mostrando todos os ${totalCount} demonstrativos`
            : `${filteredCount} de ${totalCount} demonstrativos filtrados`
          }
        </div>
      </div>
    </div>
  );
}