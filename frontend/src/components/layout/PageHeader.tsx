import { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, icon, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && <span className="text-brand">{icon}</span>}
        <h1 className="text-3xl font-bold text-brand">{title}</h1>
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-2">{actions}</div>
      )}
      {/* Descrição opcional pode ser adicionada abaixo se necessário */}
    </header>
  );
}
