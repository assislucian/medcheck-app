import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { fetchHospitalData } from '@/services/reports';
import { Loader2 } from 'lucide-react';

type HospitalData = {
  name: string;
  procedimentos: number;
  glosados: number;
  recuperados: number;
};

export function HospitalsTable() {
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHospitalData = async () => {
      const data = await fetchHospitalData();
      setHospitalData(data);
      setLoading(false);
    };

    loadHospitalData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise por Hospital</CardTitle>
        <CardDescription>Procedimentos e glosas por instituição</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dados dos hospitais...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Hospital</th>
                  <th className="pb-2 text-center font-medium">Procedimentos</th>
                  <th className="pb-2 text-center font-medium">Glosados</th>
                  <th className="pb-2 text-center font-medium">% Glosa</th>
                  <th className="pb-2 text-center font-medium">Recuperados</th>
                  <th className="pb-2 text-center font-medium">% Recuperação</th>
                </tr>
              </thead>
              <tbody>
                {hospitalData.length > 0 ? (
                  hospitalData.map((hospital, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{hospital.name}</td>
                      <td className="py-3 text-center">{hospital.procedimentos}</td>
                      <td className="py-3 text-center text-red-500 font-medium">
                        {hospital.glosados}
                      </td>
                      <td className="py-3 text-center">
                        {hospital.procedimentos > 0
                          ? (
                              (hospital.glosados / hospital.procedimentos) *
                              100
                            ).toFixed(1)
                          : '0.0'}
                        %
                      </td>
                      <td className="py-3 text-center text-green-500 font-medium">
                        {hospital.recuperados}
                      </td>
                      <td className="py-3 text-center">
                        {hospital.glosados > 0
                          ? ((hospital.recuperados / hospital.glosados) * 100).toFixed(
                              1
                            )
                          : '0.0'}
                        %
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Nenhum dado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
