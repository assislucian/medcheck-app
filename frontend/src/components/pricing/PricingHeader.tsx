import { Button } from '@/components/ui/button';

interface PricingHeaderProps {
  billingInterval: 'monthly' | 'yearly';
  onIntervalChange: (interval: 'monthly' | 'yearly') => void;
}

export function PricingHeader({
  billingInterval,
  onIntervalChange,
}: PricingHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-center text-muted-foreground max-w-2xl">
        Escolha o plano ideal para suas necessidades e comece a recuperar valores
        glosados hoje mesmo
      </p>

      <div className="flex items-center border border-input bg-background rounded-lg p-1 mt-6">
        <Button
          variant={billingInterval === 'monthly' ? 'default' : 'ghost'}
          onClick={() => onIntervalChange('monthly')}
          className="rounded-r-none min-w-[100px]"
        >
          Mensal
        </Button>
        <Button
          variant={billingInterval === 'yearly' ? 'default' : 'ghost'}
          onClick={() => onIntervalChange('yearly')}
          className="rounded-l-none min-w-[100px]"
        >
          Anual
          <span className="ml-2 bg-green-500/20 text-green-700 dark:text-green-400 text-xs py-0.5 px-1.5 rounded-full">
            -16%
          </span>
        </Button>
      </div>
    </div>
  );
}
