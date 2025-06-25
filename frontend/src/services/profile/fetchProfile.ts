import axios from 'axios';

export interface ProfileResponse {
  crm: string;
  uf: string;
  nome: string;
  email?: string;
  specialty?: string;
  hospital?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
}

export async function fetchProfileREST(): Promise<ProfileResponse | null> {
  try {
    const res = await axios.get<ProfileResponse>('/api/v1/profile');
    return res.data;
  } catch (err) {
    console.error('Erro ao buscar perfil REST:', err);
    return null;
  }
}
