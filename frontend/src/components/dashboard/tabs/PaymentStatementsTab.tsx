import { useState } from 'react';
import { PaymentStatementsGrid } from './grids/PaymentStatementsGrid';
import { PaymentStatement } from '@/types/medical';

const PaymentStatementsTab = () => {
  // Dados de exemplo para demonstração
  const [payments] = useState<PaymentStatement[]>([
    {
      id: '1',
      numero: '123456',
      competencia: '2025-04',
      hospital: 'Hospital São Lucas',
      data: '2025-04-10',
      beneficiario: 'João Silva',
      codigo: '31170123',
      descricao: 'Facectomia com LIO',
      funcao: 'cirurgiao',
      pago: true,
      valorPago: 983.45,
      valorTabela2015: 980.0,
      diferenca: 0.35,
      procedimentos: [],
    },
    {
      id: '2',
      numero: '123456',
      competencia: '2025-04',
      hospital: 'Hospital São Lucas',
      data: '2025-04-10',
      beneficiario: 'João Silva',
      codigo: '30912040',
      descricao: 'Vitrectomia posterior',
      funcao: 'cirurgiao',
      pago: false,
      valorPago: 0,
      valorTabela2015: 1250.0,
      diferenca: -100,
      procedimentos: [],
    },
    {
      id: '3',
      numero: '123457',
      competencia: '2025-04',
      hospital: 'Hospital São Lucas',
      data: '2025-04-15',
      beneficiario: 'Maria Oliveira',
      codigo: '30809053',
      descricao: 'Palpebra - reconstrução total',
      funcao: 'cirurgiao',
      pago: true,
      valorPago: 1245.0,
      valorTabela2015: 1350.0,
      diferenca: -7.78,
      procedimentos: [],
    },
    {
      id: '4',
      numero: '123458',
      competencia: '2025-04',
      hospital: 'Hospital Santa Maria',
      data: '2025-04-18',
      beneficiario: 'José Santos',
      codigo: '30911036',
      descricao: 'Ceratectomia superficial',
      funcao: 'aux1',
      pago: true,
      valorPago: 720.0,
      valorTabela2015: 650.0,
      diferenca: 10.77,
      procedimentos: [],
    },
    {
      id: '5',
      numero: '123459',
      competencia: '2025-04',
      hospital: 'Hospital Santa Maria',
      data: '2025-04-20',
      beneficiario: 'Carlos Ferreira',
      codigo: '31170077',
      descricao: 'Retirada de corpo estranho da córnea',
      funcao: 'anestesista',
      pago: true,
      valorPago: 450.0,
      valorTabela2015: 600.0,
      diferenca: -25.0,
      procedimentos: [],
    },
  ]);

  return <PaymentStatementsGrid payments={payments} />;
};

export default PaymentStatementsTab;
