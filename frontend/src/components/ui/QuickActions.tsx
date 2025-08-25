import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './button';
import {
  Plus,
  Upload,
  FileText,
  FileBarChart,
  Calculator,
  Download,
  Share,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive';
}

interface QuickActionsProps {
  customActions?: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  customActions,
  className,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Ações contextuais baseadas na página atual
  const getContextualActions = (): QuickAction[] => {
    const path = location.pathname;

    switch (path) {
      case '/dashboard':
        return [
          {
            id: 'upload',
            label: 'Upload de Documentos',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => navigate('/guides'),
          },
          {
            id: 'export-dashboard',
            label: 'Exportar CSV',
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('exportGuidesCSV');
              window.dispatchEvent(event);
            },
          },
        ];

      case '/guides':
        return [
          {
            id: 'upload-guides',
            label: 'Upload de Guias',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('openGuideUpload');
              window.dispatchEvent(event);
            },
          },
          {
            id: 'export-guides',
            label: 'Exportar CSV',
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('exportGuidesCSV');
              window.dispatchEvent(event);
            },
          },
        ];

      case '/demonstratives':
        return [
          {
            id: 'upload-demo',
            label: 'Upload de Demonstrativos',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('openDemoUpload');
              window.dispatchEvent(event);
            },
          },
          {
            id: 'export-demo',
            label: 'Exportar Dados',
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('exportDemoData');
              window.dispatchEvent(event);
            },
          },
        ];

      case '/unpaid-procedures':
        return [
          {
            id: 'export-glosas',
            label: 'Exportar Glosas',
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('exportGlosas');
              window.dispatchEvent(event);
            },
          },
          {
            id: 'bulk-contest',
            label: 'Contestar em Lote',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('openBulkContest');
              window.dispatchEvent(event);
            },
          },
        ];

      case '/intelligence':
        return [
          {
            id: 'export-report',
            label: 'Exportar Relatório',
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('exportIntelligenceReport');
              window.dispatchEvent(event);
            },
          },
          {
            id: 'share-insights',
            label: 'Compartilhar Insights',
            icon: <Share className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('shareInsights');
              window.dispatchEvent(event);
            },
          },
        ];

      default:
        return [
          {
            id: 'calculator',
            label: 'Calculadora CBHPM',
            icon: <Calculator className="h-4 w-4" />,
            onClick: () => {
              const event = new CustomEvent('openCalculator');
              window.dispatchEvent(event);
            },
          },
          {
            id: 'quick-upload',
            label: 'Upload Rápido',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => navigate('/guides'),
          },
        ];
    }
  };

  const actions = customActions || getContextualActions();

  if (actions.length === 0) return null;

  // Se tem apenas uma ação, mostra botão simples
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white border-0"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.icon}
        </Button>
      </div>
    );
  }

  // Se tem múltiplas ações, mostra dropdown
  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white border-0"
            aria-label="Ações rápidas"
          >
            {isOpen ? (
              <MoreHorizontal className="h-6 w-6 rotate-90 transition-transform duration-200" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-56 mb-2"
          sideOffset={8}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={action.onClick}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                {action.icon}
              </div>
              <span className="font-medium">{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuickActions;
