import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Linkedin,
  Instagram,
  Youtube,
} from 'lucide-react';

interface AuthFooterProps {
  variant?: 'full' | 'minimal' | 'micro' | 'simple';
}

export function AuthFooter({ variant }: AuthFooterProps) {
  const location = useLocation();

  // Auto-detect variant based on current route if not provided
  const getVariantFromPath = (
    pathname: string
  ): 'full' | 'minimal' | 'micro' | 'simple' => {
    // Public pages - full footer
    if (
      ['/'].includes(pathname) ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/contact') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/help')
    ) {
      return 'full';
    }

    // Auth pages - minimal footer
    if (
      [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/auth-callback',
      ].includes(pathname)
    ) {
      return 'minimal';
    }

    // Work pages - micro footer
    if (
      [
        '/dashboard',
        '/uploads',
        '/analysis',
        '/demonstratives',
        '/guides',
        '/reports',
        '/intelligence-hub',
        '/unpaid-procedures',
        '/glosas',
        '/compare',
      ].includes(pathname) ||
      pathname.startsWith('/analysis/')
    ) {
      return 'micro';
    }

    // Settings pages - simple footer
    if (['/profile', '/support', '/notifications'].includes(pathname)) {
      return 'simple';
    }

    return 'micro'; // default
  };

  const footerVariant = variant || getVariantFromPath(location.pathname);

  // Micro Footer - apenas versão e copyright
  if (footerVariant === 'micro') {
    return (
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-gray-500">
          <div>© 2025 MedCheck. Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <span>v2025.01</span>
            <span>•</span>
            <span>Online</span>
          </div>
        </div>
      </footer>
    );
  }

  // Minimal Footer - apenas essencial
  if (footerVariant === 'minimal') {
    return (
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">
              Protegido por criptografia de nível bancário
            </span>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-amber-600 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="hover:text-amber-600 transition-colors">
              Privacidade
            </Link>
            <span>© 2025 MedCheck</span>
          </div>
        </div>
      </footer>
    );
  }

  // Simple Footer - configurações e suporte
  if (footerVariant === 'simple') {
    return (
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Suporte</h4>
              <div className="space-y-2 text-gray-600">
                <Link
                  to="/support"
                  className="block hover:text-amber-600 transition-colors"
                >
                  Central de Ajuda
                </Link>
                <Link
                  to="/help"
                  className="block hover:text-amber-600 transition-colors"
                >
                  Documentação
                </Link>
                <a
                  href="mailto:suporte@medcheck.app"
                  className="block hover:text-amber-600 transition-colors"
                >
                  Contato Técnico
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Conta</h4>
              <div className="space-y-2 text-gray-600">
                <Link
                  to="/profile"
                  className="block hover:text-amber-600 transition-colors"
                >
                  Meu Perfil
                </Link>
                {/* Temporariamente desabilitado
                <Link
                  to="/notifications"
                  className="block hover:text-amber-600 transition-colors"
                >
                  Notificações
                </Link>
                */}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Informações</h4>
              <div className="space-y-2 text-gray-600">
                <span className="block">Versão: v2025.01</span>
                <span className="block">Status: Online</span>
                <span className="block">© 2025 MedCheck</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full Footer - páginas públicas
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                MedCheck
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plataforma de auditoria médica automatizada que recupera seus honorários e
              elimina glosas abusivas.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Soluções */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Soluções</h4>
            <nav className="space-y-2">
              <Link
                to="/pricing"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Auditoria CBHPM
              </Link>
              <Link
                to="/pricing"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Contestação Automática
              </Link>
              <Link
                to="/pricing"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Gestão Financeira
              </Link>
              <Link
                to="/pricing"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Relatórios Executivos
              </Link>
            </nav>
          </div>

          {/* Suporte */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Suporte</h4>
            <nav className="space-y-2">
              <Link
                to="/help"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Central de Ajuda
              </Link>
              <Link
                to="/contact"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                Fale Conosco
              </Link>
              <a
                href="mailto:suporte@medcheck.app"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                suporte@medcheck.app
              </a>
              <a
                href="tel:+5511999999999"
                className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              >
                (11) 99999-9999
              </a>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contato</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-amber-400" />
                <span>
                  São Paulo, SP
                  <br />
                  Brasil
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Seg-Sex: 8h às 18h</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Certificado ISO 27001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            © 2025 MedCheck. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">
              Política de Privacidade
            </Link>
            <span>CNPJ: 00.000.000/0001-00</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
