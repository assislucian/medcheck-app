import { Heart, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Description */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                MedCheck
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Auditoria médica inteligente
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/help"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              Central de Ajuda
            </Link>
            <Link
              to="/support"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              Suporte
            </Link>
            <span className="text-gray-500 dark:text-gray-500">© {currentYear}</span>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <span>Feito com</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>para profissionais da saúde</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
