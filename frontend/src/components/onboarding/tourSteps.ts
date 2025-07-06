/**
 * tourSteps.ts
 *
 * Define os passos do tour guiado de onboarding.
 * Cada passo inclui um título, descrição e o caminho da rota
 * que deve ser mostrada durante aquele passo.
 */

export interface TourStep {
  title: string; // Título do passo do tour
  description: string; // Descrição detalhada do passo
  path: string; // Caminho da rota para este passo
}

/**
 * Lista de passos do tour de onboarding
 * Cada passo leva o usuário a uma página diferente do aplicativo
 * para demonstrar as funcionalidades principais
 */
export const tourSteps: TourStep[] = [
  {
    title: 'Bem-vindo ao Dashboard',
    description:
      'Aqui você encontra uma visão geral dos seus pagamentos e glosas. Monitore facilmente o status das suas análises e valores recuperados.',
    path: '/dashboard',
  },
  {
    title: 'Envie seus Documentos',
    description:
      "Clique em 'Uploads' no menu lateral para enviar seus contracheques e guias. Nossa tecnologia extrairá automaticamente os dados para análise.",
    path: '/uploads',
  },
  {
    title: 'Acompanhe seu Histórico',
    description:
      'Visualize todas as suas análises anteriores e seus resultados. Filtre por data, hospital ou status para encontrar facilmente o que procura.',
    path: '/history',
  },
  {
    title: 'Configure seu Perfil',
    description:
      'Personalize suas informações e preferências de notificação. Mantenha seus dados atualizados para aproveitar ao máximo a plataforma.',
    path: '/profile',
  },
];
