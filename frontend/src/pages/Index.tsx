import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>MedCheck | Auditoria Médica Automatizada - Recupere suas Glosas</title>
        <meta
          name="description"
          content="Pare de perder dinheiro com glosas abusivas. Auditoria CBHPM automatizada, contestação inteligente e gestão financeira médica. +2.500 médicos já aumentaram sua receita."
        />
        <meta
          name="keywords"
          content="auditoria médica, CBHPM, glosas médicas, contestação automática, gestão financeira médica, honorários médicos"
        />
        <meta
          property="og:title"
          content="MedCheck | Pare de Perder Dinheiro com Glosas Abusivas"
        />
        <meta
          property="og:description"
          content="A primeira plataforma brasileira que combina auditoria CBHPM, contestação automatizada e gestão financeira médica."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <HeroSection />
    </>
  );
};

export default Index;
