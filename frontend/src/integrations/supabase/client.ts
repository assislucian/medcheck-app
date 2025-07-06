// Mock Supabase client for frontend development without a backend

interface MockUser {
  id: string;
  email: string;
}

interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: MockUser;
}

// Placeholder mock data for frontend development
const mockSupabase = {
  from: (table: string) => {
    return {
      select: (columns?: string) => {
        return {
          eq: (column: string, value: any) => {
            // Return mock data depending on the table
            if (table === 'procedures') {
              return {
                data: [
                  {
                    id: '1',
                    analysis_id: '1',
                    codigo: '123456',
                    procedimento: 'Consulta',
                    papel: 'Cirurgião',
                    valor_cbhpm: 100,
                    valor_pago: 80,
                    diferenca: 20,
                    pago: true,
                    guia: 'G123',
                    beneficiario: 'João Silva',
                    doctors: [{ id: '1', name: 'Dr. Smith' }],
                    user_id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                ],
                error: null,
                single: () => ({
                  data: {
                    id: '1',
                    analysis_id: '1',
                    codigo: '123456',
                    procedimento: 'Consulta',
                    papel: 'Cirurgião',
                    valor_cbhpm: 100,
                    valor_pago: 80,
                    diferenca: 20,
                    pago: true,
                    guia: 'G123',
                    beneficiario: 'João Silva',
                    doctors: [{ id: '1', name: 'Dr. Smith' }],
                    user_id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                  error: null,
                }),
                maybeSingle: () => ({
                  data: {
                    id: '1',
                    analysis_id: '1',
                    codigo: '123456',
                    procedimento: 'Consulta',
                    papel: 'Cirurgião',
                    valor_cbhpm: 100,
                    valor_pago: 80,
                    diferenca: 20,
                    pago: true,
                    guia: 'G123',
                    beneficiario: 'João Silva',
                    doctors: [{ id: '1', name: 'Dr. Smith' }],
                    user_id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                  error: null,
                }),
              };
            }
            if (table === 'analysis_results') {
              return {
                data: [
                  {
                    id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                    file_name: 'fatura_janeiro.pdf',
                    file_type: 'application/pdf',
                    hospital: 'Hospital São Lucas',
                    competencia: 'Janeiro 2025',
                    numero: 'F12345',
                    status: 'completo',
                    summary: {
                      totalCBHPM: 1000,
                      totalPago: 800,
                      totalDiferenca: 200,
                      procedimentosTotal: 10,
                      procedimentosNaoPagos: 2,
                    },
                    user_id: '1',
                  },
                ],
                error: null,
                single: () => ({
                  data: {
                    id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                    file_name: 'fatura_janeiro.pdf',
                    file_type: 'application/pdf',
                    hospital: 'Hospital São Lucas',
                    competencia: 'Janeiro 2025',
                    numero: 'F12345',
                    status: 'completo',
                    summary: {
                      totalCBHPM: 1000,
                      totalPago: 800,
                      totalDiferenca: 200,
                      procedimentosTotal: 10,
                      procedimentosNaoPagos: 2,
                    },
                    user_id: '1',
                  },
                  error: null,
                }),
                maybeSingle: () => ({
                  data: {
                    id: '1',
                    created_at: '2025-01-01T12:00:00Z',
                    file_name: 'fatura_janeiro.pdf',
                    file_type: 'application/pdf',
                    hospital: 'Hospital São Lucas',
                    competencia: 'Janeiro 2025',
                    numero: 'F12345',
                    status: 'completo',
                    summary: {
                      totalCBHPM: 1000,
                      totalPago: 800,
                      totalDiferenca: 200,
                      procedimentosTotal: 10,
                      procedimentosNaoPagos: 2,
                    },
                    user_id: '1',
                  },
                  error: null,
                }),
              };
            }
            if (table === 'profiles') {
              return {
                data: [
                  {
                    id: '1',
                    name: 'Dr. John Doe',
                    email: 'john@example.com',
                    crm: '12345/SP',
                    specialty: 'Cardiologia',
                    trial_status: 'active',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                ],
                error: null,
                single: () => ({
                  data: {
                    id: '1',
                    name: 'Dr. John Doe',
                    email: 'john@example.com',
                    crm: '12345/SP',
                    specialty: 'Cardiologia',
                    trial_status: 'active',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                  error: null,
                }),
                maybeSingle: () => ({
                  data: {
                    id: '1',
                    name: 'Dr. John Doe',
                    email: 'john@example.com',
                    crm: '12345/SP',
                    specialty: 'Cardiologia',
                    trial_status: 'active',
                    created_at: '2025-01-01T12:00:00Z',
                  },
                  error: null,
                }),
              };
            }
            return {
              data: [],
              error: null,
            };
          },
          order: () => ({
            data: [],
            error: null,
          }),
          range: () => ({
            data: [],
            error: null,
          }),
          limit: () => ({
            data: [],
            error: null,
          }),
        };
      },
      insert: (data: any) => {
        return {
          select: () => ({
            data: [
              {
                ...data,
                id: 'new-id-' + Math.random().toString(36).substring(7),
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        };
      },
      update: (data: any) => {
        return {
          eq: () => ({
            data: [
              {
                ...data,
                updated_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        };
      },
      delete: () => {
        return {
          eq: () => ({
            data: [],
            error: null,
          }),
        };
      },
    };
  },
  rpc: (func: string, params?: any) => {
    return {
      data: { result: true },
      error: null,
    };
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => ({
        data: { path },
        error: null,
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` },
        error: null,
      }),
      remove: (paths: string[]) => ({
        data: { deleted: paths },
        error: null,
      }),
      download: (path: string) => ({
        data: new Blob(['mock file content']),
        error: null,
      }),
    }),
  },
  auth: {
    getUser: () =>
      Promise.resolve({
        data: {
          user: {
            id: '1',
            email: 'user@example.com',
          },
        },
        error: null,
      }),
    getSession: () =>
      Promise.resolve({
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: '1',
              email: 'user@example.com',
            },
          },
        },
        error: null,
      }),
    onAuthStateChange: (callback: Function) => {
      callback('SIGNED_IN', {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '1',
          email: 'user@example.com',
        },
      });
      return {
        subscription: {
          unsubscribe: () => {},
        },
      };
    },
    signUp: ({ email, password }: { email: string; password: string }) => {
      return Promise.resolve({
        data: {
          user: {
            id: '1',
            email,
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: '1',
              email,
            },
          },
        },
        error: null,
      });
    },
    signInWithPassword: ({ email, password }: { email: string; password: string }) => {
      return Promise.resolve({
        data: {
          user: {
            id: '1',
            email,
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: '1',
              email,
            },
          },
        },
        error: null,
      });
    },
    signInWithOAuth: ({ provider }: { provider: string }) => {
      return Promise.resolve({
        data: {
          provider,
          url: `https://example.com/oauth/${provider}`,
        },
        error: null,
      });
    },
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: (email: string) => Promise.resolve({ error: null }),
    updateUser: (data: any) =>
      Promise.resolve({
        data: { user: { ...data, id: '1' } },
        error: null,
      }),
    exchangeCodeForSession: (code: string) => Promise.resolve({ error: null }),
  },
};

export const supabase = mockSupabase;
export type SupabaseClient = typeof mockSupabase;
