import axios from 'axios';

export async function updateProfileREST(data: Record<string, any>): Promise<boolean> {
  try {
    await axios.patch('/api/v1/profile', data);
    return true;
  } catch (err) {
    console.error('Erro ao atualizar perfil REST:', err);
    return false;
  }
}
