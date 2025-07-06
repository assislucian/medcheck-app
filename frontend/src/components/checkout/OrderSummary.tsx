import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';

interface OrderSummaryProps {
  planName: string;
  price: string;
  interval: 'monthly' | 'yearly';
}

export function OrderSummary({ planName, price, interval }: OrderSummaryProps) {
  const navigate = useNavigate();

  // Plan features based on plan name
  const getPlanFeatures = () => {
    switch (planName) {
      case 'Individual':
        return [
          '1 CRM registrado',
          'Uploads ilimitados',
          'Histórico completo',
          'Exportação para Excel',
          'Suporte por email',
        ];
      case 'Clínica':
        return [
          'Até 5 CRMs registrados',
          'Uploads ilimitados',
          'Histórico completo',
          'Exportação para Excel',
          'Suporte prioritário',
          'Dashboard avançado para clínicas',
          'Relatórios consolidados',
        ];
      case 'Premium':
        return [
          'CRMs ilimitados',
          'Uploads ilimitados',
          'Histórico completo',
          'Exportação personalizada',
          'Suporte premium 24/7',
          'Integrações com sistemas',
          'Dashboard personalizado',
          'Treinamento dedicado',
        ];
      default:
        return ['Features do plano selecionado', 'Suporte completo'];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Plano</span>
          <span className="font-semibold">{planName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Cobrança</span>
          <span>{interval === 'monthly' ? 'Mensal' : 'Anual'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Valor</span>
          <span className="font-semibold text-lg">{price}</span>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Inclui:</h4>
          <ul className="space-y-2">
            {getPlanFeatures().map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/pricing')}
        >
          Voltar para seleção de planos
        </Button>
      </CardFooter>
    </Card>
  );
}
