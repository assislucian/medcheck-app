import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, ArrowDown, ArrowUp, FileText } from 'lucide-react';

interface CBHPMSummaryCardsProps {
  total: number;
  conforme: number;
  abaixo: number;
  acima: number;
}

const CBHPMSummaryCards: React.FC<CBHPMSummaryCardsProps> = ({
  total,
  conforme,
  abaixo,
  acima,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground">Total de Procedimentos</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <BadgeCheck className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{conforme}</p>
            <p className="text-sm text-muted-foreground">Conforme Tabela</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <ArrowDown className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-2xl font-bold">{abaixo}</p>
            <p className="text-sm text-muted-foreground">Abaixo da Tabela</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <ArrowUp className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{acima}</p>
            <p className="text-sm text-muted-foreground">Acima da Tabela</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CBHPMSummaryCards;
