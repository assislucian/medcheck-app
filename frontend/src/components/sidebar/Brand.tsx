import { useNavigate } from 'react-router-dom';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { ClipboardCheck, FileText } from 'lucide-react';

export default function Brand() {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebarContext();

  return (
    <div
      className="flex items-center gap-3 mb-8 cursor-pointer group hover:scale-[1.01] transition-all duration-300"
      onClick={() => navigate('/dashboard')}
    >
      {/* Logo para Auditoria Médica */}
      <div className="relative">
        <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
          <div className="relative">
            <ClipboardCheck className="h-6 w-6 text-white" />
            <FileText className="h-3 w-3 text-white/80 absolute -bottom-1 -right-1" />
          </div>
        </div>
      </div>

      {/* Branding */}
      {!isCollapsed && (
        <div className="transition-all duration-300">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            MedCheck
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-none mt-1">
            Auditoria Médica
          </p>
        </div>
      )}
    </div>
  );
}
