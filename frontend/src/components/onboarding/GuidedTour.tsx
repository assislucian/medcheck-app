/**
 * GuidedTour.tsx
 *
 * Este componente implementa o tour guiado exibido aos novos usuários.
 * O tour navega o usuário pelas principais funcionalidades do sistema,
 * através de diálogos modais explicativos.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TourNavigation } from './TourNavigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { tourSteps } from './tourSteps';

export function GuidedTour() {
  // Estado local do componente
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const navigate = useNavigate();
  const { completeTour, skipTour } = useOnboarding();

  /**
   * Avança para o próximo passo do tour ou finaliza o tour
   * quando o último passo é alcançado
   */
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      navigate(tourSteps[currentStep + 1].path);
    } else {
      handleComplete();
    }
  };

  /**
   * Finaliza o tour e atualiza o status de onboarding no banco de dados
   * se a opção "Não mostrar novamente" estiver marcada
   */
  const handleComplete = async () => {
    await completeTour(dontShowAgain);
    setIsOpen(false);
    navigate('/dashboard');
  };

  /**
   * Pula o tour e atualiza o status de onboarding no banco de dados
   * se a opção "Não mostrar novamente" estiver marcada
   */
  const handleSkip = async () => {
    await skipTour(dontShowAgain);
    setIsOpen(false);
    navigate('/dashboard');
  };

  // Se o diálogo foi fechado, não renderiza o componente
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tourSteps[currentStep].title}</DialogTitle>
          <DialogDescription>{tourSteps[currentStep].description}</DialogDescription>
        </DialogHeader>

        {/* Opção para não mostrar o tour novamente */}
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="dontShowAgain"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label htmlFor="dontShowAgain">Não mostrar novamente</Label>
        </div>

        {/* Navegação do tour com botões para pular ou avançar */}
        <TourNavigation
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onSkip={handleSkip}
          dontShowAgain={dontShowAgain}
        />
      </DialogContent>
    </Dialog>
  );
}
