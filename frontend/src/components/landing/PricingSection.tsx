import PricingPlans from '@/components/PricingPlans';
import { useAuth } from '@/contexts/AuthContext';

export function PricingSection() {
  const { user } = useAuth();

  const handleCheckoutRedirect = () => {
    return true;
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <PricingPlans
          isLoggedIn={!!user}
          isTrial={false}
          onCheckout={handleCheckoutRedirect}
        />
      </div>
    </section>
  );
}
