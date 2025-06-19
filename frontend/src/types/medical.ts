export interface DoctorParticipation {
  code: string;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface Procedure {
  id: string;
  codigo: string;
  procedimento: string;
  papel: string;
  valorCBHPM: number;
  valorPago: number;
  diferenca: number;
  pago: boolean;
  guia: string;
  beneficiario: string;
  doctors: any[];
}

export interface PaymentStatement {
  id: string;
  numero: string;
  competencia: string;
  hospital: string;
  data: string;
  beneficiario: string;
  codigo: string;
  descricao: string;
  funcao: string;
  pago: boolean;
  valorPago: number;
  valorTabela2015: number;
  diferenca: number;
  procedimentos: Procedure[];
}

export interface GuideData {
  numero: string;
  dataExecucao: string;
  beneficiario: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  status: string;
}

export interface DemonstrativeData {
  lote: string;
  conta: string;
  guia: string;
  data: string;
  carteira: string;
  beneficiario: string;
  nome: string;
  acomodacao: string;
  codigoServico: string;
  descricaoServico: string;
  quantidade: number;
  valorApresentado: number;
  valorLiberado: number;
  proRata: number;
  glosa: number;
}

export interface GuideProcedure {
  numero_guia: string;
  data: string;
  codigo: string;
  descricao: string;
  papel: string;
  crm: string;
  qtd: number;
  status: string;
  beneficiario: string;
  prestador?: string;
  nome_medico?: string;
  dt_inicio?: string;
  dt_fim?: string;
  status_part?: string;
}

export interface DashboardStats {
  totals: {
    totalRecebido: number;
    totalGlosado: number;
    totalRecuperado: number;
    potencialRecuperacao: number;
    tempoEconomizado: number;
    taxaSucesso: number;
  };
  procedures: Procedure[];
  glosas: any[];
}

export interface InfoCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  description: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  badge?: string;
  className?: string;
}
