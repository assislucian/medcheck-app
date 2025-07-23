import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Eye, 
  Info,
  Calendar,
  User,
  FileText,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface MobileDataCardProps {
  data: Record<string, any>;
  fields: {
    field: string;
    label: string;
    type?: 'text' | 'currency' | 'date' | 'status' | 'number' | 'badge';
    priority?: 'high' | 'medium' | 'low'; // Define quais campos mostrar primeiro
    icon?: React.ReactNode;
    format?: (value: any) => string;
    color?: string;
  }[];
  onAction?: (action: string, data: any) => void;
  actions?: {
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  }[];
  className?: string;
  title?: string;
  subtitle?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  compact?: boolean;
}

/**
 * Componente de card mobile otimizado para exibir dados em dispositivos móveis
 * Substitui tabelas complexas por cards legíveis e interativos
 */
export function MobileDataCard({
  data,
  fields,
  onAction,
  actions = [],
  className,
  title,
  subtitle,
  status,
  compact = false,
}: MobileDataCardProps) {
  // Separar campos por prioridade
  const highPriorityFields = fields.filter(f => f.priority === 'high');
  const mediumPriorityFields = fields.filter(f => f.priority === 'medium');
  const lowPriorityFields = fields.filter(f => f.priority === 'low' || !f.priority);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-l-emerald-500 bg-emerald-50';
      case 'warning': return 'border-l-amber-500 bg-amber-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-300';
    }
  };

  const formatValue = (field: typeof fields[0], value: any) => {
    if (field.format) {
      return field.format(value);
    }

    if (!value && value !== 0) return '--';

    switch (field.type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(value) || 0);
      
      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          return date.toLocaleDateString('pt-BR');
        }
        return String(value);
      
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
      
      default:
        return String(value);
    }
  };

  const renderField = (field: typeof fields[0]) => {
    const value = data[field.field];
    const formattedValue = formatValue(field, value);

    if (field.type === 'badge') {
      return (
        <div key={field.field} className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            {field.icon}
            {field.label}
          </span>
          <Badge 
            variant="outline" 
            className={cn("text-xs", field.color)}
          >
            {formattedValue}
          </Badge>
        </div>
      );
    }

    if (field.type === 'status') {
      return (
        <div key={field.field} className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            {field.icon}
            {field.label}
          </span>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            field.color || "bg-gray-100 text-gray-700"
          )}>
            {formattedValue}
          </div>
        </div>
      );
    }

    return (
      <div key={field.field} className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          {field.icon}
          {field.label}
        </span>
        <span className={cn(
          "text-sm font-medium text-right",
          field.type === 'currency' && "font-mono tabular-nums",
          field.color || "text-gray-900"
        )}>
          {formattedValue}
        </span>
      </div>
    );
  };

  return (
    <Card className={cn(
      "border-l-4 transition-all duration-200 hover:shadow-md",
      getStatusColor(),
      compact && "p-3",
      className
    )}>
      {(title || subtitle || highPriorityFields.length > 0) && (
        <CardHeader className={cn(
          "pb-3",
          compact && "pb-2 px-3 pt-3"
        )}>
          {title && (
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              {title}
              {status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          )}
          {subtitle && (
            <div className="text-sm text-gray-500">{subtitle}</div>
          )}
          
          {/* Campos de alta prioridade - sempre visíveis */}
          {highPriorityFields.length > 0 && (
            <div className="space-y-1 mt-2">
              {highPriorityFields.map(renderField)}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className={cn(
        "space-y-3",
        compact && "px-3 pb-3 space-y-2"
      )}>
        {/* Campos de média prioridade */}
        {mediumPriorityFields.length > 0 && (
          <div className="space-y-1">
            {mediumPriorityFields.map(renderField)}
          </div>
        )}

        {/* Separador se houver campos de baixa prioridade */}
        {lowPriorityFields.length > 0 && mediumPriorityFields.length > 0 && (
          <Separator className="my-2" />
        )}

        {/* Campos de baixa prioridade - em grid compacto */}
        {lowPriorityFields.length > 0 && (
          <div className="space-y-1 text-xs">
            {lowPriorityFields.map(renderField)}
          </div>
        )}

        {/* Ações */}
        {actions.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="flex gap-2 flex-wrap">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => onAction?.(action.action, data)}
                  className="flex-1 min-w-0 text-xs"
                >
                  {action.icon}
                  <span className="ml-1 truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente de lista de cards mobile para substituir DataGrid
 */
interface MobileDataListProps {
  items: any[];
  cardConfig: Omit<MobileDataCardProps, 'data'>;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
}

export function MobileDataList({
  items,
  cardConfig,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  className,
  spacing = 'normal',
}: MobileDataListProps) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  const spacingClasses = {
    compact: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {items.map((item, index) => (
        <MobileDataCard
          key={item.id || index}
          data={item}
          {...cardConfig}
        />
      ))}
    </div>
  );
} 