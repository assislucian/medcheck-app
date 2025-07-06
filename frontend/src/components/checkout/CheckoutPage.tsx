import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle, ArrowLeft, CreditCard, Clock } from 'lucide-react';

interface CheckoutPageProps {}

export default function CheckoutPage({}: CheckoutPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    planId: string;
    planName: string;
    price: string;
    interval: 'monthly' | 'yearly';
  } | null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    zip: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!state) {
    navigate('/pricing');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulando processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      toast.success('Assinatura realizada com sucesso!', {
        description: 'Obrigado por assinar o MedCheck. Sua conta foi atualizada.',
      });
    }, 2000);
  };

  if (isComplete) {
    return (
      <>
        <Helmet>
          <title>Assinatura Concluída | MedCheck</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Navbar isLoggedIn={false} />
          <div className="flex-1 container py-12 md:py-16 flex items-center justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center pb-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl">Assinatura Concluída</CardTitle>
                <CardDescription>
                  Sua assinatura foi processada com sucesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Plano</p>
                  <p className="text-base">{state.planName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Preço</p>
                  <p className="text-base">
                    {state.price} / {state.interval === 'monthly' ? 'mês' : 'ano'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Próxima cobrança</p>
                  <p className="text-base">
                    {new Date(
                      Date.now() +
                        (state.interval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button onClick={() => navigate('/dashboard')} size="lg">
                  Ir para o Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | MedCheck</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={false} />
        <div className="flex-1 container py-8 md:py-12">
          <Button variant="ghost" onClick={() => navigate('/pricing')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Planos
          </Button>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Dados de Pagamento</CardTitle>
                <CardDescription>
                  Complete os dados abaixo para finalizar sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Dados Pessoais</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Digite seu nome completo"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Dados do Cartão</h3>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Data de Validade</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/AA"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">Código de Segurança (CVV)</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="000"
                          value={formData.cvv}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Endereço de Cobrança</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Rua, número e complemento"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Sua cidade"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">CEP</Label>
                        <Input
                          id="zip"
                          name="zip"
                          placeholder="00000-000"
                          value={formData.zip}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Finalizar Assinatura
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Plano selecionado:</span>
                  <span>{state.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Período:</span>
                  <span>{state.interval === 'monthly' ? 'Mensal' : 'Anual'}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{state.price}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {state.interval === 'monthly'
                    ? 'Cobrado mensalmente'
                    : 'Cobrado anualmente'}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Você pode cancelar sua assinatura a qualquer momento através da página
                  de configurações da sua conta.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
