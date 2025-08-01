/**
 * Componente para ações principais do Dashboard
 * Separação clara de responsabilidades
 */
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronRight, Upload, FileText, Shield } from 'lucide-react';

export function DashboardActions() {
  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Guias Médicas */}
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
                  📋 Passo 1: Suas Guias
                </h3>
                <p className="text-blue-600 leading-relaxed">
                  <strong>Envie suas guias TISS aqui.</strong> É igual anexar um arquivo no WhatsApp! 
                  Em segundos você vai saber se estão corretas e quanto deve receber.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-700 font-medium group-hover:gap-3 transition-all duration-300">
                <span>💪 Começar agora (2 min)</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Demonstrativos */}
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
                  💰 Passo 2: Seus Pagamentos
                </h3>
                <p className="text-emerald-600 leading-relaxed">
                  <strong>Envie o que o plano te pagou.</strong> Nosso robô vai comparar com sua tabela e mostrar 
                  na tela se você foi <span className="text-red-600 font-semibold">lesado</span> ou não.
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium group-hover:gap-3 transition-all duration-300">
                <span>🔍 Descobrir se me lesaram</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Contestações */}
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
                  ⚖️ Passo 3: Seus Direitos
                </h3>
                <p className="text-medical-600 leading-relaxed">
                  <strong>Vai brigar pelo que é seu?</strong> Te ajudamos a contestar glosas indevidas. 
                  É seu dinheiro! <span className="text-green-600 font-semibold">Recupere até 70%</span> do que negaram.
                </p>
              </div>
              <div className="flex items-center gap-2 text-medical-700 font-medium group-hover:gap-3 transition-all duration-300">
                <span>⚡ Recuperar meu dinheiro</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}