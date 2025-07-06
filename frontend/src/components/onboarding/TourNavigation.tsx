/**
 * TourNavigation.tsx
 *
 * Componente que renderiza os botões de navegação usados no tour guiado.
 * Permite avançar para o próximo passo ou pular o tour completamente.
 */

import { Button } from '@/components/ui/button';
import { ArrowRight, SkipForward } from 'lucide-react';

interface TourNavigationProps {
  currentStep: number; // Passo atual do tour
  totalSteps: number; // Total de passos do tour
  onNext: () => void; // Função para avançar para o próximo passo
  onSkip: () => void; // Função para pular o tour
  dontShowAgain?: boolean; // Flag indicando se o usuário optou por não mostrar novamente
}

export function TourNavigation({
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  dontShowAgain,
}: TourNavigationProps) {
  /**
   * Manipula o clique no botão de pular
   */
  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="flex items-center justify-between mt-6 gap-4">
      {/* Botão para pular o tour */}
      <Button
        variant="outline"
        onClick={handleSkip}
        className="flex items-center gap-2"
      >
        <SkipForward className="h-4 w-4" />
        Pular Tour
      </Button>

      {/* Botão para avançar no tour ou finalizar */}
      <Button onClick={onNext} className="flex items-center gap-2">
        {currentStep < totalSteps - 1 ? (
          <>
            Próximo
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          'Começar a usar'
        )}
      </Button>
    </div>
  );
}
