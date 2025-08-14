import { CheckCircle, Microscope, BriefcaseMedical, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Microscope,
    title: 'Auditoria CBHPM Automatizada',
    description:
      'Comparação automática entre seus honorários e a tabela CBHPM 2015 oficial. Identifica divergências de valores em segundos, ajudando você a cobrar o valor correto.',
    benefit: 'Honorários mais precisos',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: CheckCircle,
    title: 'Contestação com Base Legal',
    description:
      'Geração de documentos de contestação fundamentados na legislação ANS (Lei 13.003/2014, RN 503/2022). Templates profissionais prontos em minutos.',
    benefit: 'Documentos juridicamente sólidos',
    color: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: BriefcaseMedical,
    title: 'Controle de Demonstrativos',
    description:
      'Cruzamento inteligente entre guias enviadas e demonstrativos recebidos. Identifica procedimentos não pagos e discrepâncias de valores automaticamente.',
    benefit: 'Visibilidade completa dos pagamentos',
    color: 'bg-purple-50 dark:bg-purple-950/30',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Shield,
    title: 'Gestão de Prazos',
    description:
      'Dashboard com alertas automáticos de prazos de contestação. Relatórios de performance por convênio e histórico detalhado de todas as movimentações.',
    benefit: 'Nunca mais perca prazos',
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
            Como médicos brasileiros estão <strong className="text-blue-600">organizando melhor</strong> suas{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              finanças médicas
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            <strong>Plataforma inteligente</strong> que automatiza a gestão de honorários, identifica glosas contestáveis e organiza seus demonstrativos de pagamento
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
                <p className="text-muted-foreground mb-3">{benefit.description}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  🎯 {benefit.benefit}
                </div>
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
          <div className="space-y-4">
            <Button asChild size="lg" className="text-lg px-10 py-4 h-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-xl">
              <Link to="/register">Começar Teste Gratuito - 14 Dias</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              ✅ <strong>Teste GRÁTIS por 14 dias</strong> • ✅ <strong>Sem cartão de crédito</strong> • ✅ <strong>Suporte incluído</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
