/**
 * use-profile-security.ts
 *
 * Custom hook para gerenciar as configurações de segurança do usuário.
 * Permite atualizar senha e outras configurações de segurança.
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Interface que define a estrutura dos dados de segurança
 */
interface SecurityData {
  currentPassword: string; // Senha atual
  newPassword: string; // Nova senha
  confirmPassword: string; // Confirmação da nova senha
}

/**
 * Hook que fornece funcionalidades para gerenciar segurança do perfil
 * @returns Objeto com estados e funções para manipulação de segurança
 */
export const useProfileSecurity = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Atualiza a senha do usuário
   * @param data Dados de segurança com senhas atual e nova
   * @returns Boolean indicando sucesso ou falha
   */
  const updateSecurity = async (data: SecurityData): Promise<boolean> => {
    setLoading(true);
    try {
      // Verifica se as senhas novas conferem
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('As senhas não conferem');
      }

      // Atualiza a senha usando a API do Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      // Notifica o usuário sobre o sucesso
      toast.success('Senha atualizada', {
        description: 'Sua senha foi atualizada com sucesso.',
      });

      return true;
    } catch (error) {
      // Notifica o usuário sobre o erro
      toast.error('Erro ao atualizar senha', {
        description:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao atualizar sua senha',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateSecurity,
  };
};
