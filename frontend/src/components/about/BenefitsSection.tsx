import { motion } from 'framer-motion';
import { BenefitItem } from './benefits/BenefitItem';
import {
  TrendingUp,
  Clock,
  FileSpreadsheet,
  CheckCircle,
  Database,
  ShieldCheck,
} from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: 'Aumento de Receita',
      description:
        'Recupere até 15% dos honorários glosados indevidamente pelas operadoras.',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Economia de Tempo',
      description:
        'Reduza em até 80% o tempo gasto com auditorias manuais e processos administrativos.',
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
      title: 'Relatórios Detalhados',
      description:
        'Acesse análises completas e visualize todo o potencial de recuperação.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Tecnologia em Nuvem',
      description:
        'Acesse seus dados de qualquer lugar, a qualquer momento, com total segurança.',
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: 'Histórico Completo',
      description:
        'Mantenha um registro organizado de todas as suas análises e recuperações.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Segurança e Conformidade',
      description:
        'Seus dados protegidos com criptografia e em total conformidade com a LGPD.',
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Por que escolher o MedCheck?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa plataforma oferece benefícios tangíveis e mensuráveis para
            profissionais de saúde e instituições médicas de todos os portes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
