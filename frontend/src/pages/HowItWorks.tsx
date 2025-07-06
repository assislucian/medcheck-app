import { PublicLayout } from '@/layout/PublicLayout';
import { SolutionsSection } from '@/components/about/SolutionsSection';
import { BenefitsSection } from '@/components/about/BenefitsSection';

const HowItWorksPage = () => {
  return (
    <PublicLayout
      title="Como Funciona | MedCheck"
      description="Entenda como o MedCheck pode ajudar sua prática médica"
      showBackButton={true}
    >
      <div className="space-y-20 py-10">
        <div className="container">
          <h1 className="text-4xl font-bold text-center mb-8">
            Como o MedCheck Funciona
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Conheça o passo a passo de como nossa plataforma automatiza e simplifica sua
            auditoria médica
          </p>
        </div>
        <SolutionsSection />
        <BenefitsSection />
      </div>
    </PublicLayout>
  );
};

export default HowItWorksPage;
