import { Procedure } from '@/types/medical';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, HelpCircle, Users, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { findProcedureByCodigo, calculateTotalCBHPM } from '@/data/cbhpmData';
import { useState } from 'react';
import { ContestationDialog } from '../contestation/ContestationDialog';

interface ProceduresTableProps {
  procedimentos: Procedure[];
  isDetailView: boolean;
}

export const ProceduresTable = ({
  procedimentos,
  isDetailView,
}: ProceduresTableProps) => {
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [contestationOpen, setContestationOpen] = useState(false);

  const handleContestProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setContestationOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Guia</TableHead>
            <TableHead className="w-[300px]">Procedimento</TableHead>
            <TableHead>Médicos</TableHead>
            <TableHead className="text-right">Valor CBHPM</TableHead>
            <TableHead className="text-right">Valor Pago</TableHead>
            <TableHead className="text-right">Diferença</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedimentos.map((item) => {
            const cbhpmData = findProcedureByCodigo(item.codigo);
            const baseCBHPM = cbhpmData
              ? calculateTotalCBHPM(cbhpmData)
              : item.valorCBHPM;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.codigo}</TableCell>
                <TableCell>{item.guia}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {item.procedimento}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            CBHPM 2015: {cbhpmData?.descricao || item.procedimento}
                            <br />
                            Valor Base: R$ {baseCBHPM.toFixed(2)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Users className="h-4 w-4 mr-2" />
                        {item.doctors.length} médicos
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        {item.doctors.map((doctor) => (
                          <div
                            key={doctor.code}
                            className="flex flex-col space-y-1 border-b last:border-0 pb-2"
                          >
                            <span className="font-medium">{doctor.name}</span>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <Badge
                                variant={
                                  doctor.role === 'Cirurgião'
                                    ? 'info'
                                    : doctor.role === 'Primeiro Auxiliar'
                                      ? 'success'
                                      : doctor.role === 'Anestesista'
                                        ? 'warning'
                                        : 'neutral'
                                }
                              >
                                {doctor.role}
                              </Badge>
                              <span>CRM: {doctor.code}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="text-right">
                  R$ {item.valorCBHPM.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {item.pago ? `R$ ${item.valorPago.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {item.diferenca === 0 ? (
                    <span>-</span>
                  ) : (
                    <span
                      className={
                        item.diferenca < 0
                          ? 'text-danger font-medium'
                          : 'text-success font-medium'
                      }
                    >
                      {item.diferenca < 0 ? '-' : '+'} R${' '}
                      {Math.abs(item.diferenca).toFixed(2)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.pago ? (
                    item.diferenca < 0 ? (
                      <Badge variant="warning">Pago Parcialmente</Badge>
                    ) : (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pago Corretamente
                      </Badge>
                    )
                  ) : (
                    <Badge variant="danger">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Não Pago
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {(item.diferenca < 0 || !item.pago) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContestProcedure(item)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Contestar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedProcedure && (
        <ContestationDialog
          open={contestationOpen}
          onOpenChange={setContestationOpen}
          procedureDetails={{
            codigo: selectedProcedure.codigo,
            procedimento: selectedProcedure.procedimento,
            valorCBHPM: selectedProcedure.valorCBHPM,
            valorPago: selectedProcedure.valorPago,
            diferenca: selectedProcedure.diferenca,
            papel: selectedProcedure.doctors?.[0]?.role,
            justificativa: '',
          }}
        />
      )}
    </>
  );
};
