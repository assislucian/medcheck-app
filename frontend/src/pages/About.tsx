import { PublicLayout } from '@/layout/PublicLayout';
import { MissionSection } from '@/components/about/MissionSection';
import { ProblemsSection } from '@/components/about/ProblemsSection';
import { SolutionsSection } from '@/components/about/SolutionsSection';
import { BenefitsSection } from '@/components/about/BenefitsSection';
import { TestimonialsSection } from '@/components/about/TestimonialsSection';
import { CtaSection } from '@/components/about/CtaSection';

const About = () => {
  return (
    <PublicLayout
      title="Sobre o MedCheck"
      description="Conheça a plataforma que está revolucionando a gestão de honorários médicos no Brasil."
      showBackButton={true}
    >
      <div className="flex flex-col">
        <MissionSection />
        <ProblemsSection />
        <SolutionsSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CtaSection />
      </div>
    </PublicLayout>
  );
};

export default About;
