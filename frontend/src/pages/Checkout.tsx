import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MainLayout } from '@/components/layout/MainLayout';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethod } from '@/components/checkout/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan info from navigation state
  const planInfo = location.state;

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      toast.error('Você precisa estar logado para finalizar sua compra');
      navigate('/login?redirect=/pricing');
      return;
    }

    // Redirect if no plan was selected
    if (!planInfo || !planInfo.planId) {
      toast.error('Selecione um plano antes de prosseguir para o pagamento');
      navigate('/pricing');
    }
  }, [user, planInfo, navigate]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePaymentSubmit = async (data: any) => {
    setIsProcessing(true);

    try {
      // Here you would integrate with your payment processor
      // For now, we'll just simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      toast.success('Assinatura ativada com sucesso!');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.'
      );
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!planInfo) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Helmet>
        <title>Checkout | MedCheck</title>
      </Helmet>
      <MainLayout
        title="Checkout"
        description="Finalize sua assinatura do MedCheck Premium"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <PaymentForm
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                onSubmit={handlePaymentSubmit}
                isProcessing={isProcessing}
              />
            </div>

            <div>
              <OrderSummary
                planName={planInfo.planName}
                price={planInfo.price}
                interval={planInfo.interval}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default CheckoutPage;
