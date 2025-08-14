import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useLegalModals } from '@/contexts/LegalContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const { showTerms, showPrivacy } = useLegalModals();

  const handleAboutClick = (e: React.MouseEvent) => {
    if (location.pathname === '/about') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                MedCheck
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ajudamos médicos a recuperar honorários e reduzir glosas de forma
              simples e automatizada.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm text-foreground uppercase tracking-wider">
              Produto
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  onClick={handleAboutClick}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm text-foreground uppercase tracking-wider">
              Suporte
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Ajuda e Suporte
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Atendimento Especializado
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm text-foreground uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={showPrivacy}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={showTerms}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MedCheck. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a
              href="tel:+5511999999999"
              className="text-sm text-foreground/80 hover:text-primary transition-colors"
            >
              (11) 99999-9999
            </a>
            <a
              href="mailto:contato@medcheck.com.br"
              className="text-sm text-foreground/80 hover:text-primary transition-colors"
            >
              contato@medcheck.com.br
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
