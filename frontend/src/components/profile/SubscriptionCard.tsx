import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarDays, ShieldCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function SubscriptionCard() {
  const navigate = useNavigate();
  const hasActivePlan = true; // This should come from your subscription context/hook

  return (
    <Card className="w-full hover:bg-accent/5 transition-colors border-primary/10">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">Plano Atual</CardTitle>
          <CardDescription>Informações sobre seu plano</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {hasActivePlan ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium flex items-center gap-2">
                Plano Pro
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  Ativo
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">Renova em 25/jun/2025</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recursos incluídos:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Análises ilimitadas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Exportação de relatórios
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Suporte prioritário
                </li>
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/planos')}>
                Ver detalhes
              </Button>
              <Button variant="default" size="sm">
                Gerenciar assinatura
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">Nenhum plano selecionado</p>
            <Button
              variant="default"
              onClick={() => navigate('/planos')}
              className="w-full md:w-auto"
            >
              Ver Planos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
