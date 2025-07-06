import { motion } from 'framer-motion';
import { MissionHeader } from './mission/MissionHeader';
import { MissionCard } from './mission/MissionCard';
import { Stethoscope, HeartPulse, BarChart } from 'lucide-react';

export function MissionSection() {
  const missionCards = [
    {
      icon: <Stethoscope className="h-12 w-12 text-primary" />,
      title: 'Excelência em Auditoria Médica',
      description:
        'Oferecemos a mais avançada tecnologia para automatizar e precisar a auditoria de honorários médicos, garantindo que profissionais da saúde recebam o valor justo pelo seu trabalho.',
    },
    {
      icon: <HeartPulse className="h-12 w-12 text-primary" />,
      title: 'Foco nos Profissionais de Saúde',
      description:
        'Entendemos as dificuldades de médicos e clínicas em lidar com operadoras e seguradoras. Nossa missão é recuperar o valor que lhes é devido, permitindo que se dediquem integralmente ao cuidado dos pacientes.',
    },
    {
      icon: <BarChart className="h-12 w-12 text-primary" />,
      title: 'Transparência e Resultados',
      description:
        'Nosso compromisso é com resultados mensuráveis e concretos. Através de relatórios detalhados e um processo transparente, mostramos claramente o impacto financeiro positivo em cada análise.',
    },
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        <MissionHeader />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, staggerChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {missionCards.map((card, index) => (
            <MissionCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
