import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { useAuth } from '../contexts/auth/AuthContext';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { usePageSetup } from '../hooks/usePageSetup';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardActions } from '../components/dashboard/DashboardActions';
import { Button } from '../components/ui/button';
import { SkeletonInfoCard } from '../components/ui/SkeletonInfoCard';
import { AlertCircle, BarChart3, Brain, ChevronRight, Search, Target, Upload, Shield, FileText, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SmartAlertsSystem } from '../components/intelligence/SmartAlertsSystem';
import { SmartSkeleton, MedicalLoadingState } from '../components/ui/SmartLoadingStates';

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();

  // SEO unificado
  usePageSetup('dashboard');

  // Event listeners para QuickActions (botão flutuante)
  useEffect(() => {
    const handleUploadDocuments = () => {
      // Redirecionar para página de guias onde o upload pode ser feito
      window.location.href = '/guides';
    };

    const handleExportDashboardCSV = () => {
      // Exportar dados do dashboard
      if (stats && stats.procedures && stats.procedures.length > 0) {
        const csvData = stats.procedures.map(proc => ({
          'Código': proc.codigo,
          'Descrição': proc.descricao,
          'Valor CBHPM': proc.valorCBHPM || 0,
          'Valor Pago': proc.valorPago || 0,
          'Status': proc.pago ? 'Pago' : 'Pendente',
          'Data': new Date().toLocaleDateString('pt-BR')
        }));

        // Converter para CSV
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
          )
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_medcheck_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Dados do dashboard exportados com sucesso!');
      } else {
        toast.info('Nenhum dado disponível para exportar');
      }
    };

    // Adicionar listeners
    window.addEventListener('exportGuidesCSV', handleExportDashboardCSV);
    
    // Cleanup
    return () => {
      window.removeEventListener('exportGuidesCSV', handleExportDashboardCSV);
    };
  }, [stats]);

  const backendTotals = stats?.totals;
  const totals = {
    totalRecebido: backendTotals?.totalRecebido ?? 0,
    totalGlosado: backendTotals?.totalGlosado ?? 0,
    totalProcedimentos: backendTotals?.totalProcedimentos ?? 0,
    auditoriaPendente: backendTotals?.auditoriaPendente ?? 0,
  };

  const valorApresentado = totals.totalRecebido + totals.totalGlosado;
  const taxaSucesso =
    valorApresentado > 0 ? (totals.totalRecebido / valorApresentado) * 100 : 0;

  // Análises inteligentes para insights
  const procedures: Procedure[] = stats?.procedures || [];
  const recentProcedures = procedures.slice(0, 5);
  const glosasRecentes = stats?.glosas?.slice(0, 3) || [];

  // Métricas de performance
  const procedimentosPagos = procedures.filter((p) => p.pago).length;
  const procedimentosGlosados = procedures.filter(
    (p) => !p.pago && totals.totalGlosado > 0
  ).length;
  const valorMedioRecebido =
    procedimentosPagos > 0 ? totals.totalRecebido / procedimentosPagos : 0;

  // Verificar se há dados para mostrar mensagens adequadas
  const hasData = stats?.hasData === true; // Só considera que tem dados se explicitamente for true
  
  // Status e alertas inteligentes - ajustados para realidade brasileira
  const temGlosasCriticas = totals.totalGlosado > totals.totalRecebido * 0.15; // > 15%
  const taxaSucessoBaixa = taxaSucesso < 85;
  const poucosAnalisados = totals.totalProcedimentos < 5;
  const needsAttention = hasData && (temGlosasCriticas || taxaSucessoBaixa || poucosAnalisados);

  return (
    <>
      <Helmet>
        <title>Minha Prática Médica | MedCheck</title>
        <meta
          name="description"
          content="Acompanhe seus honorários, glosas e demonstrativos de forma clara e organizada. Sua gestão médica simplificada."
        />
        <meta
          name="keywords"
          content="honorários médicos, glosas planos de saúde, demonstrativos pagamento, gestão médica, auditoria médica"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Minha Prática Médica | MedCheck" />
        <meta
          property="og:description"
          content="Gestão médica simplificada - acompanhe seus honorários e demonstrativos"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck - Gestão Médica',
            description:
              'Plataforma para acompanhamento de honorários médicos e análise de demonstrativos de planos de saúde',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      {/* Background com Gradiente Âmbar Suave */}
      <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
        <AuthenticatedLayout
          title="Minha Prática Médica"
          description="Acompanhe seus honorários, glosas e pendências de forma clara e organizada. Sua gestão médica simplificada."
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">
            {/* Sistema de Alertas Inteligentes */}
            <SmartAlertsSystem />

            {/* Header Componentizado */}
            <DashboardHeader 
              userName={userProfile?.nome}
              hasData={hasData}
              needsAttention={needsAttention}
            />

            {/* Dashboard Content */}
            <div className="space-y-16">
              {isLoading ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <SkeletonInfoCard key={idx} />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-6 py-16 text-center">
                  <div className="p-6 rounded-full bg-gradient-to-br from-red-100 to-red-50">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-red-700">
                      Ops! Conexão instável
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Não conseguimos carregar seus dados no momento. Pode ser a internet ou nossos servidores. Vamos tentar de novo?
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : !hasData ? (
                <>
                  {/* Cards Principais - Jornada do Médico (Onboarding) */}
                  <section className="space-y-8 mt-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                          <Target className="h-6 w-6 text-blue-700" />
                        </div>
                        🚀 Vamos organizar seus honorários!
                      </h2>
                      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        <strong>Em 3 passos simples</strong>, você vai organizar suas guias, analisar demonstrativos e ter controle total dos seus honorários. 
                        Comece agora e tenha <strong>transparência completa</strong> sobre seus recebimentos!
                      </p>
                    </div>
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {/* Guias Médicas - Prioridade 1 */}
                      <Link to="/guides">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 group-hover:from-blue-100 group-hover:via-indigo-100 group-hover:to-blue-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-110 transition-transform duration-300">
                                  <Upload className="h-8 w-8 text-blue-700" />
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                  Essencial
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-blue-800">
                                  Enviar Guias Médicas
                                </h3>
                                <p className="text-blue-600 leading-relaxed">
                                  O primeiro passo para receber seus honorários.
                                  Organize e envie suas guias de forma prática e segura.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-blue-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Começar agora</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      {/* Demonstrativos - Prioridade 2 */}
                      <Link to="/demonstratives">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 group-hover:from-emerald-100 group-hover:via-green-100 group-hover:to-emerald-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 group-hover:scale-110 transition-transform duration-300">
                                  <FileText className="h-8 w-8 text-emerald-700" />
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  Importante
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-emerald-800">
                                  Conferir Demonstrativos
                                </h3>
                                <p className="text-emerald-600 leading-relaxed">
                                  Analise os pagamentos dos planos de saúde e
                                  identifique discrepâncias nos seus honorários.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Analisar pagamentos</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      {/* Glosas Pendentes - Prioridade 3 */}
                      <Link to="/unpaid-procedures">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-medical-50 via-brand-50 to-trust-100 group-hover:from-medical-100 group-hover:via-brand-100 group-hover:to-trust-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-500 to-brand-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-medical-100 to-brand-100 group-hover:scale-110 transition-transform duration-300">
                                  <Shield className="h-8 w-8 text-medical-700" />
                                </div>
                                <Badge className="bg-medical-100 text-medical-700 border-medical-200">
                                  Urgente
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-medical-800">
                                  Contestar Glosas
                                </h3>
                                <p className="text-medical-600 leading-relaxed">
                                  Defenda seus direitos! Conteste glosas indevidas e
                                  recupere valores que são seus por direito.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-medical-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Contestar agora</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>
                  {/* Seção de Ferramentas Adicionais */}
                  <section className="space-y-8 mt-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        🛠️ Ferramentas Extras (Opcionais)
                      </h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        Depois que recuperar seus honorários, use essas ferramentas para <strong>nunca mais perder dinheiro</strong>
                      </p>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      {/* Relatórios */}
                      <Link to="/reports">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-gray-50 to-slate-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100">
                                <BarChart3 className="h-6 w-6 text-gray-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-800">
                                  Relatórios
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Análises detalhadas
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      {/* Central de Inteligência */}
                      <Link to="/intelligence">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                                <Brain className="h-6 w-6 text-purple-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-purple-800">
                                  🧠 Robô Inteligente
                                </h3>
                                <p className="text-sm text-purple-600">
                                  Dicas para ganhar mais
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-purple-400 ml-auto group-hover:text-purple-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      {/* Análise Comparativa */}
                      <Link to="/comparison">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                                <Search className="h-6 w-6 text-teal-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-teal-800">
                                  🔍 Comparar Tabelas
                                </h3>
                                <p className="text-sm text-teal-600">CBHPM vs. Planos</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-teal-400 ml-auto group-hover:text-teal-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  {/* Cards Principais - Jornada do Médico */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                          <DollarSign className="h-6 w-6 text-amber-700" />
                        </div>
                        💰 Seus Honorários em Números
                      </h2>
                      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        <strong>Aqui está a verdade sobre seu dinheiro:</strong> quanto você recebeu, quanto perdeu, 
                        e onde estão as oportunidades de ganhar mais. Dados reais, sem enrolação.
                      </p>
                    </div>

                    {/* Stats Componentizados */}
                    <DashboardStats totals={totals} />
                  </section>

                  {/* Seção de Insights e Ações */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                          <Brain className="h-6 w-6 text-purple-700" />
                        </div>
                        Suas Próximas Ações
                      </h2>
                      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Baseado na análise dos seus dados, preparamos as ações mais
                        importantes para otimizar seus recebimentos e reduzir glosas.
                      </p>
                    </div>

                    {/* Actions Componentizadas */}
                    <DashboardActions />
                  </section>

                  {/* Seção de Ferramentas Adicionais */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Ferramentas Complementares
                      </h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        Recursos adicionais para uma gestão médica ainda mais eficiente
                      </p>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      {/* Relatórios */}
                      <Link to="/reports">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-gray-50 to-slate-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100">
                                <BarChart3 className="h-6 w-6 text-gray-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-800">
                                  📊 Seus Relatórios
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Quanto ganhou esse mês?
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Central de Inteligência */}
                      <Link to="/intelligence">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                                <Brain className="h-6 w-6 text-purple-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-purple-800">
                                  Central de Inteligência
                                </h3>
                                <p className="text-sm text-purple-600">
                                  Insights avançados
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-purple-400 ml-auto group-hover:text-purple-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Análise Comparativa */}
                      <Link to="/comparison">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                                <Search className="h-6 w-6 text-teal-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-teal-800">
                                  Análise Comparativa
                                </h3>
                                <p className="text-sm text-teal-600">Compare tabelas</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-teal-400 ml-auto group-hover:text-teal-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default DashboardPage;
