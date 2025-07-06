import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const TOUR_STORAGE_KEY = 'medcheck_tour_completed_v1';

const steps: Step[] = [
  {
    target: '#sidebar-upload',
    content: 'Aqui você faz upload das guias de procedimentos.',
    title: 'Upload de Guias',
    disableBeacon: true,
  },
  {
    target: '#sidebar-demonstrativos',
    content: 'Envie seus demonstrativos de pagamento para comparar.',
    title: 'Upload de Demonstrativos',
  },
  {
    target: '#dashboard-kpi-valor-pago',
    content: 'Acompanhe quanto já recebeu nos últimos 30 dias.',
    title: 'Valor Pago',
  },
  {
    target: '#gamification-card',
    content: 'Veja seu progresso rumo à meta mensal e mantenha-se motivado!',
    title: 'Gamificação',
  },
  {
    target: '#dashboard-tabs',
    content: 'Detalhe de procedimentos, pagamentos e glosas.',
    title: 'Detalhamento',
  },
];

export const AppTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // pequeno atraso para garantir que elementos existam no DOM
      setTimeout(() => setRun(true), 800);
    }
  }, []);

  const handleJoyrideCallback = ({ status }: CallBackProps) => {
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};
