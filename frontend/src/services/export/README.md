# Export Services Documentation

This documentation provides a comprehensive guide to using the export services in the MedCheck application. These services allow data to be exported in various formats including Excel, TISS XML, and HL7 FHIR.

## Table of Contents

1. [Excel Export](#excel-export)
   - [Basic Export](#basic-excel-export)
   - [Report Export](#report-excel-export)
   - [History Export](#history-excel-export)
2. [TISS XML Export](#tiss-xml-export)
3. [HL7 FHIR Export](#hl7-fhir-export)
4. [Common Usage Examples](#common-usage-examples)

## Excel Export

The Excel export service provides functionality to export data to Excel (.xlsx) format.

### Basic Excel Export

```typescript
import { exportToExcel } from '@/services/exportService';

// Example data
const data = [
  { name: 'Hospital A', procedimentos: 150, glosados: 12 },
  { name: 'Hospital B', procedimentos: 230, glosados: 18 },
];

// Export the data
exportToExcel(data, 'hospitais-analise');
// This will download a file named "hospitais-analise.xlsx"
```

### Report Excel Export

```typescript
import { exportReportToExcel } from '@/services/exportService';

// Example report data structure
const reportData = {
  period: 'Janeiro a Março 2025',
  summary: {
    totalRecebido: 195000.5,
    totalGlosado: 14500.75,
    totalProcedimentos: 1350,
    auditoriaPendente: 42,
  },
  hospitalData: [
    { name: 'Hospital A', procedimentos: 500, glosados: 45, recuperados: 30 },
    { name: 'Hospital B', procedimentos: 850, glosados: 62, recuperados: 40 },
  ],
  monthlyData: [
    { month: 'Janeiro', procedimentos: 450, glosados: 35 },
    { month: 'Fevereiro', procedimentos: 420, glosados: 31 },
    { month: 'Março', procedimentos: 480, glosados: 38 },
  ],
  procedureData: [
    {
      codigo: '31309127',
      descricao: 'Consulta em consultório',
      quantidade: 245,
      glosados: 12,
    },
    {
      codigo: '31602029',
      descricao: 'Atendimento de emergência',
      quantidade: 118,
      glosados: 8,
    },
  ],
};

// Export the report
exportReportToExcel(reportData, 'relatorio-trimestral');
// This will download a file named "relatorio-trimestral.xlsx" with multiple sheets
```

### History Excel Export

The history export is handled automatically by the `exportToExcel` function when it detects that the data is of type `HistoryItem[]`:

```typescript
import { exportToExcel } from '@/services/exportService';
import { HistoryItem } from '@/components/history/data';

// Example history data
const historyData: HistoryItem[] = [
  {
    id: '1',
    date: '2025-03-15',
    description: 'Hospital Santa Maria - Jan/2025',
    type: 'Guia',
    status: 'analisado',
    procedimentos: 145,
    glosados: 12,
  },
  {
    id: '2',
    date: '2025-03-10',
    description: 'Hospital São Lucas - Fev/2025',
    type: 'Demonstrativo',
    status: 'pendente',
    procedimentos: 230,
    glosados: 0,
  },
];

// Export the history data
exportToExcel(historyData, 'historico-analises');
// This will create an Excel file with special formatting for history data
// and a second sheet with contestation data if applicable
```

## TISS XML Export

The TISS XML export service is used to export data in the TISS (Troca de Informações em Saúde Suplementar) format defined by ANS (Agência Nacional de Saúde Suplementar) in Brazil.

```typescript
import { exportToTissXML } from '@/services/exportService';

// Example data for TISS export
const procedimentosData = [
  {
    id: 'GUIA123456',
    procedimentos: [
      { codigo: '10101012', descricao: 'Consulta em consultório' },
      { codigo: '40304361', descricao: 'Endoscopia digestiva alta' },
    ],
  },
  {
    id: 'GUIA123457',
    procedimentos: [{ codigo: '31309127', descricao: 'Consulta em pronto socorro' }],
  },
];

// Export to TISS XML format
exportToTissXML(procedimentosData, 'guias-tiss');
// This will download a file named "guias-tiss.xml" in TISS format
```

## HL7 FHIR Export

The HL7 FHIR export service allows exporting data in the HL7 FHIR (Fast Healthcare Interoperability Resources) standard format.

```typescript
import { exportToFHIR } from '@/services/exportService';

// Example patient data for FHIR export
const patientData = [
  {
    id: 'PT001',
    nome: 'Maria Silva',
    genero: 'female',
    dataNascimento: '1985-06-15',
  },
  {
    id: 'PT002',
    nome: 'João Santos',
    genero: 'male',
    dataNascimento: '1978-11-23',
  },
];

// Export as FHIR Patient resources
exportToFHIR(patientData, 'Patient', 'pacientes-fhir');
// This will download a file named "pacientes-fhir.json" in FHIR format

// Example practitioner data
const practitionerData = [
  {
    id: 'DR001',
    nome: 'Dr. Carlos Mendes',
    crm: '12345-SP',
    especialidade: 'Cardiologia',
  },
];

// Export as FHIR Practitioner resources
exportToFHIR(practitionerData, 'Practitioner', 'medicos-fhir');
// This will download a file named "medicos-fhir.json" in FHIR format
```

## Common Usage Examples

### Exporting from a Report Page

```typescript
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { exportReportToExcel, exportToTissXML, exportToFHIR } from "@/services/exportService";
import { toast } from "sonner";

// Inside component
const handleExport = (format: 'excel' | 'tiss' | 'fhir' = 'excel') => {
  try {
    const reportData = {
      period: `Ano ${currentYear}`,
      summary: reportTotals,
      hospitalData: hospitalData,
      monthlyData: monthlyData,
      procedureData: [] // Opcional
    };

    const filename = `relatorio-${currentYear}`;

    switch (format) {
      case 'excel':
        exportReportToExcel(reportData, filename);
        toast.success("Relatório exportado em Excel");
        break;

      case 'tiss':
        exportToTissXML(hospitalData, `${filename}-tiss`);
        toast.success("Relatório exportado em formato TISS (XML)");
        break;

      case 'fhir':
        exportToFHIR(hospitalData, 'Organization', `${filename}-fhir`);
        toast.success("Relatório exportado em formato HL7 FHIR");
        break;
    }
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    toast.error("Erro ao exportar");
  }
};

// In JSX
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Exportar</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleExport('excel')}>
      Exportar como Excel
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleExport('tiss')}>
      Exportar como TISS (XML)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleExport('fhir')}>
      Exportar como HL7 FHIR
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Exporting from a History Page

```typescript
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/services/exportService";
import { HistoryItem } from "@/components/history/data";
import { toast } from "sonner";

// Inside component
const handleExport = () => {
  try {
    exportToExcel(filteredHistory, 'historico-analises');
    toast.success("Exportação concluída com sucesso");
  } catch (error) {
    console.error("Erro ao exportar histórico:", error);
    toast.error("Falha ao exportar histórico");
  }
};

// In JSX
<Button variant="outline" size="sm" onClick={handleExport}>
  <Download className="mr-2 h-4 w-4" />
  Exportar Excel
</Button>
```

## Tips for Working with Export Services

1. **Handle Errors:** Always wrap export function calls in try/catch blocks to handle errors gracefully.
2. **File Naming:** Use descriptive filenames that include dates or identifiers.
3. **Data Cleaning:** For Excel exports, complex objects are automatically cleaned, but ensure your data is properly formatted.
4. **Large Datasets:** Be cautious when exporting very large datasets as it may impact browser performance.
5. **TISS Compliance:** When using TISS exports, ensure your data structure follows ANS guidelines.
6. **FHIR Resource Types:** Use the appropriate resource type when exporting to FHIR format.

## Extending the Export Services

To add support for new export formats or customize existing ones, modify the corresponding service file in the `src/services/export` directory.
