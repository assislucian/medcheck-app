import { useNavigate } from 'react-router-dom';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { Logo } from '@/components/ui/logo';

interface BrandProps {
  collapsed?: boolean;
}

export default function Brand({ collapsed }: BrandProps) {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebarContext();

  // Use prop collapsed if provided, otherwise use context
  const shouldCollapse = collapsed !== undefined ? collapsed : isCollapsed;

  return (
    <div
      className="cursor-pointer group hover:scale-[1.01] transition-all duration-300"
      onClick={() => navigate('/dashboard')}
    >
      {!shouldCollapse ? (
        /* Layout expandido - Logo + texto em coluna */
        <div className="flex flex-col items-center">
          <Logo 
            size="md" 
            variant="sidebar" 
            showText={true}
            collapsed={false}
            className="group-hover:scale-[1.01] transition-all duration-300"
          />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-none transition-all duration-300 -mt-2 self-end">
            Auditoria Médica
          </p>
        </div>
      ) : (
        /* Layout colapsado - Só logo */
        <div className="flex items-center justify-center">
          <Logo 
            size="md" 
            variant="sidebar" 
            showText={false}
            collapsed={true}
            className="group-hover:scale-[1.01] transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}
