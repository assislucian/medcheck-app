/**
 * Hook unificado para setup de páginas
 * Elimina duplicação de 10+ configurações de página similares
 */
import { usePageTitle } from './usePageTitle';

interface PageConfig {
  title: string;
  description: string;
  keywords: string;
}

const DEFAULT_PAGES: Record<string, PageConfig> = {
  dashboard: {
    title: 'Minha Prática Médica',
    description: 'Acompanhe seus honorários, glosas e demonstrativos de forma clara e organizada. Sua gestão médica simplificada.',
    keywords: 'honorários médicos, glosas planos de saúde, demonstrativos pagamento, gestão médica, auditoria médica',
  },
  demonstratives: {
    title: 'Gestão de Demonstrativos',
    description: 'Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada e insights de performance',
    keywords: 'demonstrativos médicos, gestão financeira médica, análise de pagamentos, auditoria demonstrativos',
  },
  guides: {
    title: 'Central de Guias Médicas',
    description: 'Sistema avançado de gestão e análise de guias médicas TISS com processamento automatizado e insights de performance',
    keywords: 'guias médicas, TISS, gestão médica, procedimentos médicos, auditoria guias',
  },
  reports: {
    title: 'Central de Relatórios Inteligentes',
    description: 'Análise financeira completa focada na gestão de honorários e auditoria médica',
    keywords: 'relatórios médicos, CBHPM, glosas, fluxo de caixa, auditoria, contabilidade médica',
  },
  unpaid: {
    title: 'Procedimentos Não Pagos',
    description: 'Gestão e contestação de procedimentos glosados pelos planos de saúde',
    keywords: 'glosas médicas, procedimentos não pagos, contestação, recurso médico, auditoria',
  },
  intelligence: {
    title: 'Central de Inteligência',
    description: 'Insights inteligentes e análises avançadas dos seus dados médicos com IA',
    keywords: 'inteligência artificial médica, analytics médicos, insights, análise dados médicos, IA saúde',
  },
};

export function usePageSetup(pageKey: keyof typeof DEFAULT_PAGES | PageConfig, customConfig?: Partial<PageConfig>) {
  const config = typeof pageKey === 'string' 
    ? { ...DEFAULT_PAGES[pageKey], ...customConfig }
    : { ...pageKey, ...customConfig };

  usePageTitle(config);

  return config;
}