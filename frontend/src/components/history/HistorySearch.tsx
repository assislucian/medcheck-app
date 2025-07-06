import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export interface HistorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
  onExport: () => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function HistorySearch({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onExport,
  dateRange,
  onDateRangeChange,
}: HistorySearchProps) {
  const handleExport = () => {
    onExport();
    toast.success('Exportação iniciada', {
      description: 'Seu relatório será baixado em breve.',
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="flex gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por hospital ou tipo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterStatus} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="analisado">Analisado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder="Filtrar por período"
          align="start"
          locale="pt-BR"
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
