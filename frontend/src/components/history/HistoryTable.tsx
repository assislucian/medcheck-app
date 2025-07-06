/**
 * HistoryTable.tsx
 *
 * Componente que exibe os dados históricos em formato de tabela,
 * com colunas para data, tipo, descrição, quantidade de procedimentos,
 * procedimentos glosados, status e ações.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileCheck, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { type HistoryItem } from './data';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface HistoryTableProps {
  items: HistoryItem[];
}

/**
 * Tabela para exibição dos registros históricos de análise
 * Inclui informações detalhadas e botões de ação para visualizar ou exportar
 */
export function HistoryTable({ items }: HistoryTableProps) {
  const navigate = useNavigate();

  // Redireciona para a página de comparação com o ID da análise
  const handleViewDetails = (id: string) => {
    navigate(`/compare?analysisId=${id}`);
  };

  // Manipulador para exportar um relatório individual
  const handleDownloadReport = (item: HistoryItem) => {
    toast.info('Preparando download do relatório', {
      description: `Relatório de ${item.date} sendo gerado...`,
    });

    // Simulação do tempo de geração do relatório
    setTimeout(() => {
      toast.success('Relatório pronto para download', {
        description: `Relatório de análise ${item.description} baixado com sucesso.`,
      });
    }, 1500);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Procedimentos</TableHead>
                <TableHead className="text-center">Glosados</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>
                      {item.type === 'Guia' ? (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Guia
                        </Badge>
                      ) : item.type === 'Demonstrativo' ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          <FileCheck className="mr-1 h-3 w-3" />
                          Demonstrativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-secondary/10 text-secondary-foreground border-secondary/20"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          Ambos
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.procedimentos}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${item.glosados > 0 ? 'text-destructive' : 'text-success'}`}
                      >
                        {item.glosados}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(item.id)}
                        title="Ver detalhes"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadReport(item)}
                        title="Baixar relatório"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground font-medium">
                        Nenhum registro encontrado
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Tente ajustar os filtros ou faça upload de arquivos para análise
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
