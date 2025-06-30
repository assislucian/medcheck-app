import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
  BarChart3,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/50 dark:to-indigo-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_85%,rgba(139,92,246,0.08),transparent_70%)]" />

        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Content Section */}
          <motion.div
            className="lg:col-span-6 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Líder em auditoria médica no Brasil
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
                  Auditoria médica
                </span>
                <span className="block mt-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  simplificada
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Recupere valores glosados e maximize seus resultados com a plataforma que
              já ajudou mais de{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                10.000 médicos brasileiros
              </span>
              .
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl text-lg font-semibold px-8 py-6 h-auto shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <Link to="/register" className="flex items-center gap-2">
                  Comece agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-2xl text-lg font-semibold px-8 py-6 h-auto text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/how-it-works" className="flex items-center gap-2">
                  Como funciona
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              {[
                {
                  icon: Clock,
                  text: 'Economize até 80% do tempo',
                  color: 'text-green-500',
                },
                {
                  icon: DollarSign,
                  text: 'Recupere valores glosados',
                  color: 'text-blue-500',
                },
                {
                  icon: Shield,
                  text: 'Conformidade com LGPD',
                  color: 'text-purple-500',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 ${item.color}`}
                  >
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Section */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative">
              {/* Main dashboard preview */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/20 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 backdrop-blur-sm">
                <div className="aspect-[16/10] relative">
                  {/* Medical Dashboard Mockup */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            MedCheck Dashboard
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Auditoria em tempo real
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/80 dark:bg-slate-700/80 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheck className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Aprovadas
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          847
                        </div>
                        <div className="text-xs text-green-600">+12.5%</div>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-700/80 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Recuperado
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          R$ 89k
                        </div>
                        <div className="text-xs text-blue-600">+23.1%</div>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-700/80 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Tempo
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          -80%
                        </div>
                        <div className="text-xs text-purple-600">Economia</div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white/60 dark:bg-slate-700/60 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          Análise Mensal
                        </h4>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* Simple chart visualization */}
                      <div className="flex items-end gap-1 h-16">
                        {[40, 65, 45, 80, 60, 90, 75, 85].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500/70 to-purple-500/70 rounded-sm"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/5 rounded-3xl" />
                </div>

                {/* Floating stats cards */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl text-white transform rotate-3 hidden lg:block"
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 3 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  whileHover={{ scale: 1.05, rotate: 6 }}
                >
                  <div className="text-3xl font-bold">+80%</div>
                  <div className="text-sm opacity-90 font-medium">
                    Economia de tempo
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl text-white transform -rotate-3 hidden lg:block"
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: -3 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, rotate: -6 }}
                >
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-sm opacity-90 font-medium">Taxa de precisão</div>
                </motion.div>
              </div>

              {/* Background decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl -z-10" />
            </div>
          </motion.div>
        </div>

        {/* Premium Testimonial */}
        <motion.div
          className="mt-24 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="relative max-w-4xl">
            {/* Background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />

            {/* Testimonial card */}
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="lg:w-1/4 flex justify-center">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                      alt="Dr. Carla Mendes"
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="lg:w-3/4 text-center lg:text-left">
                  <blockquote className="text-xl lg:text-2xl text-slate-700 dark:text-slate-300 italic font-light leading-relaxed mb-6">
                    "O MedCheck transformou nossa auditoria médica, aumentando nosso
                    faturamento em 23% no primeiro trimestre de uso. A interface é
                    intuitiva e os resultados são impressionantes."
                  </blockquote>
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-slate-900 dark:text-white">
                      Dra. Carla Mendes
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Diretora Clínica, Hospital São Paulo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
