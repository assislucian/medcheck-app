import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProceduresTab from './ProceduresTab';
import PaymentsTab from './PaymentsTab';
import GlosasTab from './GlosasTab';
import { Procedure } from '@/types/medical';

interface DashboardTabsProps {
  procedures?: Procedure[];
  glosas?: any[];
}

export function DashboardTabs({ procedures = [], glosas = [] }: DashboardTabsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="procedimentos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger
            value="procedimentos"
            className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Procedimentos
          </TabsTrigger>
          <TabsTrigger
            value="pagamentos"
            className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Pagamentos
          </TabsTrigger>
          <TabsTrigger
            value="glosas"
            className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Glosas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="procedimentos" className="mt-6">
          <ProceduresTab procedures={procedures} />
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-6">
          <PaymentsTab procedures={procedures} />
        </TabsContent>

        <TabsContent value="glosas" className="mt-6">
          <GlosasTab glosas={glosas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Adicione a animação fadein no CSS global ou local:
// .animate-fadein { animation: fadein 0.5s; }
// @keyframes fadein { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
