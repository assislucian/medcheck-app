import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/landing/HeroSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';

const HomePage = () => {
  return (
    <MainLayout title="Home">
      <HeroSection />
      <BenefitsSection />
      <DemoSection />
      <PricingSection />
    </MainLayout>
  );
};

export default HomePage;
