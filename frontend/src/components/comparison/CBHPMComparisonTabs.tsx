import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Local small currency formatter as the '@/utils/formatters' file does not exist
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface CBHPMComparisonTabsProps {
  roles: string[];
  filteredDetails: any[];
  getStatusBadge: (status: string) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
  toggleSort: (field: string) => void;
  sortField: string | null;
  getSortIcon: (field: string) => React.ReactNode;
  filter: string;
  filteredSummary: {
    total: number;
    conforme: number;
    abaixo: number;
    acima: number;
    naoEncontrados?: number;
  };
  PatientInfo?: React.ComponentType<{ patient: string | undefined }>;
}

const CBHPMComparisonTabs: React.FC<CBHPMComparisonTabsProps> = ({
  roles,
  filteredDetails,
  getStatusBadge,
  getRoleBadge,
  toggleSort,
  sortField,
  getSortIcon,
  filter,
  filteredSummary,
  PatientInfo,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  // Filter details based on active tab
  const tabFilteredDetails = React.useMemo(() => {
    if (activeTab === 'all') return filteredDetails;
    return filteredDetails.filter((detail) => detail.papel === activeTab);
  }, [activeTab, filteredDetails]);

  // Calculate summary for the currently displayed tab
  const tabSummary = React.useMemo(() => {
    const summary = tabFilteredDetails.reduce(
      (acc, detail) => {
        acc.total++;
        if (detail.status === 'conforme') acc.conforme++;
        else if (detail.status === 'abaixo') acc.abaixo++;
        else if (detail.status === 'acima') acc.acima++;
        return acc;
      },
      { total: 0, conforme: 0, abaixo: 0, acima: 0 }
    );

    return summary;
  }, [tabFilteredDetails]);

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">Todos ({filteredSummary.total})</TabsTrigger>
        {roles.map((role) => (
          <TabsTrigger key={role} value={role}>
            {role} ({filteredDetails.filter((d) => d.papel === role).length})
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="overflow-auto">
        <ComparisonTable
          details={filteredDetails}
          getStatusBadge={getStatusBadge}
          getRoleBadge={getRoleBadge}
          toggleSort={toggleSort}
          sortField={sortField}
          getSortIcon={getSortIcon}
          PatientInfo={PatientInfo}
        />
      </TabsContent>

      {roles.map((role) => (
        <TabsContent key={role} value={role} className="overflow-auto">
          <ComparisonTable
            details={filteredDetails.filter((d) => d.papel === role)}
            getStatusBadge={getStatusBadge}
            getRoleBadge={getRoleBadge}
            toggleSort={toggleSort}
            sortField={sortField}
            getSortIcon={getSortIcon}
            PatientInfo={PatientInfo}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

interface ComparisonTableProps {
  details: any[];
  getStatusBadge: (status: string) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
  toggleSort: (field: string) => void;
  sortField: string | null;
  getSortIcon: (field: string) => React.ReactNode;
  PatientInfo?: React.ComponentType<{ patient: string | undefined }>;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  details,
  getStatusBadge,
  getRoleBadge,
  toggleSort,
  sortField,
  getSortIcon,
  PatientInfo,
}) => {
  return (
    <Table className="border rounded-md">
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead
            className="w-24 cursor-pointer"
            onClick={() => toggleSort('codigo')}
          >
            <div className="flex items-center">Código {getSortIcon('codigo')}</div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('descricao')}>
            <div className="flex items-center">
              Descrição {getSortIcon('descricao')}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('papel')}>
            <div className="flex items-center">Papel {getSortIcon('papel')}</div>
          </TableHead>
          {PatientInfo && (
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort('beneficiario')}
            >
              <div className="flex items-center">
                Paciente {getSortIcon('beneficiario')}
              </div>
            </TableHead>
          )}
          <TableHead
            className="text-right cursor-pointer"
            onClick={() => toggleSort('valorCbhpm')}
          >
            <div className="flex items-center justify-end">
              CBHPM {getSortIcon('valorCbhpm')}
            </div>
          </TableHead>
          <TableHead
            className="text-right cursor-pointer"
            onClick={() => toggleSort('valorPago')}
          >
            <div className="flex items-center justify-end">
              Pago {getSortIcon('valorPago')}
            </div>
          </TableHead>
          <TableHead
            className="text-right cursor-pointer"
            onClick={() => toggleSort('diferenca')}
          >
            <div className="flex items-center justify-end">
              Diferença {getSortIcon('diferenca')}
            </div>
          </TableHead>
          <TableHead
            className="text-center cursor-pointer"
            onClick={() => toggleSort('status')}
          >
            <div className="flex items-center justify-center">
              Status {getSortIcon('status')}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.length === 0 ? (
          <TableRow>
            <TableCell colSpan={PatientInfo ? 8 : 7} className="text-center py-8">
              Nenhum procedimento encontrado
            </TableCell>
          </TableRow>
        ) : (
          details.map((detail) => (
            <TableRow key={`${detail.id}-${detail.codigo}`}>
              <TableCell className="font-mono">{detail.codigo}</TableCell>
              <TableCell>{detail.descricao}</TableCell>
              <TableCell>{getRoleBadge(detail.papel)}</TableCell>
              {PatientInfo && (
                <TableCell>
                  <PatientInfo patient={detail.beneficiario} />
                </TableCell>
              )}
              <TableCell className="text-right">
                {formatCurrency(detail.valorCbhpm)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(detail.valorPago)}
              </TableCell>
              <TableCell
                className={`text-right ${
                  detail.diferenca < 0
                    ? 'text-red-600'
                    : detail.diferenca > 0
                      ? 'text-green-600'
                      : ''
                }`}
              >
                {formatCurrency(detail.diferenca)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(detail.status)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CBHPMComparisonTabs;
