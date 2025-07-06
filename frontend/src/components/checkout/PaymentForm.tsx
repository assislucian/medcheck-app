import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, Landmark, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PaymentMethod } from './types';

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmit: (data: any) => void;
  isProcessing: boolean;
}

// Create form schema based on payment method
const createFormSchema = (paymentMethod: PaymentMethod) => {
  const baseSchema = {
    name: z.string().min(3, 'Nome completo é obrigatório'),
  };

  if (paymentMethod === 'credit_card') {
    return z.object({
      ...baseSchema,
      cardName: z.string().min(3, 'Nome no cartão é obrigatório'),
      cardNumber: z
        .string()
        .min(13, 'Número do cartão inválido')
        .max(19, 'Número do cartão inválido')
        .regex(/^[0-9]+$/, 'Apenas números são permitidos'),
      expiryDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Data inválida (MM/YY)'),
      cvv: z
        .string()
        .min(3, 'CVV inválido')
        .max(4, 'CVV inválido')
        .regex(/^[0-9]+$/, 'Apenas números são permitidos'),
    });
  } else if (paymentMethod === 'bank_slip') {
    return z.object({
      ...baseSchema,
      document: z
        .string()
        .min(11, 'CPF/CNPJ inválido')
        .max(18, 'CPF/CNPJ inválido')
        .regex(/^[0-9.\\-]+$/, 'Formato inválido'),
      email: z.string().email('E-mail inválido'),
    });
  } else {
    // PIX just needs name
    return z.object({
      ...baseSchema,
      email: z.string().email('E-mail inválido'),
    });
  }
};

export function PaymentForm({
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
  isProcessing,
}: PaymentFormProps) {
  // Get schema based on current payment method
  const formSchema = createFormSchema(paymentMethod);

  // Create form with the dynamic schema
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      document: '',
      email: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      paymentMethod,
      ...data,
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
        <CardDescription>Escolha como deseja pagar sua assinatura</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Selecione o método de pagamento</Label>
              <RadioGroup
                defaultValue={paymentMethod}
                onValueChange={(value) => onPaymentMethodChange(value as PaymentMethod)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div
                  className={`border rounded-md p-4 flex items-center space-x-3 ${paymentMethod === 'credit_card' ? 'ring-2 ring-primary' : ''}`}
                >
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label
                    htmlFor="credit_card"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" /> Cartão de Crédito
                  </Label>
                </div>

                <div
                  className={`border rounded-md p-4 flex items-center space-x-3 ${paymentMethod === 'bank_slip' ? 'ring-2 ring-primary' : ''}`}
                >
                  <RadioGroupItem value="bank_slip" id="bank_slip" />
                  <Label
                    htmlFor="bank_slip"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Landmark className="h-4 w-4" /> Boleto Bancário
                  </Label>
                </div>

                <div
                  className={`border rounded-md p-4 flex items-center space-x-3 ${paymentMethod === 'pix' ? 'ring-2 ring-primary' : ''}`}
                >
                  <RadioGroupItem value="pix" id="pix" />
                  <Label
                    htmlFor="pix"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" /> PIX
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === 'credit_card' && (
              <>
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome no cartão</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome como está no cartão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do cartão</FormLabel>
                      <FormControl>
                        <Input placeholder="0000 0000 0000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade (MM/YY)</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {paymentMethod === 'bank_slip' && (
              <>
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail para recebimento do boleto</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {paymentMethod === 'pix' && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail para recebimento do PIX</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-secondary/30 p-4 rounded-md text-sm">
                  <p>Após confirmar, você receberá um código PIX para pagamento.</p>
                  <p>
                    O acesso ao plano será liberado após a confirmação do pagamento.
                  </p>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Assinatura'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
