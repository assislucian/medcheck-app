/**
 * Header personalizado do Dashboard
 * Componente focado e reutilizável
 */
import { Stethoscope } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  hasData: boolean;
  needsAttention: boolean;
}

export function DashboardHeader({ userName, hasData, needsAttention }: DashboardHeaderProps) {
  const getGreeting = () => {
    if (!userName) return 'Doutor(a)';
    const nameParts = userName.split(' ');
    const firstName = nameParts[0].toLowerCase().startsWith('dr') ? nameParts[1] : nameParts[0];
    return firstName || 'Doutor(a)';
  };

  const getMessage = () => {
    if (!hasData) {
      return '🚀 Bem-vindo! Faça upload das suas guias e demonstrativos para começar a analisar seus honorários.';
    }
    if (needsAttention) {
      return '🔍 Vamos analisar seus dados com atenção. Algumas oportunidades merecem sua atenção.';
    }
    return '✅ Parabéns! Seus honorários estão bem organizados. Continue cuidando do que é seu!';
  };

  return (
    <div className="text-center space-y-4 pt-8">
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-medical-100 to-brand-100 border border-medical-200/50">
        <Stethoscope className="h-5 w-5 text-medical-700" />
        <span className="text-sm font-medium text-medical-800">
          Seus honorários sob controle
        </span>
      </div>

      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
        Olá, Dr(a). {getGreeting()}!
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        {getMessage()}
      </p>
    </div>
  );
}