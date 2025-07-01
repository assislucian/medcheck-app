import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield, Award, Users } from 'lucide-react';
import MedCheckLogo from '@/components/ui/MedCheckLogo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Início', href: '/' },
    {
      name: 'Soluções',
      href: '/solucoes',
      dropdown: [
        {
          name: 'Auditoria CBHPM',
          href: '/auditoria',
          icon: <Shield className="w-4 h-4" />,
        },
        {
          name: 'Contestação Automática',
          href: '/contestacao',
          icon: <Award className="w-4 h-4" />,
        },
        {
          name: 'Gestão Financeira',
          href: '/gestao',
          icon: <Users className="w-4 h-4" />,
        },
      ],
    },
    { name: 'Preços', href: '/precos' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <MedCheckLogo
              size="lg"
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              MedCheck
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors duration-200">
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 py-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                          >
                            <div className="text-blue-400">{subItem.icon}</div>
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`text-slate-300 hover:text-white transition-colors duration-200 relative ${
                      isActive(item.href) ? 'text-blue-400' : ''
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/50">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`block text-slate-300 hover:text-white transition-colors duration-200 ${
                      isActive(item.href) ? 'text-blue-400' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="text-blue-400">{subItem.icon}</div>
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800/50 space-y-2">
                <Link
                  to="/login"
                  className="block text-slate-300 hover:text-white transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/signup"
                  className="block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-center transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Começar Grátis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
