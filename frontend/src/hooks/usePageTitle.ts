import { useEffect } from 'react';
import {
  generatePageTitle,
  generateKeywords,
  generateCanonicalUrl,
  seoConfig,
} from '../config/seo';

interface UsePageTitleOptions {
  title: string;
  description?: string;
  keywords?: string;
  section?: string;
  canonical?: string;
  noindex?: boolean;
}

export function usePageTitle({
  title,
  description,
  keywords,
  section,
  canonical,
  noindex = false,
}: UsePageTitleOptions) {
  useEffect(() => {
    // Define o título da página no formato padrão SaaS
    const formattedTitle = section
      ? generatePageTitle(`${title} | ${section}`)
      : generatePageTitle(title);

    document.title = formattedTitle;

    // Define meta description
    const metaDescription = description || seoConfig.defaultDescription;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', metaDescription);

    // Define meta keywords
    const keywordsList = keywords ? keywords.split(',').map((k) => k.trim()) : [];
    const allKeywords = generateKeywords(keywordsList);
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', allKeywords);

    // Define canonical URL se fornecida
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', generateCanonicalUrl(canonical));
    }

    // Define meta robots
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // Define viewport meta se não existir
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewportMeta);
    }

    // Define charset meta se não existir
    let charsetMeta = document.querySelector('meta[charset]');
    if (!charsetMeta) {
      charsetMeta = document.createElement('meta');
      charsetMeta.setAttribute('charset', 'UTF-8');
      document.head.prepend(charsetMeta);
    }

    // Cleanup function para remover metas se necessário
    return () => {
      // Reset para título padrão quando o componente for desmontado
      document.title = seoConfig.defaultTitle;
    };
  }, [title, description, keywords, section, canonical, noindex]);
}

// Hook simplificado para casos comuns
export function useSimplePageTitle(title: string, section?: string) {
  return usePageTitle({ title, section });
}
