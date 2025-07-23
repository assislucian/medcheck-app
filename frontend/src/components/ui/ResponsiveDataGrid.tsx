import React from 'react';
import { useDevice } from '@/hooks/use-device';
import { DataGrid } from './data-grid';
import { MobileDataCard, MobileDataList } from '../mobile/MobileDataCard';
import { DeviceRender } from '../layout/ResponsiveLayout';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Hash,
  Eye,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit,
  Download
} from 'lucide-react';

interface ResponsiveDataGridProps {
  // Props originais do DataGrid
  rows: any[];
  columns: {
    field: string;
    headerName: string;
    width?: number;
    flex?: number;
    type?: string;
    renderCell?: (params: any) => React.ReactNode;
    valueFormatter?: (params: any) => string;
  }[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  
  // Props específicas para mobile
  mobileConfig?: {
    titleField?: string; // Campo usado como título do card
    subtitleField?: string; // Campo usado como subtítulo
    statusField?: string; // Campo que define o status do card
    primaryFields?: string[]; // Campos de alta prioridade (sempre visíveis)
    secondaryFields?: string[]; // Campos de média prioridade 
    actions?: {
      label: string;
      action: string;
      icon?: React.ReactNode;
      variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    }[];
  };
  
  // Callbacks
  onAction?: (action: string, data: any) => void;
  onRowClick?: (row: any) => void;
}

/**
 * DataGrid responsivo que adapta automaticamente para mobile/desktop
 * No mobile: usa cards elegantes e touch-friendly
 * No desktop: usa tabela tradicional
 */
export function ResponsiveDataGrid({
  rows,
  columns,
  pageSize = 10,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  className,
  mobileConfig = {},
  onAction,
  onRowClick,
  ...dataGridProps
}: ResponsiveDataGridProps) {
  const { isMobile } = useDevice();

  // Configuração padrão para mobile
  const defaultMobileConfig = {
    titleField: 'nome' || 'titulo' || 'descricao' || 'periodo',
    subtitleField: 'data' || 'created_at' || 'upload_time',
    statusField: 'status' || 'glosa',
    primaryFields: ['total_approved', 'total_presented', 'total_glosa'],
    secondaryFields: ['data', 'procedimentos', 'periodo'],
    actions: [
      {
        label: 'Ver',
        action: 'view',
        icon: <Eye className="h-4 w-4" />,
        variant: 'outline' as const,
      },
    ],
  };

  const config = { ...defaultMobileConfig, ...mobileConfig };

  // Converter colunas para configuração de campos mobile
  const mobileFields = columns.map(column => {
    // Determinar prioridade baseada na configuração
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (config.primaryFields?.includes(column.field)) priority = 'high';
    else if (config.secondaryFields?.includes(column.field)) priority = 'medium';

    // Mapear ícones baseados no tipo de campo
    let icon = null;
    if (column.field.includes('valor') || column.field.includes('total') || column.type === 'currency') {
      icon = <DollarSign className="h-3 w-3" />;
    } else if (column.field.includes('data') || column.type === 'date') {
      icon = <Calendar className="h-3 w-3" />;
    } else if (column.field.includes('nome') || column.field.includes('paciente')) {
      icon = <User className="h-3 w-3" />;
    } else if (column.field.includes('codigo') || column.field.includes('guia')) {
      icon = <Hash className="h-3 w-3" />;
    } else if (column.field.includes('procedimento')) {
      icon = <FileText className="h-3 w-3" />;
    }

    // Determinar cor baseada no tipo
    let color = '';
    if (column.field.includes('glosa') || column.field.includes('error')) {
      color = 'text-red-600';
    } else if (column.field.includes('liberado') || column.field.includes('success')) {
      color = 'text-emerald-600';
    } else if (column.field.includes('apresentado')) {
      color = 'text-blue-600';
    }

    return {
      field: column.field,
      label: column.headerName,
      type: column.type as any,
      priority,
      icon,
      color,
      format: column.valueFormatter,
    };
  });

  // Função para obter título e subtítulo do card
  const getCardTitle = (row: any) => {
    return row[config.titleField] || row.nome || row.titulo || row.periodo || `Item ${row.id}`;
  };

  const getCardSubtitle = (row: any) => {
    const subtitle = row[config.subtitleField] || row.data || row.created_at;
    if (subtitle) {
      // Formatação de data se necessário
      if (typeof subtitle === 'string' && subtitle.includes('-')) {
        try {
          return new Date(subtitle).toLocaleDateString('pt-BR');
        } catch {
          return subtitle;
        }
      }
      return subtitle;
    }
    return undefined;
  };

  // Função para determinar status do card
  const getCardStatus = (row: any): 'success' | 'warning' | 'error' | 'info' | undefined => {
    const statusValue = row[config.statusField];
    
    if (typeof statusValue === 'number') {
      if (statusValue > 0 && config.statusField?.includes('glosa')) return 'error';
      if (statusValue > 0) return 'success';
      return 'info';
    }
    
    if (typeof statusValue === 'string') {
      const status = statusValue.toLowerCase();
      if (status.includes('erro') || status.includes('falha')) return 'error';
      if (status.includes('aviso') || status.includes('pendente')) return 'warning';
      if (status.includes('sucesso') || status.includes('ok')) return 'success';
      return 'info';
    }

    // Heurística baseada em outros campos
    if (row.total_glosa && Number(row.total_glosa) > 0) return 'error';
    if (row.status === 'ativo' || row.liberado) return 'success';
    
    return undefined;
  };

  // Renderização para mobile
  const renderMobile = () => (
    <MobileDataList
      items={rows}
      cardConfig={{
        fields: mobileFields,
        actions: config.actions,
        onAction,
        title: '', // Será sobrescrito individualmente
        compact: true,
      }}
      loading={loading}
      emptyMessage={emptyMessage}
      className={className}
    />
  );

  // Renderização para desktop (DataGrid original)
  const renderDesktop = () => (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSize={pageSize}
      loading={loading}
      emptyMessage={emptyMessage}
      className={className}
      {...dataGridProps}
    />
  );

  // Se estamos no mobile, usar cards
  if (isMobile) {
    if (loading) {
      return renderMobile();
    }

    return (
      <div className="space-y-3">
        {rows.map((row, index) => {
          const cardTitle = getCardTitle(row);
          const cardSubtitle = getCardSubtitle(row);
          const cardStatus = getCardStatus(row);

          return (
            <MobileDataCard
              key={row.id || index}
              data={row}
              fields={mobileFields}
              title={cardTitle}
              subtitle={cardSubtitle}
              status={cardStatus}
              actions={config.actions}
              onAction={onAction}
              compact={true}
              className="cursor-pointer"
              onClick={() => onRowClick?.(row)}
            />
          );
        })}
        
        {rows.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Para desktop, usar DataGrid original
  return renderDesktop();
}

/**
 * Hook para configuração rápida de ResponsiveDataGrid para demonstrativos
 */
export function useDemonstrativesGridConfig() {
  return {
    mobileConfig: {
      titleField: 'periodo',
      subtitleField: 'upload_time',
      statusField: 'total_glosa',
      primaryFields: ['total_approved', 'total_glosa'],
      secondaryFields: ['total_procedures', 'data'],
      actions: [
        {
          label: 'Detalhes',
          action: 'view',
          icon: <Eye className="h-4 w-4" />,
          variant: 'outline' as const,
        },
        {
          label: 'Excluir',
          action: 'delete',
          icon: <Trash2 className="h-4 w-4" />,
          variant: 'destructive' as const,
        },
      ],
    },
  };
}

/**
 * Hook para configuração rápida de ResponsiveDataGrid para guias
 */
export function useGuiasGridConfig() {
  return {
    mobileConfig: {
      titleField: 'numero_guia',
      subtitleField: 'data',
      statusField: 'status',
      primaryFields: ['numero_guia', 'paciente'],
      secondaryFields: ['data', 'codigo', 'papel'],
      actions: [
        {
          label: 'Ver',
          action: 'view',
          icon: <Eye className="h-4 w-4" />,
          variant: 'outline' as const,
        },
        {
          label: 'Editar',
          action: 'edit',
          icon: <Edit className="h-4 w-4" />,
          variant: 'secondary' as const,
        },
      ],
    },
  };
}

/**
 * Hook para configuração rápida de ResponsiveDataGrid para procedimentos
 */
export function useProceduresGridConfig() {
  return {
    mobileConfig: {
      titleField: 'descricao',
      subtitleField: 'codigo',
      statusField: 'glosa',
      primaryFields: ['liberado', 'glosa'],
      secondaryFields: ['apresentado', 'quantidade'],
      actions: [
        {
          label: 'Detalhes',
          action: 'view',
          icon: <Eye className="h-4 w-4" />,
          variant: 'outline' as const,
        },
      ],
    },
  };
} 