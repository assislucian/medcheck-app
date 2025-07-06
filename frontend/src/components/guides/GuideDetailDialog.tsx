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
import { Eye, Clock, Users } from 'lucide-react';
import { DataGrid } from '@/components/ui/data-grid';

interface DoctorParticipation {
  role: string;
  crm: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Procedure {
  code: string;
  description: string;
  quantity: number;
  status: string;
  doctors: DoctorParticipation[];
}

interface GuideData {
  numero: string;
  dataExecucao: string;
  beneficiario: string;
  prestador: string;
  execucao: string;
  procedimentos: Procedure[];
}

const proceduresColumns = [
  { field: 'code', headerName: 'Código', width: 120 },
  { field: 'description', headerName: 'Descrição', flex: 1 },
  { field: 'quantity', headerName: 'Qtd', width: 80 },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: ({ value }) => (
      <Badge variant={value === 'Fechada' ? 'success' : 'default'}>{value}</Badge>
    ),
  },
];

const participationColumns = [
  { field: 'role', headerName: 'Função', width: 150 },
  { field: 'crm', headerName: 'CRM', width: 100 },
  { field: 'name', headerName: 'Médico', flex: 1 },
  {
    field: 'period',
    headerName: 'Período',
    width: 200,
    renderCell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>
          {row.startTime.split(' ')[1]} - {row.endTime.split(' ')[1]}
        </span>
      </div>
    ),
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

export function GuideDetailDialog({ guide }: { guide: GuideData }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border border-border text-foreground hover:bg-surface-2 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Guia - {guide.numero}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Data Execução</div>
                  <div className="font-medium">{guide.dataExecucao}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="flex flex-col">
                  <div className="text-sm text-muted-foreground">Beneficiário</div>
                  <div className="font-medium">{guide.beneficiario}</div>
                  <div className="text-sm text-muted-foreground mt-2">Prestador</div>
                  <div className="font-medium">{guide.prestador}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Procedimentos e Participações</h3>
              </div>

              {guide.procedimentos.map((proc, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {proc.code} - {proc.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantidade: {proc.quantity}
                        </div>
                      </div>
                      <Badge
                        variant={proc.status === 'Fechada' ? 'success' : 'default'}
                      >
                        {proc.status}
                      </Badge>
                    </div>
                  </div>

                  <DataGrid
                    rows={proc.doctors}
                    columns={participationColumns}
                    pageSize={3}
                    className="min-h-[200px]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
