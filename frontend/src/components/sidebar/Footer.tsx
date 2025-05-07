import { ThemeToggle } from "../ThemeToggle";
import { Play, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { toast } from "sonner";

export default function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="mt-auto flex flex-col px-4 py-6 space-y-3 border-t border-neutral-200">
      <ThemeToggle />
      <button
        onClick={() => navigate('/tour')}
        className="flex gap-2 items-center px-4 py-2 rounded transition-colors w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Play className="h-4 w-4" />
        <span>Ver Tour</span>
      </button>
      <button
        onClick={handleSignOut}
        className="flex gap-2 items-center px-4 py-2 rounded transition-colors w-full text-left text-destructive hover:bg-red-50 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        <span>Sair</span>
      </button>
    </div>
  );
} 