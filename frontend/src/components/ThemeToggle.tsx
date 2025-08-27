import { Button } from '@/components/ui/button';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface ThemeToggleProps {
  className?: string;
  showReset?: boolean;
}

export function ThemeToggle({ className, showReset = false }: ThemeToggleProps) {
  const { theme, toggleTheme, resetTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={className}
        aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        <span className="sr-only">
          {theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        </span>
      </Button>
      
      {showReset && (
        <Button
          variant="ghost"
          size="icon"
          onClick={resetTheme}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Resetar tema para padrão"
          title="Resetar tema para padrão (light mode)"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Resetar tema para padrão</span>
        </Button>
      )}
    </div>
  );
}
