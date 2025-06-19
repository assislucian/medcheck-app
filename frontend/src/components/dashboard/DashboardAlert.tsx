import { ArrowUpRight, Sparkles } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import { cn } from "../../lib/utils";

interface DashboardAlertProps {
  valorRecuperado: number;
}

export function DashboardAlert({ valorRecuperado }: DashboardAlertProps) {
  if (!valorRecuperado) return null;

  const isHighValue = valorRecuperado > 10000;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6",
      "bg-gradient-to-r from-success/10 via-success/5 to-background",
      "border border-success/20",
      "animate-in fade-in-50 slide-in-from-bottom-5"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "shrink-0 rounded-lg p-2.5",
          "bg-gradient-to-br from-success/20 to-success/10",
          "text-success"
        )}>
          <ArrowUpRight className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-success">
            Você recuperou {formatCurrency(valorRecuperado)} este mês. Excelente!
          </h3>
          <p className="text-sm text-success/80">
            Continue acompanhando seus demonstrativos para maximizar seus resultados.
          </p>
        </div>
      </div>

      {isHighValue && (
        <>
          <div className="absolute top-0 right-0 p-3">
            <div className="animate-pulse">
              <Sparkles className="h-5 w-5 text-success" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-success/5 rounded-full blur-2xl" />
        </>
      )}
    </div>
  );
}
