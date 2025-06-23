import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'upload' | 'analysis' | 'payment' | 'gloss';
}

export function RecentActivities() {
  // For demo purposes, we'll create some mock activities
  // In a production app, these would come from an API
  const activities: ActivityItem[] = [
    {
      id: "1",
      title: "Análise Concluída",
      description: "Demonstrativo do Hospital Mater Dei processado",
      timestamp: "Há 2 horas",
      type: "analysis"
    },
    {
      id: "2",
      title: "Glosa Detectada",
      description: "Procedimento 30602246 glosado em R$ 450,00",
      timestamp: "Há 4 horas",
      type: "gloss"
    },
    {
      id: "3",
      title: "Pagamento Recebido",
      description: "Unimed liquidou o pagamento de Dezembro/2024",
      timestamp: "Há 2 dias",
      type: "payment"
    },
    {
      id: "4",
      title: "Arquivo Enviado",
      description: "Novo demonstrativo da Unimed enviado",
      timestamp: "Há 3 dias",
      type: "upload"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <FileText className="h-4 w-4" />;
      case 'analysis':
        return <BarChart2 className="h-4 w-4" />;
      case 'payment':
        return <CheckCircle className="h-4 w-4" />;
      case 'gloss':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case 'analysis':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case 'payment':
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case 'gloss':
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>O que aconteceu nos últimos dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l border-dashed border-gray-200">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={cn(
                "mb-6 last:mb-0 relative"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full absolute -left-[14px] flex items-center justify-center",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="pl-4">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
