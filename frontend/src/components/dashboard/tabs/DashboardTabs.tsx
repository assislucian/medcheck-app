import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProceduresTab from "./ProceduresTab";
import PaymentsTab from "./PaymentsTab";
import GlosasTab from "./GlosasTab";
import { Procedure } from "@/types/medical";
import { FileText, CreditCard, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTabsProps {
  procedures?: Procedure[];
  glosas?: any[];
}

export function DashboardTabs({ procedures = [], glosas = [] }: DashboardTabsProps) {
  return (
    <div className="p-6">
      <Tabs defaultValue="procedimentos" className="w-full">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-sm flex gap-2 p-1 mb-6 rounded-xl">
          <TabsTrigger 
            value="procedimentos" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
              "data-[state=active]:shadow-sm hover:bg-muted"
            )}
          >
            <FileText className="h-4 w-4" /> 
            Procedimentos
          </TabsTrigger>
          <TabsTrigger 
            value="pagamentos"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
              "data-[state=active]:shadow-sm hover:bg-muted"
            )}
          >
            <CreditCard className="h-4 w-4" /> 
            Pagamentos
          </TabsTrigger>
          <TabsTrigger 
            value="glosas"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
              "data-[state=active]:shadow-sm hover:bg-muted"
            )}
          >
            <AlertCircle className="h-4 w-4" /> 
            Glosas
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="procedimentos" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1">
            <ProceduresTab procedures={procedures} />
          </TabsContent>
          
          <TabsContent value="pagamentos" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1">
            <PaymentsTab procedures={procedures} />
          </TabsContent>
          
          <TabsContent value="glosas" className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1">
            <GlosasTab glosas={glosas} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Adicione a animação fadein no CSS global ou local:
// .animate-fadein { animation: fadein 0.5s; }
// @keyframes fadein { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
