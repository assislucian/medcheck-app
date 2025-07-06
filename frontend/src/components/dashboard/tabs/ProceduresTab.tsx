import { useState } from 'react';
import { ProceduresGrid } from './grids/ProceduresGrid';
import { Procedure } from '@/types/medical';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Filter, BarChart2, Download, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProceduresTabProps {
  procedures?: Procedure[];
}

const ProceduresTab = ({ procedures = [] }: ProceduresTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  const filteredData = procedures.filter((proc) => {
    const matchesSearch =
      searchTerm === '' ||
      proc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.beneficiario.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case 'pagos':
        return matchesSearch && proc.pago;
      case 'glosados':
        return matchesSearch && !proc.pago && proc.diferenca < 0;
      case 'pendentes':
        return matchesSearch && !proc.pago && proc.diferenca >= 0;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-medium">Procedimentos Médicos</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar procedimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrar</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Análise</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50 p-4">
          <Tabs defaultValue="todos" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 p-0 gap-4">
              <TabsTrigger
                value="todos"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=active]:border-primary data-[state=active]:border-b-2',
                  'rounded-none border-b-2 border-transparent pb-3'
                )}
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="pagos"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=active]:border-success data-[state=active]:border-b-2',
                  'rounded-none border-b-2 border-transparent pb-3'
                )}
              >
                Pagos
              </TabsTrigger>
              <TabsTrigger
                value="glosados"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=active]:border-destructive data-[state=active]:border-b-2',
                  'rounded-none border-b-2 border-transparent pb-3'
                )}
              >
                Glosados
              </TabsTrigger>
              <TabsTrigger
                value="pendentes"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=active]:border-warning data-[state=active]:border-b-2',
                  'rounded-none border-b-2 border-transparent pb-3'
                )}
              >
                Pendentes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          <ProceduresGrid procedures={filteredData} />
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum procedimento encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Não há procedimentos registrados nos últimos 30 dias'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProceduresTab;
