import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  Zap,
  Target,
  Brain,
  ArrowRight,
  Bell,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface SmartAlert {
  id: string;
  type: 'critical' | 'warning' | 'opportunity' | 'insight';
  priority: 'high' | 'medium' | 'low';
  category: 'deadline' | 'performance' | 'revenue' | 'process';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  dismissed?: boolean;
}

interface AlertsData {
  criticalAlerts: SmartAlert[];
  opportunities: SmartAlert[];
  insights: SmartAlert[];
  summary: {
    totalValue: number;
    expiringSoon: number;
    recoveryOpportunity: number;
  };
}

export function SmartAlertsSystem() {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const { session } = useAuth();

  const loadSmartAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar dados de demonstrativos e unpaid procedures para gerar alertas inteligentes
      const [demosRes, unpaidRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/demonstrativos`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/unpaid-procedures`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const demonstrativos = demosRes.data || [];
      const unpaidProcedures = unpaidRes.data?.unpaid_list || [];

      // Gerar alertas inteligentes baseado nos dados
      const alerts = generateIntelligentAlerts(demonstrativos, unpaidProcedures);
      setAlertsData(alerts);
    } catch (error) {
      console.error('Erro ao carregar alertas inteligentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentAlerts = (demonstrativos: any[], unpaidProcedures: any[]): AlertsData => {
    const criticalAlerts: SmartAlert[] = [];
    const opportunities: SmartAlert[] = [];
    const insights: SmartAlert[] = [];
    let totalValue = 0;
    let expiringSoon = 0;
    let recoveryOpportunity = 0;

    // 1. ALERTAS CRÍTICOS - Prazos de contestação
    unpaidProcedures.forEach((proc, index) => {
      if (proc.data) {
        const diasRestantes = calcularDiasParaContestar(proc.data);
        const valor = parseFloat(proc.valorApresentado) || 0;
        totalValue += valor;

        if (diasRestantes <= 7 && diasRestantes > 0) {
          expiringSoon++;
          criticalAlerts.push({
            id: `deadline-${index}`,
            type: 'critical',
            priority: 'high',
            category: 'deadline',
            title: `⚠️ PRAZO CRÍTICO: ${diasRestantes} dias restantes`,
            message: `Glosa de ${formatCurrency(valor)} expira em ${diasRestantes} dias. Contestar AGORA!`,
            actionText: 'Contestar Agora',
            actionUrl: '/unpaid-procedures',
            metadata: { procedimento: proc, diasRestantes, valor },
            createdAt: new Date().toISOString(),
          });
        } else if (diasRestantes <= 0) {
          criticalAlerts.push({
            id: `expired-${index}`,
            type: 'critical',
            priority: 'high',
            category: 'deadline',
            title: `🚨 PRAZO EXPIRADO`,
            message: `Glosa de ${formatCurrency(valor)} perdeu o prazo legal. Valor irrecuperável.`,
            actionText: 'Ver Detalhes',
            actionUrl: '/unpaid-procedures',
            metadata: { procedimento: proc, valor },
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // 2. OPORTUNIDADES DE RECUPERAÇÃO
    const glosasRecuperaveis = unpaidProcedures.filter(proc => {
      const dias = calcularDiasParaContestar(proc.data);
      return dias > 0;
    });

    if (glosasRecuperaveis.length > 0) {
      const valorRecuperavel = glosasRecuperaveis.reduce((sum, proc) => 
        sum + (parseFloat(proc.valorApresentado) || 0), 0
      );
      recoveryOpportunity = valorRecuperavel;

      opportunities.push({
        id: 'recovery-opportunity',
        type: 'opportunity',
        priority: 'high',
        category: 'revenue',
        title: `💰 Recuperação Disponível: ${formatCurrency(valorRecuperavel)}`,
        message: `${glosasRecuperaveis.length} glosas podem ser contestadas. Potencial de recuperação imediata.`,
        actionText: 'Iniciar Contestação em Lote',
        actionUrl: '/unpaid-procedures',
        metadata: { quantidade: glosasRecuperaveis.length, valor: valorRecuperavel },
        createdAt: new Date().toISOString(),
      });
    }

    // 3. INSIGHTS DE PERFORMANCE
    if (demonstrativos.length > 0) {
      insights.push({
        id: 'performance-insight',
        type: 'insight',
        priority: 'medium',
        category: 'performance',
        title: `📊 Análise de ${demonstrativos.length} Demonstrativos`,
        message: `Sistema processou ${demonstrativos.length} demonstrativos. Performance de auditoria em tempo real.`,
        actionText: 'Ver Relatório Completo',
        actionUrl: '/reports',
        metadata: { quantidade: demonstrativos.length },
        createdAt: new Date().toISOString(),
      });
    }

    // 4. INSIGHT INTELIGENTE - Padrões de glosas
    const motivosGlosas = unpaidProcedures.reduce((acc: any, proc) => {
      const motivo = proc.motivoNaoPagamento || 'Não informado';
      acc[motivo] = (acc[motivo] || 0) + 1;
      return acc;
    }, {});

    const motivoMaisFrequente = Object.keys(motivosGlosas).length > 0 
      ? Object.entries(motivosGlosas).sort(([,a], [,b]) => (b as number) - (a as number))[0]
      : null;

    if (motivoMaisFrequente) {
      insights.push({
        id: 'pattern-insight',
        type: 'insight',
        priority: 'medium',
        category: 'process',
        title: `🧠 Padrão Detectado: "${motivoMaisFrequente[0]}"`,
        message: `${motivoMaisFrequente[1]} glosas por este motivo. Considere revisar processos.`,
        actionText: 'Analisar Padrões',
        actionUrl: '/intelligence',
        metadata: { motivo: motivoMaisFrequente[0], quantidade: motivoMaisFrequente[1] },
        createdAt: new Date().toISOString(),
      });
    }

    return {
      criticalAlerts,
      opportunities,
      insights,
      summary: { totalValue, expiringSoon, recoveryOpportunity }
    };
  };

  const calcularDiasParaContestar = (data: string): number => {
    try {
      const dataGlosa = parseISO(data);
      const hoje = new Date();
      const diasPassados = differenceInCalendarDays(hoje, dataGlosa);
      return 30 - diasPassados;
    } catch {
      return 0;
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success('Alerta ocultado');
  };

  const handleAlertAction = (alert: SmartAlert) => {
    if (alert.actionUrl) {
      window.location.href = alert.actionUrl;
    }
  };

  useEffect(() => {
    loadSmartAlerts();
    // Recarregar a cada 5 minutos para alertas em tempo real
    const interval = setInterval(loadSmartAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              Inteligência Médica
            </CardTitle>
            <Badge variant="outline" className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Analisando...
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alertsData) return null;

  const allAlerts = [
    ...alertsData.criticalAlerts,
    ...alertsData.opportunities,
    ...alertsData.insights
  ].filter(alert => !dismissedAlerts.includes(alert.id));

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'insight': return <Brain className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColors = (type: string, priority: string) => {
    if (type === 'critical') return 'bg-red-50 border-red-200 text-red-800';
    if (type === 'opportunity') return 'bg-green-50 border-green-200 text-green-800';
    if (type === 'insight') return 'bg-blue-50 border-blue-200 text-blue-800';
    return 'bg-amber-50 border-amber-200 text-amber-800';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            Inteligência Médica
            {allAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {allAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Zap className="h-3 w-3 mr-1" />
            Tempo Real
          </Badge>
        </div>

        {/* Resumo Executivo */}
        {alertsData.summary.totalValue > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-800">
                {formatCurrency(alertsData.summary.totalValue)}
              </div>
              <div className="text-xs text-red-600">Em Glosas</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-lg font-bold text-amber-800">
                {alertsData.summary.expiringSoon}
              </div>
              <div className="text-xs text-amber-600">Expirando</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-800">
                {formatCurrency(alertsData.summary.recoveryOpportunity)}
              </div>
              <div className="text-xs text-green-600">Recuperável</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {allAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">Tudo em Ordem! 🎉</h3>
            <p className="text-sm">
              Nenhum alerta crítico. Sistema operando perfeitamente.
            </p>
          </div>
        ) : (
          allAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${getAlertColors(alert.type, alert.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{alert.message}</p>
                    
                    {alert.actionText && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-7 text-xs"
                        onClick={() => handleAlertAction(alert)}
                      >
                        {alert.actionText}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}