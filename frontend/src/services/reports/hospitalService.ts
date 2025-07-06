import { supabase } from '@/integrations/supabase/client';

export interface HospitalData {
  name: string;
  procedimentos: number;
  glosados: number;
  recuperados: number;
}

export async function fetchHospitalData(): Promise<HospitalData[]> {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('hospital, summary');

    if (error) {
      console.error('Erro ao buscar dados por hospital:', error);
      return [];
    }

    const hospitalData = data.reduce((acc: any, item: any) => {
      const hospital = item.hospital || 'Desconhecido';

      if (!acc[hospital]) {
        acc[hospital] = {
          procedimentos: 0,
          glosados: 0,
          recuperados: 0,
        };
      }

      const summary =
        typeof item.summary === 'object' && item.summary !== null ? item.summary : {};
      const summaryObj = summary as any;

      acc[hospital].procedimentos += Number(summaryObj?.procedimentosTotal || 0);
      acc[hospital].glosados += Number(summaryObj?.procedimentosNaoPagos || 0);
      acc[hospital].recuperados += Math.round(
        Number(summaryObj?.procedimentosNaoPagos || 0) * 0.3
      );

      return acc;
    }, {});

    return Object.entries(hospitalData).map(([name, values]: [string, any]) => ({
      name,
      procedimentos: values.procedimentos,
      glosados: values.glosados,
      recuperados: values.recuperados,
    }));
  } catch (error) {
    console.error('Erro ao processar dados por hospital:', error);
    return [];
  }
}
