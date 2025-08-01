import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

interface MobileMenuProps {
  isLoggedIn: boolean;
  isOpen: boolean;
  profileData: {
    name: string;
    email: string;
    specialty?: string;
    avatarUrl?: string;
  };
  onLogout: () => Promise<void>;
}

export const MobileMenu = ({
  isLoggedIn,
  isOpen,
  profileData,
  onLogout,
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-background border-b shadow-lg">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {isLoggedIn ? (
          <Fragment>
            <div className="px-5 py-3 border-b">
              <div className="text-lg font-semibold">{profileData.name}</div>
              {profileData.specialty && (
                <div className="text-sm text-muted-foreground">
                  {profileData.specialty}
                </div>
              )}
              <div className="text-sm text-muted-foreground">{profileData.email}</div>
            </div>
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Dashboard
            </Link>
            <Link
              to="/guides"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Guias
            </Link>
            <Link
              to="/demonstratives"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Demonstrativos
            </Link>
            <Link
              to="/unpaid-procedures"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Não Pagos
            </Link>

            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Perfil
            </Link>
            {/* Temporariamente desabilitado
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link to="/notifications" onClick={() => setIsOpen(false)}>
                <Activity className="mr-2 h-4 w-4" />
                Activity Log
              </Link>
            </Button>
            */}
            <Link
              to="/help"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Ajuda
            </Link>
            <button
              onClick={onLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
            >
              Sair
            </button>
          </Fragment>
        ) : (
          <Fragment>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Quem Somos
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Planos
            </Link>
            <Link
              to="/help"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Como Funciona
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
            >
              Contato
            </Link>
            <div className="pt-4 pb-2 border-t border-border">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90 mt-2 text-center py-2 rounded-md"
              >
                Cadastrar
              </Link>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};
