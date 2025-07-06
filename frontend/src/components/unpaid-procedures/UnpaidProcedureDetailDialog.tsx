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
import { Eye, Clock, Users, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { DataGrid } from '@/components/ui/data-grid';
import { formatCurrency } from '@/utils/format';

interface DoctorParticipation {
  role: string;
  crm: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface UnpaidProcedureProps {
  id: string;
  guia: string;
  dataExecucao: string;
  codigoProcedimento: string;
  descricaoProcedimento: string;
  beneficiario: string;
  prestador: string;
  papel: string;
  valorCBHPM: number;
  valorPago: number;
  diferenca: number;
  motivoGlosa?: string;
  tipo: 'glosa' | 'nao_pago';
  status: 'pendente' | 'contestado' | 'recuperado';
  doctors?: DoctorParticipation[];
}

const participationColumns = [
  { field: 'role', headerName: 'Função', width: 150 },
  { field: 'crm', headerName: 'CRM', width: 100 },
  { field: 'name', headerName: 'Médico', flex: 1 },
  {
    field: 'period',
    headerName: 'Período',
    width: 200,
    renderCell: ({ row }) => {
      const startTime = row.startTime.split(' ')[1] || '';
      const endTime = row.endTime.split(' ')[1] || '';

      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {startTime} - {endTime}
          </span>
        </div>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: ({ value }) => (
      <Badge variant={value === 'Fechada' ? 'success' : 'default'}>{value}</Badge>
    ),
  },
];

export function UnpaidProcedureDetailDialog({
  procedure,
}: {
  procedure: UnpaidProcedureProps;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Procedimento {procedure.tipo === 'glosa' ? 'Glosado' : 'Não Pago'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Procedure info */}
          <Card className="bg-muted/10">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">
                      {procedure.codigoProcedimento}
                    </h3>
                    <p className="text-muted-foreground">
                      {procedure.descricaoProcedimento}
                    </p>
                  </div>
                  <Badge
                    variant={procedure.tipo === 'glosa' ? 'destructive' : 'secondary'}
                    className="text-sm"
                  >
                    {procedure.tipo === 'glosa' ? 'Glosa' : 'Não Pago'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Beneficiário</p>
                    <p className="font-medium">{procedure.beneficiario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prestador</p>
                    <p className="font-medium">{procedure.prestador}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nº Guia</p>
                    <p className="font-medium">{procedure.guia}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Execução</p>
                    <p className="font-medium">{procedure.dataExecucao}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={procedure.valorCBHPM > 0 ? 'bg-blue-50' : 'bg-muted'}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <div className="text-sm text-muted-foreground">Valor CBHPM</div>
                  <div className="font-medium text-lg">
                    {formatCurrency(procedure.valorCBHPM)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={procedure.valorPago > 0 ? 'bg-green-50' : 'bg-muted'}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                  <div className="text-sm text-muted-foreground">Valor Pago</div>
                  <div className="font-medium text-lg">
                    {formatCurrency(procedure.valorPago)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                  <div className="text-sm text-muted-foreground">Diferença</div>
                  <div className="font-medium text-lg">
                    {formatCurrency(Math.abs(procedure.diferenca))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Glosa reason if available */}
          {procedure.tipo === 'glosa' && procedure.motivoGlosa && (
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Motivo da Glosa</h3>
                    <p className="text-muted-foreground">{procedure.motivoGlosa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor participations if available */}
          {procedure.doctors && procedure.doctors.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Participações Médicas</h3>
                </div>

                <DataGrid
                  rows={procedure.doctors}
                  columns={participationColumns}
                  pageSize={5}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
