export interface ReferenceTable {
  id: string;
  name: string;
  description?: string;
  category: 'table' | 'role';
  checked?: boolean;
}

export const medicalReferenceTables: ReferenceTable[] = [
  // AMB Tables
  {
    id: 'amb-90',
    name: 'AMB 90',
    description: 'Associação Médica Brasileira',
    category: 'table',
    checked: false,
  },
  {
    id: 'amb-92',
    name: 'AMB 92',
    description: 'Associação Médica Brasileira',
    category: 'table',
    checked: true,
  },
  {
    id: 'amb-96',
    name: 'AMB 96',
    description: 'Associação Médica Brasileira',
    category: 'table',
    checked: false,
  },
  {
    id: 'amb-99',
    name: 'AMB 99',
    description: 'Associação Médica Brasileira',
    category: 'table',
    checked: false,
  },

  // CBHPM and Other Standard Tables
  {
    id: 'brasindice',
    name: 'Brasíndice',
    description: 'Índice Brasileiro de Preços de Medicamentos e Produtos Hospitalares',
    category: 'table',
    checked: false,
  },
  {
    id: 'cbhpm',
    name: 'CBHPM',
    description: 'Classificação Brasileira Hierarquizada de Procedimentos Médicos',
    category: 'table',
    checked: true,
  },
  {
    id: 'ciefas-93',
    name: 'CIEFAS 93',
    description: 'Comitê de Integração de Entidades Fechadas de Assistência à Saúde',
    category: 'table',
    checked: false,
  },
  {
    id: 'ciefas-2000',
    name: 'CIEFAS 2000',
    description: 'Comitê de Integração de Entidades Fechadas de Assistência à Saúde',
    category: 'table',
    checked: false,
  },
  {
    id: 'ans-rol',
    name: 'ANS - Rol de Procedimentos',
    description: 'Tabela de procedimentos da Agência Nacional de Saúde Suplementar',
    category: 'table',
    checked: false,
  },

  // SUS Tables
  {
    id: 'sus-ambulatorial',
    name: 'SUS Ambulatorial',
    description: 'Tabela de procedimentos ambulatoriais SUS',
    category: 'table',
    checked: false,
  },
  {
    id: 'sus-hospitalar',
    name: 'SUS Hospitalar',
    description: 'Tabela de procedimentos hospitalares SUS',
    category: 'table',
    checked: false,
  },

  // Other Official Tables
  {
    id: 'simpro',
    name: 'SIMPRO',
    description: 'Instituto Brasileiro para Simplificação de Procedimentos Mercantis',
    category: 'table',
    checked: false,
  },
  {
    id: 'tunep',
    name: 'TUNEP',
    description: 'Tabela Única Nacional de Equivalência de Procedimentos',
    category: 'table',
    checked: false,
  },
  {
    id: 'vrpo',
    name: 'VRPO',
    description: 'Valores Referenciais para Procedimentos Odontológicos',
    category: 'table',
    checked: false,
  },
  {
    id: 'uniodonto',
    name: 'Uniodonto',
    description: 'Tabela de Intercâmbio Sistema Uniodonto',
    category: 'table',
    checked: false,
  },

  // TUSS Tables
  {
    id: 'tuss-medicos',
    name: 'TUSS - Procedimentos Médicos',
    description: 'Terminologia Unificada da Saúde Suplementar - Procedimentos Médicos',
    category: 'table',
    checked: true,
  },
  {
    id: 'tuss-odontologicos',
    name: 'TUSS - Procedimentos Odontológicos',
    description:
      'Terminologia Unificada da Saúde Suplementar - Procedimentos Odontológicos',
    category: 'table',
    checked: false,
  },
  {
    id: 'tuss-hospitalares',
    name: 'TUSS - Taxas hospitalares',
    description: 'Terminologia Unificada da Saúde Suplementar - Taxas hospitalares',
    category: 'table',
    checked: false,
  },
  {
    id: 'tuss-materiais',
    name: 'TUSS - Materiais',
    description: 'Terminologia Unificada da Saúde Suplementar - Materiais',
    category: 'table',
    checked: true,
  },
  {
    id: 'tuss-medicamentos',
    name: 'TUSS - Medicamentos',
    description: 'Terminologia Unificada da Saúde Suplementar - Medicamentos',
    category: 'table',
    checked: false,
  },
  {
    id: 'tuss-outras',
    name: 'TUSS - Outras áreas da saúde',
    description: 'Terminologia Unificada da Saúde Suplementar - Outras áreas da saúde',
    category: 'table',
    checked: false,
  },
  {
    id: 'tuss-eventos',
    name: 'TUSS - Procedimentos e eventos em saúde',
    description:
      'Terminologia Unificada da Saúde Suplementar - Procedimentos e eventos em saúde',
    category: 'table',
    checked: false,
  },

  // Custom Tables
  {
    id: 'materiais-especiais',
    name: 'Tabela de Materiais Especiais',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-nao-medicos',
    name: 'Tabela Própria Procedimentos não médicos',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-odontologico',
    name: 'Tabela Própria Pacote Odontológico',
    category: 'table',
    checked: false,
  },
  {
    id: 'provisoria-tuss',
    name: 'Tabela provisória TUSS',
    category: 'table',
    checked: false,
  },
  {
    id: 'provisoria-tuss-odonto',
    name: 'Tabela provisória TUSS - Procedimentos Odontológicos',
    category: 'table',
    checked: false,
  },
  {
    id: 'provisoria-tuss-medicos',
    name: 'Tabela Provisória TUSS - Procedimentos Médicos',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-materiais',
    name: 'Tabela Própria Materiais',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-medicamentos',
    name: 'Tabela Própria Medicamentos',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-pacotes',
    name: 'Tabela Própria de Pacotes',
    category: 'table',
    checked: false,
  },
  {
    id: 'propria-operadoras',
    name: 'Tabela Própria das Operadoras',
    category: 'table',
    checked: false,
  },
];

export const medicalRoles: ReferenceTable[] = [
  {
    id: 'cirurgiao',
    name: 'Cirurgião',
    description: 'Médico responsável principal pelo procedimento',
    category: 'role',
    checked: true,
  },
  {
    id: 'anestesista',
    name: 'Anestesista',
    description: 'Médico responsável pela anestesia',
    category: 'role',
    checked: true,
  },
  {
    id: 'primeiro-auxiliar',
    name: 'Primeiro Auxiliar',
    description: 'Primeiro auxiliar do cirurgião',
    category: 'role',
    checked: true,
  },
  {
    id: 'segundo-auxiliar',
    name: 'Segundo Auxiliar',
    description: 'Segundo auxiliar do cirurgião',
    category: 'role',
    checked: true,
  },
  {
    id: 'terceiro-auxiliar',
    name: 'Terceiro Auxiliar',
    description: 'Terceiro auxiliar do cirurgião',
    category: 'role',
    checked: false,
  },
  {
    id: 'instrumentador',
    name: 'Instrumentador',
    description: 'Profissional responsável pelos instrumentos cirúrgicos',
    category: 'role',
    checked: false,
  },
  {
    id: 'perfusionista',
    name: 'Perfusionista',
    description: 'Profissional que opera a circulação extracorpórea',
    category: 'role',
    checked: false,
  },
  {
    id: 'assistente',
    name: 'Assistente',
    description: 'Médico que assiste o procedimento',
    category: 'role',
    checked: false,
  },
  {
    id: 'consultor',
    name: 'Consultor',
    description: 'Médico consultado durante o procedimento',
    category: 'role',
    checked: false,
  },
];
