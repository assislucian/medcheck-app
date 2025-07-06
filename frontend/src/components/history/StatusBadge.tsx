import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'Analisado') {
    return (
      <Badge variant="success">
        <Check className="mr-1 h-3 w-3" />
        Analisado
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      <Clock className="mr-1 h-3 w-3" />
      Pendente
    </Badge>
  );
}
