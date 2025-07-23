import React, { useEffect } from 'react';
import ResponsiveHeroSection from '@/components/landing/ResponsiveHeroSection';
import { Helmet } from 'react-helmet-async';
import { useDevice } from '@/hooks/use-device';
import { initializeMobileOptimizations } from '@/utils/mobile-interactions';

const IndexResponsive = () => {
  const { isMobile, isTablet, platform } = useDevice();

  // Inicializar otimizações mobile
  useEffect(() => {
    const cleanup = initializeMobileOptimizations();
    return cleanup;
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {isMobile 
            ? 'MedCheck | Pare de Perder Dinheiro com Glosas' 
            : 'MedCheck | Auditoria Médica Automatizada - Recupere suas Glosas'
          }
        </title>
        <meta
          name="description"
          content={
            isMobile
              ? 'Auditoria CBHPM automática, contestação inteligente. 2.500+ médicos já aumentaram receita.'
              : 'Pare de perder dinheiro com glosas abusivas. Auditoria CBHPM automatizada, contestação inteligente e gestão financeira médica. +2.500 médicos já aumentaram sua receita.'
          }
        />
        <meta
          name="keywords"
          content="auditoria médica, CBHPM, glosas médicas, contestação automática, gestão financeira médica, honorários médicos"
        />
        
        {/* Meta tags específicas para mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* iOS specific */}
        {platform === 'ios' && (
          <>
            <meta name="apple-mobile-web-app-title" content="MedCheck" />
            <link rel="apple-touch-icon" href="/logo-medcheck.png" />
            <link rel="apple-touch-startup-image" href="/logo-medcheck.png" />
          </>
        )}
        
        {/* Android specific */}
        {platform === 'android' && (
          <>
            <meta name="android-app" content="app://medcheck.app" />
          </>
        )}

        {/* Open Graph otimizado por dispositivo */}
        <meta
          property="og:title"
          content={
            isMobile
              ? 'MedCheck | Pare de Perder Dinheiro com Glosas'
              : 'MedCheck | Pare de Perder Dinheiro com Glosas Abusivas'
          }
        />
        <meta
          property="og:description"
          content={
            isMobile
              ? 'Auditoria CBHPM automática e contestação inteligente para médicos.'
              : 'A primeira plataforma brasileira que combina auditoria CBHPM, contestação automatizada e gestão financeira médica.'
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo-medcheck.png" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Structured data para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MedCheck',
            description: isMobile 
              ? 'Auditoria CBHPM automática para médicos'
              : 'Plataforma de auditoria médica automatizada com contestação inteligente',
            applicationCategory: 'HealthApplication',
            operatingSystem: isMobile ? 'iOS, Android' : 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency': 'BRL',
              description: 'Teste grátis por 30 dias'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '2500'
            }
          })}
        </script>

        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//www.youtube.com" />
        <link rel="dns-prefetch" href="//api.medcheck.app" />
      </Helmet>

      {/* CSS customizado para mobile inserido dinamicamente */}
      <style>{`
        /* CSS mobile otimizado */
        ${isMobile ? `
          /* Remove tap highlights */
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }

          /* iOS safe area */
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }

          /* Fix 100vh no iOS */
          .mobile-height {
            height: calc(var(--vh, 1vh) * 100);
          }

          /* Touch optimizations */
          button, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }

          /* Scroll optimizations */
          body {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
          }

          /* Hardware acceleration */
          .mobile-card, .mobile-button {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000;
          }
        ` : ''}

        /* Performance optimizations para todos os devices */
        img {
          content-visibility: auto;
        }

        .gradient-bg {
          will-change: transform;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Main content */}
      <ResponsiveHeroSection />

      {/* Analytics e tracking só em produção */}
      {process.env.NODE_ENV === 'production' && (
        <>
          {/* Google Analytics 4 */}
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GA_MEASUREMENT_ID', {
                  custom_map: {
                    'dimension1': 'device_type'
                  }
                });
                
                // Track device type
                gtag('event', 'page_view', {
                  'device_type': '${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}',
                  'platform': '${platform}'
                });
              `,
            }}
          />
          
          {/* Microsoft Clarity para heatmaps mobile */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "CLARITY_PROJECT_ID");
              `,
            }}
          />
        </>
      )}

      {/* Service Worker para PWA (futuro) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'production') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />
    </>
  );
};

export default IndexResponsive; 