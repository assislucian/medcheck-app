/**
 * PDF Export Service - Serviço de Exportação Profissional de PDFs
 * =================================================================
 * 
 * Implementação de export de relatórios médicos em PDF seguindo 
 * melhores práticas para documentos profissionais na área da saúde.
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../../utils/format';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GuideData {
  numero_guia: string;
  data: string;
  paciente?: string;
  beneficiario?: string;
  codigo: string;
  descricao: string;
  papel: string;
  qtd: number;
  valorEstimado?: number;
  status?: string;
  prestador?: string;
}

interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  includeHeader?: boolean;
  includeSummary?: boolean;
  includeFooter?: boolean;
}

/**
 * Exporta dados de guias médicas para PDF profissional
 */
export function exportGuidesToPDF(
  guides: GuideData[], 
  filename: string,
  options: PDFExportOptions = {}
): void {
  try {
    const {
      title = 'Relatório de Guias Médicas',
      subtitle = 'Análise de Procedimentos e Honorários',
      includeHeader = true,
      includeSummary = true,
      includeFooter = true
    } = options;

    // Criação do documento PDF em formato A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações de cores e tipografia
    const colors = {
      primary: '#1e40af',      // Azul médico profissional
      secondary: '#64748b',    // Cinza neutro
      accent: '#f59e0b',       // Âmbar para destaques
      success: '#10b981',      // Verde para valores positivos
      danger: '#ef4444',       // Vermelho para alertas
      background: '#f8fafc',   // Fundo suave
      text: '#1f2937'          // Texto principal
    };

    let currentY = 20;

    // =================================================================
    // CABEÇALHO PROFISSIONAL
    // =================================================================
    if (includeHeader) {
      // Logo placeholder (substituir por logo real)
      doc.setFillColor(colors.primary);
      doc.roundedRect(20, currentY, 12, 12, 2, 2, 'F');
      
      // Logo text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('MC', 26, currentY + 7.5);

      // Informações da instituição
      doc.setTextColor(colors.text);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MedCheck - Gestão Médica', 38, currentY + 5);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Plataforma de Análise de Honorários e Procedimentos Médicos', 38, currentY + 10);

      // Data de geração
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(9);
      doc.setTextColor(colors.secondary);
      doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 20, currentY + 20);

      // Linha separadora
      doc.setDrawColor(colors.primary);
      doc.setLineWidth(0.5);
      doc.line(20, currentY + 25, 190, currentY + 25);

      currentY += 35;
    }

    // =================================================================
    // TÍTULO E SUBTÍTULO
    // =================================================================
    doc.setTextColor(colors.primary);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, currentY);
    currentY += 8;

    doc.setTextColor(colors.secondary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, currentY);
    currentY += 15;

    // =================================================================
    // RESUMO EXECUTIVO
    // =================================================================
    if (includeSummary && guides.length > 0) {
      // Cálculos do resumo
      const totalGuias = guides.length;
      const totalProcedimentos = guides.reduce((sum, guide) => sum + (guide.qtd || 1), 0);
      const valorTotalEstimado = guides.reduce((sum, guide) => 
        sum + ((guide.valorEstimado || 0) * (guide.qtd || 1)), 0
      );
      
      // Box do resumo
      doc.setFillColor(245, 247, 250); // Fundo suave
      doc.roundedRect(20, currentY, 170, 25, 3, 3, 'F');
      
      // Título do resumo
      doc.setTextColor(colors.text);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Executivo', 25, currentY + 8);

      // Métricas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Primeira linha de métricas
      doc.text(`Total de Guias: ${totalGuias}`, 25, currentY + 15);
      doc.text(`Procedimentos: ${totalProcedimentos}`, 80, currentY + 15);
      doc.text(`Valor Estimado: ${formatCurrency(valorTotalEstimado)}`, 135, currentY + 15);

      // Segunda linha com análise
      const procedimentosUnicos = new Set(guides.map(g => g.codigo)).size;
      doc.text(`Códigos Únicos: ${procedimentosUnicos}`, 25, currentY + 20);
      
      const hospitais = new Set(guides.map(g => g.prestador).filter(Boolean)).size;
      if (hospitais > 0) {
        doc.text(`Prestadores: ${hospitais}`, 80, currentY + 20);
      }

      currentY += 35;
    }

    // =================================================================
    // TABELA DE DADOS
    // =================================================================
    
    // Preparar dados da tabela
    const tableData = guides.map(guide => [
      guide.numero_guia || '-',
      guide.data || '-',
      guide.beneficiario || guide.paciente || '-',
      guide.codigo || '-',
      guide.descricao?.length > 40 
        ? guide.descricao.substring(0, 37) + '...' 
        : guide.descricao || '-',
      guide.papel || '-',
      (guide.qtd || 1).toString(),
      guide.valorEstimado 
        ? formatCurrency(guide.valorEstimado * (guide.qtd || 1))
        : '-'
    ]);

    // Configuração da tabela
    doc.autoTable({
      startY: currentY,
      head: [[
        'Guia',
        'Data',
        'Paciente',
        'Código',
        'Procedimento',
        'Papel',
        'Qtd',
        'Valor Est.'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175], // Azul primary
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 }, // Guia
        1: { halign: 'center', cellWidth: 18 }, // Data
        2: { halign: 'left', cellWidth: 35 },   // Paciente
        3: { halign: 'center', cellWidth: 20 }, // Código
        4: { halign: 'left', cellWidth: 40 },   // Procedimento
        5: { halign: 'center', cellWidth: 20 }, // Papel
        6: { halign: 'center', cellWidth: 12 }, // Qtd
        7: { halign: 'right', cellWidth: 20 }   // Valor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Zebra striping sutil
      },
      margin: { left: 20, right: 20 },
      didDrawPage: function(data) {
        // Número da página no rodapé
        if (includeFooter) {
          const pageCount = doc.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.setTextColor(colors.secondary);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
          
          // Rodapé com informações da empresa
          doc.text(
            'MedCheck - Relatório gerado automaticamente',
            data.settings.margin.left + 60,
            pageHeight - 10
          );
        }
      }
    });

    // =================================================================
    // RODAPÉ FINAL COM OBSERVAÇÕES
    // =================================================================
    if (includeFooter) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      // Observações importantes
      doc.setFontSize(9);
      doc.setTextColor(colors.secondary);
      doc.setFont('helvetica', 'italic');
      
      const observations = [
        '• Este relatório foi gerado automaticamente pelo sistema MedCheck.',
        '• Os valores estimados são baseados na tabela CBHPM vigente.',
        '• Para informações detalhadas, consulte os demonstrativos individuais.',
        '• Em caso de dúvidas, entre em contato com o suporte técnico.'
      ];

      observations.forEach((obs, index) => {
        doc.text(obs, 20, finalY + (index * 5));
      });
    }

    // =================================================================
    // GERAÇÃO E DOWNLOAD DO ARQUIVO
    // =================================================================
    
    // Gerar timestamp para o filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename = `${filename}_${timestamp}.pdf`;
    
    // Salvar o arquivo
    doc.save(finalFilename);
    
    console.log(`PDF exportado com sucesso: ${finalFilename}`);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do relatório PDF. Tente novamente.');
  }
}

/**
 * Função auxiliar para exportar relatório simples de guias
 */
export function exportSimpleGuidesReport(guides: GuideData[], filename = 'relatorio-guias'): void {
  exportGuidesToPDF(guides, filename, {
    title: 'Relatório de Guias Médicas',
    subtitle: 'Resumo de Procedimentos Realizados',
    includeHeader: true,
    includeSummary: true,
    includeFooter: true
  });
}

/**
 * Função auxiliar para exportar relatório detalhado
 */
export function exportDetailedGuidesReport(guides: GuideData[], filename = 'relatorio-detalhado-guias'): void {
  exportGuidesToPDF(guides, filename, {
    title: 'Relatório Detalhado de Guias Médicas',
    subtitle: 'Análise Completa de Procedimentos e Honorários Médicos',
    includeHeader: true,
    includeSummary: true,
    includeFooter: true
  });
}