import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { isHistoryData, ReportData } from './types';
import { HistoryItem } from '@/components/history/data';
import { AnalysisResult } from '../../types';
import { ActivityLogEntry } from '../../types/activityLog';

/**
 * Exporta dados para Excel
 * @param data Os dados a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 */
export const exportToExcel = async (data: any[], filename: string): Promise<void> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');

    if (data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data
      data.forEach((item) => {
        const row = headers.map((header) => item[header]);
        worksheet.addRow(row);
      });
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileData = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(fileData, `${filename}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw new Error('Falha ao exportar dados para Excel');
  }
};

/**
 * Exporta dados de histórico para Excel em formato otimizado para contestação
 * @param data Dados do histórico
 * @param filename Nome do arquivo
 */
async function exportHistoryData(data: HistoryItem[], filename: string): Promise<void> {
  // Transformar dados para melhor visualização
  const formattedData = data.map((item) => ({
    Data: item.date,
    Hospital: item.description.split(' - ')[0],
    Competência: item.description.split(' - ')[1] || '',
    'Tipo de Análise': item.type,
    Status: item.status,
    'Total de Procedimentos': item.procedimentos,
    'Procedimentos Glosados': item.glosados,
    'Valor Glosado (estimativa R$)': item.glosados * 850,
    ID: item.id,
  }));

  // Criar workbook e worksheet com dados formatados
  const worksheet = ExcelJS.utils.json_to_sheet(formattedData);

  // Ajustar largura das colunas
  const wscols = [
    { wch: 12 }, // Data
    { wch: 30 }, // Hospital
    { wch: 15 }, // Competência
    { wch: 20 }, // Tipo de Análise
    { wch: 12 }, // Status
    { wch: 15 }, // Total de Procedimentos
    { wch: 15 }, // Procedimentos Glosados
    { wch: 18 }, // Valor Glosado
    { wch: 36 }, // ID
  ];
  worksheet['!cols'] = wscols;

  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet('Histórico de Análises', worksheet);

  // Adicionar folha com dados para contestação
  const contestacaoData = data
    .filter((item) => item.glosados > 0)
    .map((item) => ({
      Hospital: item.description.split(' - ')[0],
      Competência: item.description.split(' - ')[1] || '',
      'Total de Procedimentos Glosados': item.glosados,
      'Justificativa de Contestação': 'Valores abaixo da tabela CBHPM 2015',
      'Fundamentação Legal': 'Resolução Normativa Nº 428 da ANS, Art. 7º, III',
      'Valor a ser Recuperado (R$)': item.glosados * 850,
      'Data de Análise': item.date,
      'ID da Análise': item.id,
    }));

  if (contestacaoData.length > 0) {
    const contestacaoSheet = workbook.addWorksheet('Contestação');
    const headers = Object.keys(contestacaoData[0]);
    contestacaoSheet.addRow(headers);
    contestacaoData.forEach((item) => {
      const row = headers.map((header) => item[header]);
      contestacaoSheet.addRow(row);
    });
  }

  // Gerar o arquivo e iniciar download
  const buffer = await workbook.xlsx.writeBuffer();
  const fileData = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(fileData, `${filename}.xlsx`);
}

/**
 * Exporta dados de relatórios para Excel
 * @param reportData Dados do relatório
 * @param reportName Nome do relatório
 */
export const exportReportToExcel = async (
  reportData: any,
  reportName: string
): Promise<void> => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Summary data
    const summaryData = [
      { Métrica: 'Total de Análises', Valor: reportData.totalAnalyses },
      {
        Métrica: 'Valor Total Processado',
        Valor: `R$ ${reportData.totalValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
        })}`,
      },
      { Métrica: 'Procedimentos Únicos', Valor: reportData.uniqueProcedures },
      { Métrica: 'Taxa de Aprovação', Valor: `${reportData.approvalRate}%` },
    ];

    const summarySheet = workbook.addWorksheet('Resumo');
    summarySheet.addRow(['Métrica', 'Valor']);
    summaryData.forEach((item) => {
      summarySheet.addRow([item['Métrica'], item['Valor']]);
    });

    // Hospital data
    if (reportData.hospitalData && reportData.hospitalData.length > 0) {
      const hospitalSheet = workbook.addWorksheet('Por Hospital');
      const headers = Object.keys(reportData.hospitalData[0]);
      hospitalSheet.addRow(headers);
      reportData.hospitalData.forEach((item) => {
        const row = headers.map((header) => item[header]);
        hospitalSheet.addRow(row);
      });
    }

    // Procedure data
    if (reportData.procedureData && reportData.procedureData.length > 0) {
      const procedureSheet = workbook.addWorksheet('Por Procedimento');
      const headers = Object.keys(reportData.procedureData[0]);
      procedureSheet.addRow(headers);
      reportData.procedureData.forEach((item) => {
        const row = headers.map((header) => item[header]);
        procedureSheet.addRow(row);
      });
    }

    // Monthly data
    if (reportData.monthlyData && reportData.monthlyData.length > 0) {
      const monthlySheet = workbook.addWorksheet('Dados Mensais');
      const headers = Object.keys(reportData.monthlyData[0]);
      monthlySheet.addRow(headers);
      reportData.monthlyData.forEach((item) => {
        const row = headers.map((header) => item[header]);
        monthlySheet.addRow(row);
      });
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileData = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(fileData, `${reportName}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    throw new Error('Falha ao exportar relatório para Excel');
  }
};

export const exportAnalysisHistoryToExcel = async (
  analysisData: AnalysisResult[],
  activityLogs: ActivityLogEntry[],
  filename: string
): Promise<void> => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Format analysis data
    const formattedData = analysisData.map((analysis) => ({
      'ID da Análise': analysis.id,
      'Data de Upload': new Date(analysis.uploadDate).toLocaleDateString('pt-BR'),
      'Nome do Arquivo': analysis.fileName,
      'Total de Procedimentos': analysis.totalProcedures,
      'Valor Total': `R$ ${analysis.totalAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })}`,
      Status: analysis.status,
      'Criado em': new Date(analysis.createdAt).toLocaleString('pt-BR'),
    }));

    // Create analysis sheet
    const analysisSheet = workbook.addWorksheet('Histórico de Análises');

    if (formattedData.length > 0) {
      const headers = Object.keys(formattedData[0]);
      analysisSheet.addRow(headers);
      formattedData.forEach((item) => {
        const row = headers.map((header) => item[header]);
        analysisSheet.addRow(row);
      });
    }

    // Format contestation data
    const contestacaoData = activityLogs
      .filter((log) => log.action === 'contestacao_criada')
      .map((log) => ({
        Data: new Date(log.timestamp).toLocaleString('pt-BR'),
        'Análise ID': log.details.analysisId,
        Procedimento: log.details.procedure,
        'Valor Contestado': log.details.amount
          ? `R$ ${log.details.amount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`
          : 'N/A',
        Motivo: log.details.reason || 'N/A',
      }));

    if (contestacaoData.length > 0) {
      const contestacaoSheet = workbook.addWorksheet('Contestação');
      const headers = Object.keys(contestacaoData[0]);
      contestacaoSheet.addRow(headers);
      contestacaoData.forEach((item) => {
        const row = headers.map((header) => item[header]);
        contestacaoSheet.addRow(row);
      });
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileData = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(fileData, `${filename}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar histórico:', error);
    throw new Error('Falha ao exportar histórico para Excel');
  }
};
