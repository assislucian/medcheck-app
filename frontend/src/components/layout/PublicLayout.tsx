import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';

interface PublicLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showGradientBackground?: boolean;
  showFooter?: boolean;
}

export function PublicLayout({
  children,
  title,
  description,
  showGradientBackground = false,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} | MedCheck</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <div
        className={`min-h-screen flex flex-col bg-background ${
          showGradientBackground ? 'bg-gradient-to-b from-background to-muted/50' : ''
        }`}
      >
        <Navbar isLoggedIn={false} />
        <motion.main
          className="flex-1 flex flex-col px-4 md:px-8 max-w-7xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.main>
        {showFooter && <Footer />}
      </div>
    </>
  );
}
