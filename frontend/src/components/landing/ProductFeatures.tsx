import {
  CheckCircle,
  Shield,
  Microscope,
  BriefcaseMedical,
  BarChart,
  Sparkles,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ProductFeatures() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/10 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tecnologia avançada para{' '}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                maximizar seus resultados
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nossa plataforma integra inteligência artificial e análise avançada de
              dados para automatizar processos que antes eram manuais e demorados.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Detecção automática de inconsistências
                  </h3>
                  <p className="text-muted-foreground">
                    Nossa IA identifica padrões de glosa e erros de pagamento que
                    passariam despercebidos.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Dashboard intuitivo</h3>
                  <p className="text-muted-foreground">
                    Visualize métricas importantes e acompanhe seu progresso em tempo
                    real.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Conformidade com normas brasileiras
                  </h3>
                  <p className="text-muted-foreground">
                    Totalmente adaptado às normas do CFM e operadoras de saúde
                    brasileiras.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <Button asChild className="rounded-md">
                <Link to="/how-it-works">Saiba como funciona</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-background rounded-xl border border-border/50 shadow-xl p-6 md:p-8 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <BarChart className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">Análise de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize padrões e tendências de pagamento
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">IA Integrada</h3>
                  <p className="text-sm text-muted-foreground">
                    Detecção automática de inconsistências
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Download className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">Relatórios</h3>
                  <p className="text-sm text-muted-foreground">
                    Documentação completa para contestações
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="font-medium">Segurança</h3>
                  <p className="text-sm text-muted-foreground">
                    Criptografia de ponta a ponta
                  </p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">+30%</div>
                  <p className="text-sm text-muted-foreground">
                    Aumento médio de faturamento
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">80%</div>
                  <p className="text-sm text-muted-foreground">
                    Redução de tempo em auditoria
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <p className="text-sm text-muted-foreground">Precisão nas análises</p>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
