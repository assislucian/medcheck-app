import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface ReportsHeaderProps {
  onExport: () => void;
  onYearChange: (year: string) => void;
  onFilterPeriod: () => void;
}

export function ReportsHeader({
  onExport,
  onYearChange,
  onFilterPeriod,
}: ReportsHeaderProps) {
  const [selectedYear, setSelectedYear] = useState('2025');

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    onYearChange(year);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      <div className="flex gap-2">
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="default" onClick={onFilterPeriod}>
          <Calendar className="mr-2 h-4 w-4" />
          Filtrar Período
        </Button>
        <Button onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
