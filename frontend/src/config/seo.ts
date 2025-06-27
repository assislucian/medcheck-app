export interface SEOConfig {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  siteUrl: string;
  twitterHandle?: string;
  ogImage?: string;
}

export const seoConfig: SEOConfig = {
  siteName: 'MedCheck',
  defaultTitle: 'MedCheck | Sistema Avançado de Auditoria Médica',
  defaultDescription:
    'Plataforma SaaS premium para auditoria médica, análise de glosas, gestão de demonstrativos e intelligence analytics para profissionais da saúde',
  defaultKeywords: [
    'auditoria médica',
    'sistema médico',
    'glosas médicas',
    'demonstrativos médicos',
    'gestão médica',
    'SaaS médico',
    'analytics médico',
    'intelligence hub médico',
    'recuperação glosas',
    'procedimentos médicos',
    'TISS',
    'ANS',
    'guias médicas',
  ],
  siteUrl: 'https://medcheck.com.br',
  twitterHandle: '@medcheck',
  ogImage: '/images/og-medcheck.png',
};

export interface PageSEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
}

export function generatePageTitle(pageTitle: string): string {
  if (pageTitle === seoConfig.siteName) {
    return seoConfig.defaultTitle;
  }
  return `${pageTitle} | ${seoConfig.siteName}`;
}

export function generateKeywords(pageKeywords: string[] = []): string {
  const allKeywords = [...pageKeywords, ...seoConfig.defaultKeywords];
  return [...new Set(allKeywords)].join(', ');
}

export function generateCanonicalUrl(path: string): string {
  return `${seoConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Schema.org structured data generators
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      category: 'SaaS',
    },
    creator: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
  };
}

export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ label: string; href?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? generateCanonicalUrl(crumb.href) : undefined,
    })),
  };
}
