import { Link } from 'react-router-dom';

export const UserNavigation = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Guias', path: '/guides' },
    { name: 'Demonstrativos', path: '/demonstratives' },
    { name: 'Não Pagos', path: '/unpaid-procedures' },
    // { name: 'Activity Log', path: '/notifications' }, // Temporariamente removido
    { name: 'Relatórios', path: '/reports' },
    { name: 'Suporte', path: '/help' },
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};
