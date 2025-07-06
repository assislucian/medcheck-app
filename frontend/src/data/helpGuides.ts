import { Guide, VideoTutorial } from '@/types/help';

export const guides: Guide[] = [
  {
    id: 'guide-1',
    title: 'Primeiros Passos com o MedCheck',
    content:
      'Aprenda como começar a usar o MedCheck para auditar seus recebimentos. Vamos te guiar desde o cadastro até o envio do seu primeiro demonstrativo para análise.',
    category: 'primeiros-passos',
  },
  {
    id: 'guide-2',
    title: 'Enviando Demonstrativos',
    content:
      'Saiba como enviar seus demonstrativos de pagamento para análise. Aceitamos diferentes formatos de arquivos e demonstrativos de diversas operadoras de saúde.',
    category: 'uploads',
  },
  {
    id: 'guide-3',
    title: 'Entendendo os Resultados',
    content:
      'Aprenda a interpretar os resultados da análise do MedCheck. Veja como identificar divergências, glosas indevidas e oportunidades de recuperação de valores.',
    category: 'analise',
  },
  {
    id: 'guide-4',
    title: 'Contestação de Glosas',
    content:
      'Guia completo sobre como usar o MedCheck para contestar glosas. Desde a identificação até a geração de documentos para recurso.',
    category: 'glosas',
  },
  {
    id: 'guide-5',
    title: 'Relatórios e Dashboards',
    content:
      'Explore as ferramentas de relatórios do MedCheck. Acompanhe métricas importantes, histórico de pagamentos e tendências de glosas.',
    category: 'relatorios',
  },
  {
    id: 'guide-6',
    title: 'Tabelas de Referência',
    content:
      'Como configurar e utilizar as tabelas CBHPM e outras referências no MedCheck para garantir análises precisas dos seus recebimentos.',
    category: 'configuracoes',
  },
];

export const videos: VideoTutorial[] = [
  {
    id: 'video-1',
    title: 'Tour pelo MedCheck',
    description: 'Conheça as principais funcionalidades do MedCheck em 5 minutos',
    url: 'https://www.youtube.com/watch?v=example1',
    thumbnail: '/placeholder.svg',
  },
  {
    id: 'video-2',
    title: 'Como Analisar Demonstrativos',
    description: 'Guia passo a passo para análise eficiente de demonstrativos',
    url: 'https://www.youtube.com/watch?v=example2',
    thumbnail: '/placeholder.svg',
  },
  {
    id: 'video-3',
    title: 'Gestão de Glosas',
    description: 'Aprenda a identificar e contestar glosas usando o MedCheck',
    url: 'https://www.youtube.com/watch?v=example3',
    thumbnail: '/placeholder.svg',
  },
];
