import { Link } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe suas auditorias e análises mais recentes
        </p>
      </div>
      {/* Botão padronizado conforme demonstrativos */}
      <Button asChild size="sm" className="flex items-center gap-2">
        <Link to="/new-audit">
          <FileUp className="h-4 w-4" />
          Nova Auditoria
        </Link>
      </Button>
    </div>
  );
}
