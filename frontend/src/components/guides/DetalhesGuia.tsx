import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, X } from 'lucide-react';
import { DataGrid } from '@/components/ui/data-grid';
import React from 'react';
import { GuideProcedure } from '@/types/medical';

interface DetalhesGuiaProps {
  guia: string;
  procedimentos: GuideProcedure[];
  onClose: () => void;
}

const detalhesColumns = [
  { field: 'data', headerName: 'Data de Execução', width: 120 },
  { field: 'codigo', headerName: 'Código', width: 120 },
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  { field: 'papel', headerName: 'Papel', width: 120 },
  { field: 'crm', headerName: 'CRM', width: 100 },
  { field: 'qtd', headerName: 'Qtd', width: 80 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: ({ value }: { value: string }) => (
      <Badge
        variant={
          value === 'Fechada' ? 'success' : value === 'Pendente' ? 'warning' : 'default'
        }
      >
        {value || '-'}
      </Badge>
    ),
  },
  {
    field: 'prestador',
    headerName: 'Prestador',
    width: 200,
    renderCell: ({ value }: { value: string }) => value || '-',
  },
];

const DetalhesGuia: React.FC<DetalhesGuiaProps> = ({
  guia,
  procedimentos,
  onClose,
}) => {
  if (!procedimentos || procedimentos.length === 0) return null;
  const beneficiario = procedimentos[0]?.beneficiario || '';
  const prestador = procedimentos[0]?.prestador || '';
  const data = procedimentos
    .map((p) => p.data)
    .sort()
    .reverse()[0];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Guia {guia}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Data Execução</span>
                  <span className="font-medium">{data}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Beneficiário</span>
                  <span className="font-medium">{beneficiario}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground">Prestador</span>
                  <span className="font-medium">{prestador}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <DataGrid
            rows={procedimentos}
            columns={detalhesColumns}
            pageSize={5}
            className="min-h-[300px]"
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1" /> Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesGuia;
