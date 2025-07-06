import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface GamificationCardProps {
  /**
   * Valor atual recuperado no mês (em reais).
   */
  recovered: number;
  /**
   * Meta de recuperação para o mês.
   */
  goal?: number;
  className?: string;
}

/**
 * Exibe um cartão com barra de progresso mostrando quanto o usuário recuperou
 * em relação à meta mensal. Inclui mensagem de incentivo e ícone de troféu.
 */
export const GamificationCard = ({
  recovered,
  goal = 20000,
  className,
}: GamificationCardProps) => {
  const percent = Math.min(100, Math.round((recovered / goal) * 100));
  const remaining = Math.max(0, goal - recovered);

  return (
    <div
      className={cn(
        'w-full rounded-xl border bg-gradient-to-br from-amber-50/60 to-white p-6 shadow-sm dark:from-amber-950/40 dark:to-background',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Meta de recuperação mensal</p>
          <h3 className="text-lg font-semibold leading-tight">
            {percent >= 100 ? (
              <>Parabéns! Meta atingida 🎉</>
            ) : (
              <>
                Faltam{' '}
                <span className="font-bold">
                  R$ {remaining.toLocaleString('pt-BR')}
                </span>{' '}
                para sua meta
              </>
            )}
          </h3>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <Progress
          value={percent}
          indicatorClassName="bg-gradient-to-r from-emerald-400 to-blue-500"
        />
        <p className="text-xs text-muted-foreground">
          {percent}% de R$ {goal.toLocaleString('pt-BR')} recuperados este mês
        </p>
      </div>
    </div>
  );
};
