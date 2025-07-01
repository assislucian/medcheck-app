import { useNavigate } from 'react-router-dom';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { ClipboardCheck, FileText } from 'lucide-react';

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
      className="flex items-center gap-3 cursor-pointer group hover:scale-[1.01] transition-all duration-300"
      onClick={() => navigate('/dashboard')}
    >
      {/* Logo para Auditoria Médica */}
      <div className="relative">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
          <div className="relative">
            <ClipboardCheck className="h-5 w-5 text-white" />
            <FileText className="h-2.5 w-2.5 text-white/80 absolute -bottom-0.5 -right-0.5" />
          </div>
        </div>
      </div>

      {/* Branding */}
      {!shouldCollapse && (
        <div className="transition-all duration-300">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            MedCheck
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-none mt-0.5">
            Auditoria Médica
          </p>
        </div>
      )}
    </div>
  );
}
