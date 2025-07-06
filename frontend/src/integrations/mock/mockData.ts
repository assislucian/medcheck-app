export interface MockProcedure {
  id: string;
  analysis_id: string;
  codigo: string;
  procedimento: string;
  papel: string;
  valor_cbhpm: number;
  valor_pago: number;
  diferenca: number;
  pago: boolean;
  guia: string;
  beneficiario: string;
  doctors?: { id: string; name: string }[];
  user_id?: string;
  created_at: string;
}

export interface MockAnalysis {
  id: string;
  created_at: string;
  file_name: string;
  file_type: string;
  hospital: string;
  competencia: string;
  numero: string;
  status: string;
  summary: {
    totalCBHPM: number;
    totalPago: number;
    totalDiferenca: number;
    procedimentosTotal: number;
    procedimentosNaoPagos: number;
  };
  user_id: string;
}

export interface MockProfile {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
  trial_status: string;
  created_at: string;
  notification_preferences?: {
    email: {
      newReports: boolean;
      systemUpdates: boolean;
      tips: boolean;
      newsletter: boolean;
    };
    sms: {
      criticalAlerts: boolean;
      paymentRecovery: boolean;
      invoiceReminders: boolean;
    };
    avatar_url?: string;
  };
}

// Generate mock procedures
export const mockProcedures: MockProcedure[] = [
  {
    id: '1',
    analysis_id: '1',
    codigo: '31309054',
    procedimento: 'Laparotomia exploradora',
    papel: 'Cirurgião',
    valor_cbhpm: 562.3,
    valor_pago: 468.6,
    diferenca: -93.7,
    pago: true,
    guia: 'G123456',
    beneficiario: 'João da Silva',
    doctors: [{ id: '1', name: 'Dr. Carlos Mendes' }],
    user_id: '1',
    created_at: '2025-01-15T08:30:00Z',
  },
  {
    id: '2',
    analysis_id: '1',
    codigo: '30715016',
    procedimento: 'Angioplastia transluminal',
    papel: 'Auxiliar',
    valor_cbhpm: 320.4,
    valor_pago: 280.0,
    diferenca: -40.4,
    pago: true,
    guia: 'G123457',
    beneficiario: 'Maria Oliveira',
    doctors: [{ id: '1', name: 'Dr. Carlos Mendes' }],
    user_id: '1',
    created_at: '2025-01-15T09:45:00Z',
  },
  {
    id: '3',
    analysis_id: '1',
    codigo: '32301065',
    procedimento: 'Cirurgia de catarata',
    papel: 'Cirurgião',
    valor_cbhpm: 480.0,
    valor_pago: 0,
    diferenca: -480.0,
    pago: false,
    guia: 'G123458',
    beneficiario: 'Antonio Pereira',
    doctors: [{ id: '1', name: 'Dr. Carlos Mendes' }],
    user_id: '1',
    created_at: '2025-01-16T10:15:00Z',
  },
  {
    id: '4',
    analysis_id: '2',
    codigo: '40302920',
    procedimento: 'Ecocardiograma transtorácico',
    papel: 'Executante',
    valor_cbhpm: 210.5,
    valor_pago: 210.5,
    diferenca: 0,
    pago: true,
    guia: 'G234561',
    beneficiario: 'Roberto Almeida',
    doctors: [{ id: '1', name: 'Dr. Carlos Mendes' }],
    user_id: '1',
    created_at: '2025-02-03T14:20:00Z',
  },
];

// Generate mock analyses
export const mockAnalyses: MockAnalysis[] = [
  {
    id: '1',
    created_at: '2025-01-15T08:00:00Z',
    file_name: 'demonstrativo_janeiro_2025.pdf',
    file_type: 'application/pdf',
    hospital: 'Hospital São Lucas',
    competencia: 'Janeiro 2025',
    numero: 'DM123456',
    status: 'completo',
    summary: {
      totalCBHPM: 1362.7,
      totalPago: 748.6,
      totalDiferenca: -614.1,
      procedimentosTotal: 3,
      procedimentosNaoPagos: 1,
    },
    user_id: '1',
  },
  {
    id: '2',
    created_at: '2025-02-03T14:00:00Z',
    file_name: 'demonstrativo_fevereiro_2025.pdf',
    file_type: 'application/pdf',
    hospital: 'Hospital Santa Maria',
    competencia: 'Fevereiro 2025',
    numero: 'DM234567',
    status: 'completo',
    summary: {
      totalCBHPM: 210.5,
      totalPago: 210.5,
      totalDiferenca: 0,
      procedimentosTotal: 1,
      procedimentosNaoPagos: 0,
    },
    user_id: '1',
  },
];

// Generate mock profiles
export const mockProfiles: MockProfile[] = [
  {
    id: '1',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@exemplo.com',
    crm: '12345/SP',
    specialty: 'Cardiologia',
    trial_status: 'active',
    created_at: '2024-12-01T10:00:00Z',
    notification_preferences: {
      email: {
        newReports: true,
        systemUpdates: true,
        tips: false,
        newsletter: false,
      },
      sms: {
        criticalAlerts: true,
        paymentRecovery: false,
        invoiceReminders: true,
      },
      avatar_url: 'https://randomuser.me/api/portraits/men/42.jpg',
    },
  },
];

export const getMockData = () => {
  return {
    procedures: mockProcedures,
    analyses: mockAnalyses,
    profiles: mockProfiles,
  };
};
