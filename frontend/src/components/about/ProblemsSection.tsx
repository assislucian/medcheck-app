import { motion } from 'framer-motion';
import { ProblemCard } from './problems/ProblemCard';
import { CircleDashed, FileX, Clock, DollarSign } from 'lucide-react';

export function ProblemsSection() {
  const problemCards = [
    {
      icon: <FileX className="h-10 w-10 text-red-500" />,
      title: 'Glosas Indevidas',
      description:
        'Operadoras e seguradoras frequentemente glosam procedimentos de forma injustificada, causando prejuízos significativos aos profissionais de saúde.',
    },
    {
      icon: <CircleDashed className="h-10 w-10 text-amber-500" />,
      title: 'Processos Manuais',
      description:
        'A auditoria manual de honorários é trabalhosa, sujeita a erros e consome um tempo precioso que poderia ser dedicado ao atendimento dos pacientes.',
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-500" />,
      title: 'Demora no Reprocessamento',
      description:
        'O processo de contestação e reprocessamento de glosas é lento e burocrático, gerando atrasos no recebimento de valores já realizados.',
    },
    {
      icon: <DollarSign className="h-10 w-10 text-green-500" />,
      title: 'Prejuízo Financeiro',
      description:
        'A combinação desses fatores resulta em uma perda financeira significativa para médicos, hospitais e clínicas em todo o Brasil.',
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Os Desafios da Auditoria Médica</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Os profissionais de saúde enfrentam diversos obstáculos na gestão financeira
            dos honorários médicos. Entenda os principais problemas que o MedCheck
            resolve:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problemCards.map((card, index) => (
            <ProblemCard
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
