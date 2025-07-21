import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showGradientBackground?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
}

export function PublicLayout({
  children,
  title = "MedCheck",
  description,
  showGradientBackground = false,
  showFooter = true,
  showBackButton = false,
}: PublicLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAboutPage = location.pathname === '/about';

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>{title || "MedCheck"} | MedCheck</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <div
        className={`min-h-screen flex flex-col bg-background ${
          showGradientBackground ? 'bg-gradient-to-b from-background to-muted/50' : ''
        }`}
      >
        <Navbar isLoggedIn={false} showBackButton={isAboutPage || showBackButton} />

        <motion.main
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {showBackButton && !isAboutPage && (
            <div className="container pt-6 pl-4 sm:pl-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
          )}
          {children}
        </motion.main>

        {showFooter && <Footer />}
      </div>
    </>
  );
}
