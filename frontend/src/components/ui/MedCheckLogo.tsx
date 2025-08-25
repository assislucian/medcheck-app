import React from 'react';
import { cn } from '@/lib/utils';

type LogoVariant = 'primary' | 'success' | 'attention' | 'neutral';
type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface MedCheckLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showImage?: boolean;
  textOnly?: boolean;
}

const logoVariants: Record<LogoVariant, string> = {
  // Azul Médico Premium - Uso padrão (Trust + Technology)
  primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600',
  
  // Verde Médico - Estados de Sucesso (Health + Success)  
  success: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600',
  
  // Âmbar Médico - Estados de Atenção/Processo (Care + Attention)
  attention: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-500',
  
  // Slate Médico - Estados Neutros/Secundários (Professional + Discrete)
  neutral: 'bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700'
};

const logoSizes: Record<LogoSize, string> = {
  // Small - Navigation, Footer, contextos menores
  sm: 'text-2xl font-semibold',
  
  // Medium - Section Headers, confirmações  
  md: 'text-3xl font-bold',
  
  // Large - Page Headers principais (Login, Register)
  lg: 'text-4xl md:text-5xl font-bold',
  
  // Extra Large - Homepage Hero, landing principal
  xl: 'text-6xl md:text-7xl font-bold'
};

const imageSizes: Record<LogoSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12'
};

export const MedCheckLogo: React.FC<MedCheckLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  showImage = false,
  textOnly = false
}) => {
  if (textOnly) {
    return (
      <h1 className={cn(
        'bg-clip-text text-transparent tracking-tight',
        logoVariants[variant],
        logoSizes[size],
        className
      )}>
        MedCheck
      </h1>
    );
  }

  if (showImage) {
    return (
      <div className={cn('flex items-center justify-center gap-3', className)}>
        <img
          src="/logo/Medcheck.png"
          alt="MedCheck Logo"
          className={cn(imageSizes[size], 'object-contain flex-shrink-0')}
        />
        <h1 className={cn(
          'bg-clip-text text-transparent tracking-tight',
          logoVariants[variant],
          logoSizes[size]
        )}>
          MedCheck
        </h1>
      </div>
    );
  }

  return (
    <h1 className={cn(
      'bg-clip-text text-transparent tracking-tight',
      logoVariants[variant],
      logoSizes[size],
      className
    )}>
      MedCheck
    </h1>
  );
};

// Hook para determinar variante baseada no contexto
export const useLogoVariant = (context?: 'success' | 'error' | 'warning' | 'process'): LogoVariant => {
  switch (context) {
    case 'success':
      return 'success';
    case 'warning':
    case 'process':
      return 'attention';
    case 'error':
      return 'neutral';
    default:
      return 'primary';
  }
};

// Comentários para documentação das melhores práticas
/*
SISTEMA DE CORES BASEADO EM HARVARD/MIT:

1. PRIMARY (Azul Médico):
   - Uso: 70% das aparições
   - Contextos: Homepage, Login, Dashboard, navegação
   - Psicologia: Confiança + Tecnologia + Profissionalismo médico
   - Neurociência: Estimula dopamina (prazer de uso)

2. SUCCESS (Verde Médico):
   - Uso: Estados de sucesso e confirmação
   - Contextos: Confirmações, relatórios positivos
   - Psicologia: Saúde + Segurança + Bem-estar
   - Neurociência: Estimula oxitocina (segurança)

3. ATTENTION (Âmbar Médico):
   - Uso: Processos em andamento, alertas construtivos
   - Contextos: Forgot password, loading states, avisos
   - Psicologia: Cuidado + Atenção médica + Foco
   - Neurociência: Atenção sem estresse

4. NEUTRAL (Slate Médico):
   - Uso: Contextos secundários, estados neutros
   - Contextos: Footers discretos, elementos secundários
   - Psicologia: Profissionalismo + Discrição
   - Neurociência: Reduz ruído visual

TAMANHOS HIERÁRQUICOS:
- XL: Hero sections, primeira impressão
- LG: Headers de páginas principais  
- MD: Headers de seções, padrão geral
- SM: Navegação, footer, contextos menores

Brand Consistency = Trust Building + Professional Credibility
*/