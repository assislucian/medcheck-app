import { CheckCircle, Microscope, BriefcaseMedical, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Microscope,
    title: 'Análise Inteligente',
    description:
      'Nossa tecnologia proprietária analisa automaticamente seus pagamentos e identifica inconsistências com precisão.',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: CheckCircle,
    title: 'Validação CBHPM',
    description:
      'Comparação automática entre valores cobrados e tabelas de referência atualizadas, garantindo que você seja pago corretamente.',
    color: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: BriefcaseMedical,
    title: 'Gestão Completa',
    description:
      'Acompanhe todo o processo de contestação de glosas através de dashboards informativos e relatórios detalhados.',
    color: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Shield,
    title: 'Segurança e Conformidade',
    description:
      'Seus dados protegidos com a mais alta tecnologia em nuvem e em conformidade com a LGPD e requisitos do CFM.',
    color: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que milhares de médicos escolhem o{' '}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              MedCheck
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como nossa plataforma transforma o processo de auditoria médica
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-row gap-4 p-6 rounded-xl bg-background border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className={`${benefit.color} p-3 rounded-xl h-fit`}>
                <benefit.icon className={`h-6 w-6 ${benefit.textColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="text-lg px-8 h-12 rounded-md">
            <Link to="/register">Experimente grátis por 14 dias</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
