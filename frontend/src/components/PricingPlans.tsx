import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PricingHeader } from './pricing/PricingHeader';
import { PricingPlan } from './pricing/PricingPlan';
import { PricingFAQ } from './pricing/PricingFAQ';
import { plans } from './pricing/planData';
import type { BillingInterval, PricingPlansProps } from './pricing/types';

const PricingPlans = ({ isLoggedIn, isTrial, onCheckout }: PricingPlansProps) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const navigate = useNavigate();

  const handlePlanSelect = (planId: string) => {
    const selectedPlan = filteredPlans.find((plan) => plan.id === planId);

    if (!selectedPlan) return;

    if (planId.includes('premium')) {
      toast('Fale com nossa equipe de vendas', {
        description: 'Entraremos em contato para criar uma solução personalizada.',
        action: {
          label: 'Contato',
          onClick: () => navigate('/contact'),
        },
      });
    } else {
      if (!onCheckout()) return;

      const stripePriceId =
        billingInterval === 'yearly' ? planId.replace('_monthly', '_yearly') : planId;

      navigate('/checkout', {
        state: {
          planId: stripePriceId,
          planName: selectedPlan.name,
          price: selectedPlan.price[billingInterval],
          interval: billingInterval,
        },
      });
    }
  };

  const filteredPlans = plans.map((plan) => ({
    ...plan,
    id:
      billingInterval === 'monthly' ? plan.id : plan.id.replace('_monthly', '_yearly'),
  }));

  return (
    <div className="space-y-10">
      <PricingHeader
        billingInterval={billingInterval}
        onIntervalChange={setBillingInterval}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <PricingPlan
            key={plan.id}
            plan={plan}
            billingInterval={billingInterval}
            isTrial={isTrial}
            onPlanSelect={handlePlanSelect}
          />
        ))}
      </div>

      <PricingFAQ />
    </div>
  );
};

export default PricingPlans;
