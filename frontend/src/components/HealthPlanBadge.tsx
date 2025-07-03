import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Heart, Building2, Zap } from 'lucide-react';

const HealthPlanBadge = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const plan = localStorage.getItem('selected_health_plan');
    setSelectedPlan(plan);
  }, []);

  if (!selectedPlan) return null;

  const getPlanInfo = (planId: string) => {
    switch (planId) {
      case 'unimed':
        return {
          name: 'Unimed',
          icon: <Heart className="h-3 w-3" />,
          className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
        };
      case 'hapvida':
        return {
          name: 'Hapvida',
          icon: <Building2 className="h-3 w-3" />,
          className: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
        };
      case 'bradesco':
        return {
          name: 'Bradesco Saúde',
          icon: <Zap className="h-3 w-3" />,
          className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
        };
      default:
        return {
          name: 'Plano Selecionado',
          icon: null,
          className: 'bg-gray-500 text-white',
        };
    }
  };

  const planInfo = getPlanInfo(selectedPlan);

  return (
    <Badge className={`${planInfo.className} border-0 flex items-center gap-1`}>
      {planInfo.icon}
      {planInfo.name}
    </Badge>
  );
};

export default HealthPlanBadge;
