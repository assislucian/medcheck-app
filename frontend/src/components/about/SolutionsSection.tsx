import { motion } from 'framer-motion';
import { SolutionCard } from './solutions/SolutionCard';
import { FileSearch, BarChart3, FileCheck, Zap } from 'lucide-react';

export function SolutionsSection() {
  const solutionCards = [
    {
      icon: <FileSearch className="h-10 w-10 text-primary" />,
      title: 'Auditoria Automatizada',
      description:
        'Nosso sistema analisa automaticamente guias e demonstrativos, identificando divergências entre o que foi cobrado e o que foi efetivamente pago.',
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: 'Análise Detalhada',
      description:
        'Geramos relatórios completos com todas as inconsistências encontradas, valores glosados e oportunidades de recuperação financeira.',
    },
    {
      icon: <FileCheck className="h-10 w-10 text-primary" />,
      title: 'Contestação Facilitada',
      description:
        'Oferecemos modelos e ferramentas para agilizar o processo de contestação de glosas junto às operadoras de saúde.',
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: 'Resultados Rápidos',
      description:
        'Nossa tecnologia permite detectar oportunidades de recuperação em minutos, ao invés de dias ou semanas de trabalho manual.',
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Nossas Soluções</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            O MedCheck oferece um conjunto de soluções integradas para transformar a
            gestão financeira de honorários médicos e maximizar seus resultados:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutionCards.map((card, index) => (
            <SolutionCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
