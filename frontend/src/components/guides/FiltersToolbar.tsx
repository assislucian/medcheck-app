import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  XCircle,
  FilePlus,
  Search,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import React from 'react';

interface FiltersToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  pendingCount?: number;
  onClear: () => void;
  onExportCsv: () => void;
  onExportProcedures: () => void;
  onNewGuide: () => void;
}

export function FiltersToolbar({
  search,
  onSearch,
  date,
  onDateChange,
  status,
  onStatusChange,
  pendingCount = 0,
  onClear,
  onExportCsv,
  onExportProcedures,
  onNewGuide,
}: FiltersToolbarProps) {
  const hasFilters = !!search || status !== 'ALL' || date;

  return (
    <div className="bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 rounded-xl border border-gray-200/60 shadow-sm p-6 space-y-6 backdrop-blur-sm dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-900/50 dark:border-gray-700/60 transition-all duration-300 hover:shadow-md">
      {/* Subtle overlay for premium glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-xl" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm dark:from-blue-900/40 dark:to-blue-800/60 dark:text-blue-400">
            <Filter className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros e Ações
          </h3>
          {hasFilters && (
            <Badge
              variant="secondary"
              className="bg-blue-100/80 text-blue-800 border border-blue-200/60 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/60"
            >
              Filtros aplicados
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasFilters}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-sm transition-all duration-300"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Limpar filtros
        </Button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="space-y-2">
          <label
            htmlFor="search"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Buscar
          </label>
          <Input
            id="search"
            placeholder="Número da guia ou beneficiário"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="w-full backdrop-blur-sm bg-white/80 border-gray-200/60 dark:bg-gray-800/80 dark:border-gray-700/60"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="date"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <input
              id="date"
              type="date"
              value={date ?? ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-200/60 bg-white/80 px-3 py-2 pl-10 text-sm transition-all duration-200 
                         file:border-0 file:bg-transparent file:text-sm file:font-medium 
                         placeholder:text-gray-400 focus-visible:outline-none backdrop-blur-sm
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400
                         shadow-sm hover:shadow-md focus:shadow-md
                         dark:bg-gray-800/80 dark:border-gray-700/60 dark:text-gray-100 
                         dark:focus:border-blue-400 dark:hover:border-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full backdrop-blur-sm bg-white/80 border-gray-200/60 dark:bg-gray-800/80 dark:border-gray-700/60">
              <SelectValue placeholder="Selecione o status" />
              {pendingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-amber-100/80 text-amber-800 border border-amber-200/60 backdrop-blur-sm dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/60"
                >
                  {pendingCount}
                </Badge>
              )}
            </SelectTrigger>
            <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
              <SelectItem value="ALL">Todos os Status</SelectItem>

              {/* Status Inteligentes de Pagamento - Principais */}
              <SelectItem value="pago">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    💰 Pago
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="parcialmente_pago">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full" />
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    ⚠️ Parcialmente Pago
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="glosado">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  <span className="font-medium text-red-700 dark:text-red-400">
                    ❌ Glosado
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="nao_pago">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full" />
                  <span className="font-medium text-gray-700 dark:text-gray-400">
                    ⏳ Não Pago
                  </span>
                </div>
              </SelectItem>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Status Unificado para Análise Pendente */}
              <SelectItem value="sem_analise">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    📋 Sem Análise
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 relative z-10">
        <div className="flex flex-wrap gap-2 flex-1">
          <Button
            variant="outline"
            onClick={onExportCsv}
            className="flex items-center gap-2 backdrop-blur-sm bg-white/60 hover:bg-white/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 border-gray-200/60 dark:border-gray-700/60 transition-all duration-300"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={onExportProcedures}
            className="flex items-center gap-2 backdrop-blur-sm bg-white/60 hover:bg-white/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 border-gray-200/60 dark:border-gray-700/60 transition-all duration-300"
          >
            <Download className="h-4 w-4" />
            Exportar Procedimentos
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={onNewGuide}
          className="flex items-center gap-2 sm:w-auto w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-300"
          size="lg"
        >
          <FilePlus className="h-4 w-4" />
          Nova Guia
        </Button>
      </div>
    </div>
  );
}
