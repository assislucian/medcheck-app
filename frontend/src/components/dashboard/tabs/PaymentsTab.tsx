import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Procedure } from '@/types/medical';

interface PaymentsTabProps {
  procedures?: Procedure[];
}

const PaymentsTab = ({ procedures }: PaymentsTabProps) => {
  // Fallback seguro
  const data = Array.isArray(procedures) ? procedures : [];
  // Ordenar por data (se disponível) ou id
  const sorted = [...data].sort((a, b) => {
    // Se houver campo de data, usar, senão por id
    return (
      (b as any).created_at?.localeCompare?.((a as any).created_at) ||
      String(b.id).localeCompare(String(a.id))
    );
  });
  const recent = sorted.slice(0, 3);

  // Agrupar por função para o comparativo
  const roles = [
    { key: 'cirurgiao', label: 'Cirurgião' },
    { key: 'primeiro auxiliar', label: '1º Auxiliar' },
    { key: 'segundo auxiliar', label: '2º Auxiliar' },
    { key: 'anestesista', label: 'Anestesista' },
  ];
  const comparativo = roles.map((role) => {
    const filtered = data.filter((p) =>
      (p.papel || p.funcao || '').toLowerCase().includes(role.key)
    );
    if (filtered.length === 0) return { ...role, percent: 0 };
    const totalPago = filtered.reduce((acc, p) => acc + (p.valorPago || 0), 0);
    const totalTabela = filtered.reduce(
      (acc, p) => acc + (p.valorCBHPM || p.valorTabela2015 || 0),
      0
    );
    const percent = totalTabela > 0 ? (totalPago / totalTabela) * 100 : 0;
    return { ...role, percent: Math.round(percent) };
  });
  // Média geral
  const totalPago = data.reduce((acc, p) => acc + (p.valorPago || 0), 0);
  const totalTabela = data.reduce(
    (acc, p) => acc + (p.valorCBHPM || p.valorTabela2015 || 0),
    0
  );
  const mediaGeral = totalTabela > 0 ? Math.round((totalPago / totalTabela) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recent.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhum procedimento encontrado nos últimos 30 dias.
              </div>
            )}
            {recent.map((proc) => (
              <div key={proc.id} className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">
                    {proc.codigo} - {proc.procedimento || proc.descricao}
                  </div>
                  <Badge variant={proc.pago ? 'success' : 'destructive'}>
                    {proc.pago ? 'Pago' : 'Glosado'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>
                    {proc.valorPago !== undefined
                      ? proc.valorPago.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : 'R$ 0,00'}
                  </span>
                  <span>
                    {(proc as any).created_at
                      ? new Date((proc as any).created_at).toLocaleDateString('pt-BR')
                      : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full flex items-center gap-1"
            >
              <Link to="/guides">Ver todas as guias</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Valor pago vs. CBHPM 2015</p>
                <p className="text-xs text-muted-foreground">
                  Média dos últimos 30 dias
                </p>
              </div>
              <div className="text-2xl font-bold text-success">{mediaGeral}%</div>
            </div>
            {comparativo.map((role) => (
              <div className="space-y-2" key={role.key}>
                <div className="flex justify-between text-sm">
                  <span>{role.label}</span>
                  <span
                    className={
                      role.percent >= 90
                        ? 'font-medium text-success'
                        : role.percent >= 80
                          ? 'font-medium text-warning'
                          : 'font-medium text-destructive'
                    }
                  >
                    {role.percent}%
                  </span>
                </div>
                <div className={`rounded-full bg-muted h-2 w-full overflow-hidden`}>
                  <div
                    className={
                      role.percent >= 90
                        ? 'bg-success'
                        : role.percent >= 80
                          ? 'bg-warning'
                          : 'bg-destructive'
                    }
                    style={{ width: `${role.percent}%`, height: '100%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full flex items-center gap-1"
            >
              <Link to="/compare">Ver comparativo detalhado</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsTab;
