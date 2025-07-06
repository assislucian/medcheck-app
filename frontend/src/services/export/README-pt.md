# Documentação dos Serviços de Exportação

Esta documentação fornece um guia completo para usar os serviços de exportação na aplicação MedCheck. Estes serviços permitem que os dados sejam exportados em vários formatos, incluindo Excel, TISS XML e HL7 FHIR.

## Índice

1. [Exportação Excel](#exportação-excel)
   - [Exportação Básica](#exportação-básica-excel)
   - [Exportação de Relatórios](#exportação-de-relatórios-excel)
   - [Exportação de Histórico](#exportação-de-histórico-excel)
2. [Exportação TISS XML](#exportação-tiss-xml)
3. [Exportação HL7 FHIR](#exportação-hl7-fhir)
4. [Exemplos de Uso Comum](#exemplos-de-uso-comum)

## Exportação Excel

O serviço de exportação Excel oferece funcionalidade para exportar dados para o formato Excel (.xlsx).

### Exportação Básica Excel

```typescript
import { exportToExcel } from '@/services/exportService';

// Dados de exemplo
const data = [
  { name: 'Hospital A', procedimentos: 150, glosados: 12 },
  { name: 'Hospital B', procedimentos: 230, glosados: 18 },
];

// Exportar os dados
exportToExcel(data, 'hospitais-analise');
// Isso fará o download de um arquivo chamado "hospitais-analise.xlsx"
```

### Exportação de Relatórios Excel

```typescript
import { exportReportToExcel } from '@/services/exportService';

// Estrutura de dados de relatório de exemplo
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

// Exportar o relatório
exportReportToExcel(reportData, 'relatorio-trimestral');
// Isso fará o download de um arquivo chamado "relatorio-trimestral.xlsx" com várias planilhas
```

### Exportação de Histórico Excel

A exportação de histórico é tratada automaticamente pela função `exportToExcel` quando ela detecta que os dados são do tipo `HistoryItem[]`:

```typescript
import { exportToExcel } from '@/services/exportService';
import { HistoryItem } from '@/components/history/data';

// Dados de histórico de exemplo
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

// Exportar os dados de histórico
exportToExcel(historyData, 'historico-analises');
// Isso criará um arquivo Excel com formatação especial para dados de histórico
// e uma segunda planilha com dados de contestação, se aplicável
```

## Exportação TISS XML

O serviço de exportação TISS XML é usado para exportar dados no formato TISS (Troca de Informações em Saúde Suplementar) definido pela ANS (Agência Nacional de Saúde Suplementar) no Brasil.

```typescript
import { exportToTissXML } from '@/services/exportService';

// Dados de exemplo para exportação TISS
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

// Exportar para o formato TISS XML
exportToTissXML(procedimentosData, 'guias-tiss');
// Isso fará o download de um arquivo chamado "guias-tiss.xml" no formato TISS
```

## Exportação HL7 FHIR

O serviço de exportação HL7 FHIR permite exportar dados no formato padrão HL7 FHIR (Fast Healthcare Interoperability Resources).

```typescript
import { exportToFHIR } from '@/services/exportService';

// Dados de pacientes de exemplo para exportação FHIR
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

// Exportar como recursos FHIR Patient
exportToFHIR(patientData, 'Patient', 'pacientes-fhir');
// Isso fará o download de um arquivo chamado "pacientes-fhir.json" no formato FHIR

// Dados de médicos de exemplo
const practitionerData = [
  {
    id: 'DR001',
    nome: 'Dr. Carlos Mendes',
    crm: '12345-SP',
    especialidade: 'Cardiologia',
  },
];

// Exportar como recursos FHIR Practitioner
exportToFHIR(practitionerData, 'Practitioner', 'medicos-fhir');
// Isso fará o download de um arquivo chamado "medicos-fhir.json" no formato FHIR
```

## Exemplos de Uso Comum

### Exportando de uma Página de Relatórios

```typescript
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { exportReportToExcel, exportToTissXML, exportToFHIR } from "@/services/exportService";
import { toast } from "sonner";

// Dentro do componente
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

// No JSX
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

### Exportando de uma Página de Histórico

```typescript
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/services/exportService";
import { HistoryItem } from "@/components/history/data";
import { toast } from "sonner";

// Dentro do componente
const handleExport = () => {
  try {
    exportToExcel(filteredHistory, 'historico-analises');
    toast.success("Exportação concluída com sucesso");
  } catch (error) {
    console.error("Erro ao exportar histórico:", error);
    toast.error("Falha ao exportar histórico");
  }
};

// No JSX
<Button variant="outline" size="sm" onClick={handleExport}>
  <Download className="mr-2 h-4 w-4" />
  Exportar Excel
</Button>
```

## Dicas para Trabalhar com Serviços de Exportação

1. **Tratar Erros:** Sempre envolva chamadas de função de exportação em blocos try/catch para lidar com erros graciosamente.
2. **Nomenclatura de Arquivos:** Use nomes de arquivos descritivos que incluam datas ou identificadores.
3. **Limpeza de Dados:** Para exportações Excel, objetos complexos são automaticamente limpos, mas certifique-se de que seus dados estejam formatados corretamente.
4. **Grandes Conjuntos de Dados:** Tenha cuidado ao exportar conjuntos de dados muito grandes, pois isso pode afetar o desempenho do navegador.
5. **Conformidade TISS:** Ao usar exportações TISS, certifique-se de que sua estrutura de dados siga as diretrizes da ANS.
6. **Tipos de Recursos FHIR:** Use o tipo de recurso apropriado ao exportar para o formato FHIR.

## Estendendo os Serviços de Exportação

Para adicionar suporte a novos formatos de exportação ou personalizar os existentes, modifique o arquivo de serviço correspondente no diretório `src/services/export`.
