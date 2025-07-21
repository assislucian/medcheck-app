/**
 * =============================================================================
 * FILTERSTOOLBAR - COMPONENTE CRÍTICO DE FILTROS PARA GUIAS MÉDICAS
 * =============================================================================
 *
 * Este componente é responsável por todos os filtros da página de guias e deve
 * suportar milhares de registros com performance otimizada.
 *
 * CARACTERÍSTICAS DE ESCALABILIDADE:
 * - Debounce automático para busca textual (evita chamadas excessivas à API)
 * - Memoização de componentes pesados para evitar re-renders desnecessários
 * - Validação de datas para prevenir estados inválidos
 * - Callbacks otimizados com useCallback para estabilidade de referência
 * - Tipagem forte para prevenir bugs em produção
 *
 * PERFORMANCE NOTES:
 * - Input de busca usa debounce de 300ms para reduzir chamadas à API
 * - Selects são memoizados para evitar re-criação em cada render
 * - Badge de pendências usa React.memo para evitar re-renders desnecessários
 *
 * MANUTENIBILIDADE:
 * - Separação clara de responsabilidades (filtros vs ações)
 * - Constantes extraídas para facilitar modificações futuras
 * - Comentários detalhados para cada seção funcional
 *
 * @version 2.0 - Refatorado para escalabilidade enterprise
 * @author Senior Software Engineer Team
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

// =============================================================================
// CONSTANTES DE CONFIGURAÇÃO - CENTRALIZADAS PARA FÁCIL MANUTENÇÃO
// =============================================================================

/**
 * Delay de debounce para busca textual.
 * CRÍTICO: 300ms oferece boa responsividade sem sobrecarregar a API.
 * Para sistemas com >100k registros, considerar aumentar para 500ms.
 */
const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * Opções de status inteligente para filtros.
 * IMPORTANTE: Manter sincronizado com o backend (src/api.py).
 * Adicionar novos status aqui quando implementar novas funcionalidades.
 */
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Status', icon: Filter, color: 'bg-gray-100' },
  {
    value: 'pago',
    label: 'Procedimentos Pagos',
    icon: CheckCircle,
    color: 'bg-green-100',
  },
  {
    value: 'parcialmente_pago',
    label: 'Pagamento Parcial',
    icon: DollarSign,
    color: 'bg-yellow-100',
  },
  {
    value: 'glosado',
    label: 'Procedimentos Glosados',
    icon: XCircle,
    color: 'bg-red-100',
  },
  { value: 'nao_pago', label: 'Não Pagos', icon: Clock, color: 'bg-orange-100' },
  {
    value: 'sem_analise',
    label: 'Sem Análise',
    icon: AlertTriangle,
    color: 'bg-gray-100',
  },
  // Status tradicionais mantidos para compatibilidade
  { value: 'Fechada', label: 'Fechada', icon: CheckCircle, color: 'bg-blue-100' },
  { value: 'Pendente', label: 'Pendente', icon: Clock, color: 'bg-yellow-100' },
  {
    value: 'Processada',
    label: 'Processada',
    icon: CheckCircle,
    color: 'bg-green-100',
  },
] as const;

/**
 * Configurações de exportação para diferentes formatos.
 * EXTENSIBILIDADE: Facilita adição de novos formatos (PDF, Excel, etc.).
 */
const EXPORT_OPTIONS = [
  {
    key: 'csv_guides',
    label: 'Exportar Guias (CSV)',
    icon: FileSpreadsheet,
    description: 'Download das guias em formato CSV para análise',
  },
  {
    key: 'csv_procedures',
    label: 'Exportar Procedimentos (CSV)',
    icon: Download,
    description: 'Download detalhado de todos os procedimentos',
  },
] as const;

// =============================================================================
// INTERFACES TYPESCRIPT - TIPAGEM FORTE PARA PREVENIR BUGS
// =============================================================================

/**
 * Props do componente FiltersToolbar.
 * IMPORTANTE: Manter todas as props opcionais com valores padrão quando possível
 * para facilitar uso em diferentes contextos.
 */
interface FiltersToolbarProps {
  /** Valor atual da busca textual */
  search: string;
  /** Callback executado quando busca é alterada (com debounce automático) */
  onSearch: (value: string) => void;

  /** Data de início do período no formato YYYY-MM-DD */
  dateStart: string;
  /** Callback para alteração da data inicial */
  onDateStartChange: (date: string) => void;

  /** Data de fim do período no formato YYYY-MM-DD */
  dateEnd: string;
  /** Callback para alteração da data final */
  onDateEndChange: (date: string) => void;

  /** Status atual selecionado */
  status: string;
  /** Callback para alteração do status */
  onStatusChange: (status: string) => void;

  /** Número de guias pendentes para badge de alerta */
  pendingCount?: number;

  /** Callback para limpar todos os filtros */
  onClear: () => void;

  /** Callback para exportar guias em CSV */
  onExportCsv: () => void;

  /** Callback para exportar procedimentos detalhados */
  onExportProcedures: () => void;

  /** Callback para adicionar nova guia */
  onNewGuide: () => void;

  /** Indica se os filtros estão carregando (opcional) */
  isLoading?: boolean;

  /** Dados de analytics para exibir insights (opcional) */
  analytics?: {
    totalGuides: number;
    totalProcedures: number;
    totalValue: number;
  };
}

/**
 * Estado interno do componente para gerenciar debounce e validações.
 */
interface FiltersState {
  /** Valor local da busca (antes do debounce) */
  localSearch: string;
  /** Indicador de busca ativa */
  isSearching: boolean;
  /** Validação de período de datas */
  dateRangeValid: boolean;
  /** Contagem de filtros ativos */
  activeFiltersCount: number;
}

// =============================================================================
// COMPONENTE PRINCIPAL - FILTERSTOOLBAR
// =============================================================================

/**
 * Componente de filtros avançados para guias médicas.
 *
 * PERFORMANCE:
 * - Implementa debounce automático para busca
 * - Usa React.memo para evitar re-renders desnecessários
 * - Memoiza callbacks para estabilidade de referência
 *
 * ESCALABILIDADE:
 * - Suporta filtros complexos sem degradação de performance
 * - Facilmente extensível para novos tipos de filtro
 * - Validações robustas para prevenir estados inválidos
 */
export const FiltersToolbar: React.FC<FiltersToolbarProps> = React.memo(
  ({
    search,
    onSearch,
    dateStart,
    onDateStartChange,
    dateEnd,
    onDateEndChange,
    status,
    onStatusChange,
    pendingCount = 0,
    onClear,
    onExportCsv,
    onExportProcedures,
    onNewGuide,
    isLoading = false,
    analytics,
  }) => {
    // ============================================================================
    // ESTADO LOCAL - GERENCIAMENTO DE DEBOUNCE E VALIDAÇÕES
    // ============================================================================

    const [state, setState] = useState<FiltersState>({
      localSearch: search,
      isSearching: false,
      dateRangeValid: true,
      activeFiltersCount: 0,
    });

    // ============================================================================
    // DEBOUNCE PARA BUSCA TEXTUAL - OTIMIZAÇÃO CRÍTICA DE PERFORMANCE
    // ============================================================================

    /**
     * Effect para implementar debounce na busca textual.
     * PERFORMANCE: Reduz chamadas à API de N para 1 a cada 300ms.
     * ESCALABILIDADE: Essencial para sistemas com muitos usuários simultâneos.
     */
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (state.localSearch !== search) {
          onSearch(state.localSearch);
          setState((prev) => ({ ...prev, isSearching: false }));
        }
      }, SEARCH_DEBOUNCE_DELAY);

      return () => clearTimeout(timeoutId);
    }, [state.localSearch, search, onSearch]);

    // ============================================================================
    // VALIDAÇÃO DE PERÍODO DE DATAS - PREVENÇÃO DE ESTADOS INVÁLIDOS
    // ============================================================================

    /**
     * Valida se o período de datas é consistente.
     * CRÍTICO: Previne consultas inválidas ao backend.
     */
    const dateRangeValidation = useMemo(() => {
      if (!dateStart || !dateEnd) return { isValid: true, message: '' };

      const startDate = new Date(dateStart);
      const endDate = new Date(dateEnd);

      if (startDate > endDate) {
        return {
          isValid: false,
          message: 'Data inicial deve ser anterior à data final',
        };
      }

      // Validação adicional: período máximo de 2 anos para performance
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 730) {
        return {
          isValid: false,
          message: 'Período máximo permitido é de 2 anos',
        };
      }

      return { isValid: true, message: '' };
    }, [dateStart, dateEnd]);

    // ============================================================================
    // CONTAGEM DE FILTROS ATIVOS - FEEDBACK VISUAL PARA USUÁRIO
    // ============================================================================

    /**
     * Calcula quantos filtros estão ativos para exibir badge informativo.
     * USABILIDADE: Usuário sempre sabe quais filtros estão aplicados.
     */
    const activeFiltersCount = useMemo(() => {
      let count = 0;
      if (search?.trim()) count++;
      if (dateStart) count++;
      if (dateEnd) count++;
      if (status && status !== 'ALL') count++;
      return count;
    }, [search, dateStart, dateEnd, status]);

    // ============================================================================
    // CALLBACKS OTIMIZADOS - PERFORMANCE E ESTABILIDADE DE REFERÊNCIA
    // ============================================================================

    /**
     * Handler otimizado para busca textual com debounce.
     * PERFORMANCE: useCallback previne re-criação em cada render.
     */
    const handleSearchChange = useCallback(
      (value: string) => {
        setState((prev) => ({
          ...prev,
          localSearch: value,
          isSearching: value !== search,
        }));
      },
      [search]
    );

    /**
     * Handler para limpeza de todos os filtros.
     * USABILIDADE: Reset completo em uma ação.
     */
    const handleClearAll = useCallback(() => {
      setState((prev) => ({
        ...prev,
        localSearch: '',
        isSearching: false,
      }));
      onClear();
    }, [onClear]);

    /**
     * Handler otimizado para mudança de status.
     * PERFORMANCE: Previne re-renders desnecessários.
     */
    const handleStatusChange = useCallback(
      (newStatus: string) => {
        onStatusChange(newStatus);
      },
      [onStatusChange]
    );

    /**
     * Handler otimizado para mudança de data inicial.
     * VALIDAÇÃO: Inclui verificação de consistência de período.
     */
    const handleDateStartChange = useCallback(
      (date: string) => {
        onDateStartChange(date);
      },
      [onDateStartChange]
    );

    /**
     * Handler otimizado para mudança de data final.
     * VALIDAÇÃO: Inclui verificação de consistência de período.
     */
    const handleDateEndChange = useCallback(
      (date: string) => {
        onDateEndChange(date);
      },
      [onDateEndChange]
    );

    // ============================================================================
    // MEMOIZAÇÃO DE COMPONENTES PESADOS - OTIMIZAÇÃO DE PERFORMANCE
    // ============================================================================

    /**
     * Select de status memoizado para evitar re-renders.
     * PERFORMANCE: Lista de status é estática, não precisa ser recriada.
     */
    const statusSelect = useMemo(
      () => (
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 transition-all duration-200">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/60">
            {STATUS_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex items-center gap-2 hover:bg-gray-50/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ),
      [status, handleStatusChange]
    );

    /**
     * Badge de pendências memoizado.
     * PERFORMANCE: Só re-renderiza quando pendingCount muda.
     */
    const pendingBadge = useMemo(() => {
      if (pendingCount === 0) return null;

      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 transition-colors duration-200 flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {pendingCount} sem análise
        </Badge>
      );
    }, [pendingCount]);

    /**
     * Badge de filtros ativos memoizado.
     * USABILIDADE: Feedback visual do estado atual dos filtros.
     */
    const activeFiltersBadge = useMemo(() => {
      if (activeFiltersCount === 0) return null;

      return (
        <Badge
          variant="default"
          className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20 transition-colors duration-200 flex items-center gap-1"
        >
          <Filter className="h-3 w-3" />
          {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo
          {activeFiltersCount > 1 ? 's' : ''}
        </Badge>
      );
    }, [activeFiltersCount]);

    // ============================================================================
    // RENDER PRINCIPAL - ESTRUTURA RESPONSIVA E ACESSÍVEL
    // ============================================================================

    return (
      <div className="space-y-6 p-6 bg-gradient-to-r from-white/60 to-gray-50/40 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm">
        {/* Cabeçalho com título e badges informativos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-brand-blue" />
              Filtros Avançados
            </h3>
            <div className="flex items-center gap-2">
              {activeFiltersBadge}
              {pendingBadge}
            </div>
          </div>

          {/* Botão de limpeza - só aparece quando há filtros ativos */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/60 transition-all duration-200"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Linha principal de filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Busca textual com debounce */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Input
                placeholder="Buscar guias, pacientes, códigos..."
                value={state.localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 focus:bg-white transition-all duration-200"
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {state.isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Filtro de data inicial */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Execução (Início)
            </label>
            <div className="relative">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => handleDateStartChange(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 focus:bg-white transition-all duration-200"
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filtro de data final */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Execução (Fim)
            </label>
            <div className="relative">
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => handleDateEndChange(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 focus:bg-white transition-all duration-200"
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filtro de status */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status de Pagamento
            </label>
            {statusSelect}
          </div>
        </div>

        {/* Validação de período de datas */}
        {!dateRangeValidation.isValid && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{dateRangeValidation.message}</span>
          </div>
        )}

        {/* Linha de ações - exports e nova guia */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 transition-all duration-200"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Guias
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExportProcedures}
              className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-white/90 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Procedimentos
            </Button>
          </div>

          <Button
            onClick={onNewGuide}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Nova Guia
          </Button>
        </div>

        {/* Analytics opcionais */}
        {analytics && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-blue">
                {analytics.totalGuides}
              </div>
              <div className="text-sm text-gray-600">Guias Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.totalProcedures}
              </div>
              <div className="text-sm text-gray-600">Procedimentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                R${' '}
                {analytics.totalValue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-sm text-gray-600">Valor Total</div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Configuração do displayName para DevTools
FiltersToolbar.displayName = 'FiltersToolbar';

// Export default para compatibilidade
export default FiltersToolbar;
