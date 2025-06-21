import { Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RecoveryProgressCardProps {
  /** Valor total apresentado no período (R$). */
  presented: number;
  /** Valor efetivamente pago no período (R$). */
  received: number;
  className?: string;
}

/**
 * RecoveryProgressCard – mostra a relação Pago / Apresentado de forma
 * simples, focando no que já entrou no bolso do médico.
 * Se não houver dados, exibe fallback amigável.
 */
export const RecoveryProgressCard = ({ presented, received, className }: RecoveryProgressCardProps) => {
  if (presented <= 0) {
    return (
      <div className={cn("w-full rounded-xl border bg-card p-6 shadow-sm", className)}>
        <p className="text-sm text-muted-foreground">Sem dados de pagamentos suficientes para o período.</p>
      </div>
    );
  }

  const percent = Math.round((received / presented) * 100);
  const remaining = Math.max(0, presented - received);

  return (
    <div className={cn("w-full rounded-xl border bg-gradient-to-br from-emerald-50/60 to-white p-6 shadow-sm dark:from-emerald-950/40 dark:to-background", className)}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          <Gauge className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Pagamentos recebidos</p>
          <h3 className="text-lg font-semibold leading-tight">
            {percent >= 100 ? (
              <>Tudo pago! 🎉</>
            ) : (
              <>Ainda faltam <span className="font-bold">R$ {remaining.toLocaleString("pt-BR")}</span></>
            )}
          </h3>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <Progress value={percent} indicatorClassName="bg-gradient-to-r from-emerald-400 to-blue-500" />
        <p className="text-xs text-muted-foreground">
          {percent}% de R$ {presented.toLocaleString("pt-BR")} apresentados já pagos
        </p>
      </div>
    </div>
  );
}; 