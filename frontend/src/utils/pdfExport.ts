/**
 * Utilitário para lazy loading de bibliotecas PDF e exports
 * Otimizado para reduzir bundle size
 */

export interface ProcedureData {
  guia?: string;
  date?: string;
  data?: string;
  patient?: string;
  paciente?: string;
  code?: string;
  codigo?: string;
  description?: string;
  descricao?: string;
  quantity?: number;
  qtd?: number;
  financial?: {
    presented_value?: number;
    approved_value?: number;
    glosa?: number;
  };
  apresentado?: number;
  liberado?: number;
  glosa?: number;
}

// Lazy loading das bibliotecas PDF
const loadPDFLibs = async () => {
  const [jsPDFModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'), // Carrega mas não precisa usar diretamente
  ]);

  return {
    jsPDF: jsPDFModule.default,
  };
};

/**
 * Exporta demonstrativo para PDF
 */
export const exportDemonstrativeToPDF = async (
  periodo: string,
  procedures: ProcedureData[]
): Promise<void> => {
  try {
    const { jsPDF } = await loadPDFLibs();

    const doc = new jsPDF();
    doc.text(`Demonstrativo - ${periodo}`, 10, 10);

    // Usar autoTable
    (doc as any).autoTable({
      head: [
        [
          'Guia',
          'Data',
          'Paciente',
          'Código',
          'Descrição',
          'Qtd',
          'Apresentado',
          'Liberado',
          'Glosa',
        ],
      ],
      body: procedures.map((p) => [
        p.guia || '',
        p.date || p.data || '',
        p.patient || p.paciente || '',
        p.code || p.codigo || '',
        p.description || p.descricao || '',
        p.quantity || p.qtd || 0,
        p.financial?.presented_value ?? p.apresentado ?? 0,
        p.financial?.approved_value ?? p.liberado ?? 0,
        p.financial?.glosa ?? p.glosa ?? 0,
      ]),
    });

    doc.save(`demonstrativo_${periodo}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao exportar PDF. Tente novamente.');
  }
};
