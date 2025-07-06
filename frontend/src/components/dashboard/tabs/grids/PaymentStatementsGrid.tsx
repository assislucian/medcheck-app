import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { paymentStatementsColumns } from '../columns/paymentStatementsColumns';
import { PaymentStatement } from '@/types/medical';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface PaymentStatementsGridProps {
  payments: PaymentStatement[];
}

export const PaymentStatementsGrid = ({ payments }: PaymentStatementsGridProps) => {
  // Calculate summary stats
  const totalPaid = payments.reduce((sum, p) => sum + (p.valorPago || 0), 0);
  const belowTableCount = payments.filter((p) => p.diferenca < -10).length;

  return (
    <Card>
      <CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10">
            <TrendingUp className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">Total Recebido</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalPaid)}
              </p>
            </div>
          </div>

          {belowTableCount > 0 && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Abaixo da CBHPM</p>
                <p className="text-2xl font-bold">
                  {belowTableCount} procedimento{belowTableCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <DataGrid
          rows={payments}
          columns={paymentStatementsColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          className="min-h-[500px]"
        />
      </CardContent>
    </Card>
  );
};
