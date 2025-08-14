import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import CBHPMComparisonTableFilters from './CBHPMComparisonTableFilters';
import CBHPMComparisonTabs from './CBHPMComparisonTabs';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComparisonDetail {
  id: string;
  codigo: string;
  descricao: string;
  qtd: number;
  valorCbhpm: number;
  valorPago: number;
  diferenca: number;
  status: 'conforme' | 'abaixo' | 'acima' | 'não_pago';
  papel: string;
  guia?: string;
  beneficiario?: string;
  matchStatus?: 'encontrado' | 'não_encontrado';
}

interface Summary {
  total: number;
  conforme: number;
  abaixo: number;
  acima: number;
  naoEncontrados?: number;
}

interface CBHPMComparisonTableProps {
  summary: Summary;
  details: ComparisonDetail[];
  guiaDetails?: any[];
}

const CBHPMComparisonTable: React.FC<CBHPMComparisonTableProps> = ({
  summary,
  details,
  guiaDetails = [],
}) => {
  const [filter, setFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [showMatchStatus, setShowMatchStatus] = React.useState(false);

  // Group details by role
  const groupedByRole: Record<string, ComparisonDetail[]> = details.reduce(
    (acc, detail) => {
      const role = detail.papel;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(detail);
      return acc;
    },
    {} as Record<string, ComparisonDetail[]>
  );

  // Get unique roles
  const roles = Object.keys(groupedByRole);

  // Verificar correspondência entre demonstrativo e guia
  const verifiedDetails = useMemo(() => {
    if (!guiaDetails || guiaDetails.length === 0 || !showMatchStatus) {
      return details; // Se não temos guias para comparar, retorne os detalhes originais
    }

    return details.map((detail) => {
      // Procurar por esse procedimento nas guias
      const matchingGuiaProcedure = guiaDetails.find(
        (guiaProcedure) => guiaProcedure.codigo === detail.codigo
      );

      if (!matchingGuiaProcedure) {
        // Se não encontrou correspondência na guia, marque com status especial
        return {
          ...detail,
          matchStatus: 'não_encontrado',
          guia: detail.guia || 'Não encontrado',
        };
      }

      // Procedimento encontrado, verificar se o valor cobrado corresponde ao valor da guia
      return {
        ...detail,
        matchStatus: 'encontrado',
        guia: matchingGuiaProcedure.guia || detail.guia,
      };
    });
  }, [details, guiaDetails, showMatchStatus]);

  // Sort and filter logic
  const filteredDetails = React.useMemo(() => {
    let result = showMatchStatus ? [...verifiedDetails] : [...details];

    // Apply text search filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(
        (detail) =>
          detail.descricao.toLowerCase().includes(lowerFilter) ||
          detail.codigo.includes(filter) ||
          (detail.guia && detail.guia.toLowerCase().includes(lowerFilter)) ||
          (detail.beneficiario &&
            detail.beneficiario.toLowerCase().includes(lowerFilter))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((detail) => detail.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter((detail) => detail.papel === roleFilter);
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField as keyof ComparisonDetail];
        const bValue = b[sortField as keyof ComparisonDetail];

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [
    details,
    verifiedDetails,
    filter,
    statusFilter,
    roleFilter,
    sortField,
    sortDirection,
    showMatchStatus,
  ]);

  // Calculate filtered summary
  const filteredSummary = React.useMemo(() => {
    const summary = filteredDetails.reduce(
      (acc, detail) => {
        acc.total++;
        if (detail.status === 'conforme') acc.conforme++;
        else if (detail.status === 'abaixo') acc.abaixo++;
        else if (detail.status === 'acima') acc.acima++;

        // Contar procedimentos não encontrados na guia
        if (detail.matchStatus === 'não_encontrado') {
          acc.naoEncontrados = (acc.naoEncontrados || 0) + 1;
        }

        return acc;
      },
      { total: 0, conforme: 0, abaixo: 0, acima: 0, naoEncontrados: 0 }
    );

    return summary;
  }, [filteredDetails]);

  // Handler for sort toggling
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conforme':
        return <Badge variant="success">Conforme</Badge>;
      case 'abaixo':
        return <Badge variant="danger">Abaixo</Badge>;
      case 'acima':
        return <Badge variant="info">Acima</Badge>;
      default:
        return <Badge variant="neutral">Não Pago</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Cirurgião':
        return <Badge className="bg-primary/10 text-primary">{role}</Badge>;
      case 'Primeiro Auxiliar':
        return <Badge className="bg-green-500/10 text-green-500">{role}</Badge>;
      case 'Segundo Auxiliar':
        return <Badge className="bg-blue-500/10 text-blue-500">{role}</Badge>;
      default:
        return <Badge variant="info">{role}</Badge>;
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="h-3 w-3 ml-1 text-primary" />
    ) : (
      <ArrowUpDown className="h-3 w-3 ml-1 text-primary rotate-180" />
    );
  };

  // Check if any filter is active
  const filterActive = filter !== '' || statusFilter !== 'all' || roleFilter !== 'all';

  // Reset all filters
  const resetFilters = () => {
    setFilter('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortField(null);
  };

  // Toggle validação contra guia
  const toggleMatchValidation = () => {
    if (!guiaDetails || guiaDetails.length === 0) {
      toast.warning('Não há guias disponíveis para validação', {
        description: 'Faça upload de guias para habilitar essa funcionalidade.',
      });
      return;
    }

    setShowMatchStatus(!showMatchStatus);
    toast.success(
      showMatchStatus
        ? 'Validação contra guia desativada'
        : 'Validação contra guia ativada',
      {
        description: showMatchStatus
          ? 'Mostrando apenas dados do demonstrativo.'
          : `Validando ${details.length} procedimentos contra as guias disponíveis.`,
      }
    );
  };

  // Custom component to display patient info with tooltip
  const PatientInfo = ({ patient }: { patient: string | undefined }) => {
    if (!patient) return <span className="text-gray-400">-</span>;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted">
              {patient.length > 15 ? `${patient.substring(0, 15)}...` : patient}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{patient}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      <CBHPMComparisonTableFilters
        filter={filter}
        setFilter={setFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        roles={roles}
        filterActive={filterActive}
        resetFilters={resetFilters}
        detailsLength={details.length}
        filteredLength={filteredDetails.length}
        toggleMatchValidation={toggleMatchValidation}
        showMatchStatus={showMatchStatus}
        hasGuiaData={!!guiaDetails?.length}
      />
      <CBHPMComparisonTabs
        roles={roles}
        filteredDetails={filteredDetails}
        getStatusBadge={getStatusBadge}
        getRoleBadge={getRoleBadge}
        toggleSort={toggleSort}
        sortField={sortField}
        getSortIcon={getSortIcon}
        filter={filter}
        filteredSummary={filteredSummary}
        PatientInfo={PatientInfo} // Pass the PatientInfo component
      />

      {showMatchStatus && filteredSummary.naoEncontrados > 0 && (
        <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-md mt-4">
          <p className="text-orange-700 dark:text-orange-400">
            <strong>Atenção:</strong> {filteredSummary.naoEncontrados} procedimentos do
            demonstrativo não foram encontrados nas guias disponíveis. Verifique se
            todas as guias foram carregadas.
          </p>
        </div>
      )}
    </div>
  );
};

export default CBHPMComparisonTable;
