import { useState } from 'react';
import { PaymentStatement, Procedure, DoctorParticipation } from '@/types/medical';
import { findProcedureByCodigo, calculateTotalCBHPM } from '@/data/cbhpmData';

export const calculateCBHPMByRole = (baseCBHPM: number, role: string): number => {
  switch (role) {
    case 'Cirurgião':
      return baseCBHPM;
    case 'Primeiro Auxiliar':
      return baseCBHPM * 0.3;
    case 'Segundo Auxiliar':
      return baseCBHPM * 0.2;
    case 'Anestesista':
      return baseCBHPM * 0.3;
    default:
      return 0;
  }
};

const demonstrativos: PaymentStatement[] = [
  {
    id: 'dem1',
    numero: 'DEM-2024-001',
    competencia: 'Agosto/2024',
    hospital: 'Liga Norteriog Cancer Policlinic',
    data: '2024-08-19',
    beneficiario: '00620040000604690',
    codigo: '30602246', // Added required fields
    descricao: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
    funcao: 'Cirurgião',
    pago: true,
    valorPago: 457.64,
    valorTabela2015: 1521.32,
    diferenca: -1063.68,
    procedimentos: [
      {
        id: 'proc1',
        codigo: '30602246',
        procedimento: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
        papel: 'Cirurgião',
        valorCBHPM: 1521.32,
        valorPago: 457.64,
        diferenca: -1063.68,
        pago: true,
        guia: '10467538',
        beneficiario: '00620040000604690',
        doctors: [
          {
            code: '8425',
            name: 'FERNANDA MABEL BATISTA DE AQUINO',
            role: 'Cirurgião',
            startTime: '2024-08-19T14:09:00',
            endTime: '2024-08-19T15:24:00',
            status: 'Fechada',
          },
          {
            code: '6091',
            name: 'MOISES DE OLIVEIRA SCHOTS',
            role: 'Primeiro Auxiliar',
            startTime: '2024-08-19T14:15:00',
            endTime: '2024-08-19T15:17:00',
            status: 'Fechada',
          },
          {
            code: '4127',
            name: 'LILIANE ANNUZA DA SILVA',
            role: 'Anestesista',
            startTime: '2024-08-19T15:17:00',
            endTime: '2024-08-19T15:43:00',
            status: 'Fechada',
          },
        ],
      },
    ],
  },
];

export const useDemonstrativoSelection = () => {
  const [selectedDemonstrativo, setSelectedDemonstrativo] = useState<string>(
    demonstrativos[0].id
  );
  const currentDemonstrativo = demonstrativos.find(
    (d) => d.id === selectedDemonstrativo
  );
  const procedimentos = currentDemonstrativo?.procedimentos || [];

  const getTotals = () => {
    const totalCBHPM = procedimentos.reduce((acc, curr) => {
      const cbhpmData = findProcedureByCodigo(curr.codigo);
      if (!cbhpmData) return acc;

      const baseCBHPM = calculateTotalCBHPM(cbhpmData);
      const doctorsCBHPM = curr.doctors.reduce(
        (sum, doctor) => sum + calculateCBHPMByRole(baseCBHPM, doctor.role),
        0
      );
      return acc + doctorsCBHPM;
    }, 0);

    const totalPago = procedimentos.reduce((acc, curr) => acc + curr.valorPago, 0);
    const totalDiferenca = totalCBHPM - totalPago;
    const procedimentosNaoPagos = procedimentos.filter((item) => !item.pago).length;

    return {
      totalCBHPM,
      totalPago,
      totalDiferenca,
      procedimentosNaoPagos,
    };
  };

  return {
    demonstrativos,
    selectedDemonstrativo,
    setSelectedDemonstrativo,
    currentDemonstrativo,
    procedimentos,
    getTotals,
  };
};
