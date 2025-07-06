import { saveAs } from 'file-saver';
import { create } from 'xmlbuilder2';
import { TISSProcedure } from './types';

/**
 * Exporta dados para XML no formato TISS da ANS
 * @param data Os dados a serem exportados
 * @param filename Nome do arquivo (sem extensão)
 */
export function exportToTissXML(data: any[], filename: string): void {
  try {
    // Criar estrutura base do XML TISS
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('ans:mensagemTISS', {
      'xmlns:ans': 'http://www.ans.gov.br/padroes/tiss/schemas',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.ans.gov.br/padroes/tiss/schemas',
      versaoCompTISS: '3.05.00',
    });

    // Adicionar cabeçalho
    const cabecalho = root.ele('ans:cabecalho');
    cabecalho
      .ele('ans:identificacaoTransacao')
      .ele('ans:tipoTransacao')
      .txt('ENVIO_LOTE_GUIAS')
      .up()
      .ele('ans:sequencialTransacao')
      .txt('1')
      .up()
      .ele('ans:dataRegistroTransacao')
      .txt(new Date().toISOString().split('T')[0])
      .up()
      .ele('ans:horaRegistroTransacao')
      .txt(new Date().toISOString().split('T')[1].substring(0, 8));

    // Adicionar dados
    const corpo = root.ele('ans:corpo');
    const lote = corpo.ele('ans:loteGuias');

    // Itens do lote
    data.forEach((item, index) => {
      const guia = lote.ele('ans:guiaSP-SADT');

      // Mapeamento básico para formato TISS
      guia
        .ele('ans:identificacaoGuiaSADTSP')
        .ele('ans:numeroGuiaPrestador')
        .txt(item.id || `GUIA${index}`);

      // Adicionar procedimentos se existirem
      if (item.procedimentos) {
        const procedimentosRealizados = guia.ele('ans:procedimentosRealizados');

        // Transformar dados de procedimentos no formato TISS
        if (Array.isArray(item.procedimentos)) {
          item.procedimentos.forEach((proc: TISSProcedure, procIndex: number) => {
            const procedimento = procedimentosRealizados.ele(
              'ans:procedimentoRealizado'
            );
            procedimento
              .ele('ans:procedimento')
              .ele('ans:codigoTabela')
              .txt('22')
              .up()
              .ele('ans:codigoProcedimento')
              .txt(proc.codigo || '')
              .up()
              .ele('ans:descricaoProcedimento')
              .txt(proc.descricao || '');
          });
        }
      }
    });

    // Gerar XML como string
    const xmlString = root.end({ prettyPrint: true });

    // Criar blob e iniciar download
    const blob = new Blob([xmlString], { type: 'application/xml' });
    saveAs(blob, `${filename}.xml`);
    console.info('Exportação XML TISS concluída com sucesso');
  } catch (error) {
    console.error('Erro ao exportar dados para XML:', error);
    throw new Error('Falha ao exportar dados para XML formato TISS');
  }
}
