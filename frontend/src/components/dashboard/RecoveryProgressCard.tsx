import { Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RecoveryProgressCardProps {
  /** Valor total glosado (R$). */
  totalGlosado: number;
  /** Valor efetivamente recuperado das glosas (R$). */
  valorRecuperado: number;
  className?: string;
}

/**
 * RecoveryProgressCard – mostra o progresso de recuperação de glosas
 * Focando no que já foi recuperado vs total glosado.
 */
export const RecoveryProgressCard = ({
  totalGlosado,
  valorRecuperado,
  className,
}: RecoveryProgressCardProps) => {
  if (totalGlosado <= 0) {
    return (
      <div className={cn('w-full rounded-xl border bg-card p-6 shadow-sm', className)}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            <Gauge className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Recuperação de Glosas</p>
            <h3 className="text-lg font-semibold leading-tight">
              Sem glosas para recuperar
            </h3>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Ainda não há glosas registradas no sistema para análise de recuperação.
          </p>
        </div>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((valorRecuperado / totalGlosado) * 100));
  const remaining = Math.max(0, totalGlosado - valorRecuperado);

  return (
    <div
      className={cn(
        'w-full rounded-xl border bg-gradient-to-br from-emerald-50/60 to-white p-6 shadow-sm',
        'dark:from-emerald-950/40 dark:to-background',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          <Gauge className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Recuperação de Glosas</p>
          <h3 className="text-lg font-semibold leading-tight">
            {percent >= 100 ? (
              <>Tudo recuperado! 🎉</>
            ) : percent === 0 ? (
              <>Ainda não recuperado</>
            ) : (
              <>
                Faltam{' '}
                <span className="font-bold">
                  R$ {remaining.toLocaleString('pt-BR')}
                </span>
              </>
            )}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Progress
          value={percent}
          indicatorClassName="bg-gradient-to-r from-emerald-400 to-blue-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percent}% recuperado</span>
          <span>
            R$ {valorRecuperado.toLocaleString('pt-BR')} de R${' '}
            {totalGlosado.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};
