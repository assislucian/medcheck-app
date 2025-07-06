import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Headset } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import type { Plan } from './types';

interface PricingPlanProps {
  plan: Plan;
  billingInterval: 'monthly' | 'yearly';
  isTrial: boolean;
  onPlanSelect: (planId: string) => void;
}

export function PricingPlan({
  plan,
  billingInterval,
  isTrial,
  onPlanSelect,
}: PricingPlanProps) {
  const { theme } = useTheme();

  return (
    <Card
      className={cn(
        'flex flex-col h-full transition-all hover:scale-[1.02] hover:shadow-lg',
        plan.isFeatured && 'border-primary shadow-md shadow-primary/20',
        isTrial &&
          plan.name === 'Individual' &&
          'border-blue-400 shadow-md shadow-blue-400/20',
        theme === 'dark' ? 'bg-card' : `bg-gradient-to-br ${plan.bgColor}`
      )}
    >
      {plan.isFeatured && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Mais popular
        </div>
      )}
      {isTrial && plan.name === 'Individual' && (
        <div className="bg-blue-400 text-white text-center py-1 text-sm font-medium">
          Seu plano atual (Trial)
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            {plan.icon && <plan.icon className="h-5 w-5 text-primary" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl font-bold">{plan.price[billingInterval]}</span>
            {!plan.isEnterprise && (
              <span className="text-muted-foreground ml-2 mb-1">
                /{billingInterval === 'monthly' ? 'mês' : 'ano'}
              </span>
            )}
          </div>
          {billingInterval === 'yearly' && plan.discount?.yearly && (
            <p className="text-green-600 dark:text-green-400 text-sm mt-1">
              Economize {plan.discount.yearly} com o pagamento anual
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onPlanSelect(plan.id)}
          className={cn(
            'w-full group',
            plan.isEnterprise
              ? 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700'
              : ''
          )}
          variant={
            plan.isFeatured ? 'default' : plan.isEnterprise ? 'default' : 'outline'
          }
        >
          {plan.isEnterprise ? (
            <>
              Fale com especialista
              <Headset className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
            </>
          ) : (
            <>
              Assinar plano
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
