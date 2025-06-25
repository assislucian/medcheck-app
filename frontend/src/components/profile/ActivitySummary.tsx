import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ActivitySummary = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="font-medium">Documentos Analisados:</dt>
            <dd>127</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Divergências Detectadas:</dt>
            <dd>42</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Taxa de Divergência:</dt>
            <dd>33%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Valor Total Recuperado:</dt>
            <dd>R$ 12.450,75</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
