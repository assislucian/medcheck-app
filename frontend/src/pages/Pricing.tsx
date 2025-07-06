import { PublicLayout } from '@/layout/PublicLayout';
import { PricingSection } from '@/components/landing/PricingSection';

const PricingPage = () => {
  return (
    <PublicLayout
      title="Planos e Preços | MedCheck"
      description="Conheça nossos planos e escolha o ideal para sua necessidade"
      showBackButton={true}
    >
      <div className="py-8">
        <PricingSection />
      </div>
    </PublicLayout>
  );
};

export default PricingPage;
