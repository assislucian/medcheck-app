/**
 * use-profile-notifications.ts
 *
 * Custom hook para gerenciar as preferências de notificação do usuário.
 * Permite atualizar configurações de notificações por email e SMS.
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { getProfile, updateProfile } from '@/utils/supabase';

/**
 * Interface que define a estrutura das preferências de notificação
 */
interface NotificationPreferences {
  email: {
    newReports: boolean; // Notificação de novos relatórios
    systemUpdates: boolean; // Atualizações do sistema
    tips: boolean; // Dicas e sugestões
    newsletter: boolean; // Newsletter periódica
  };
  sms: {
    criticalAlerts: boolean; // Alertas críticos
    paymentRecovery: boolean; // Recuperação de pagamentos
    invoiceReminders: boolean; // Lembretes de fatura
  };
}

/**
 * Hook que fornece funcionalidades para gerenciar preferências de notificação
 * @returns Objeto com estados e funções para manipulação de preferências
 */
export const useProfileNotifications = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Atualiza as preferências de notificação do usuário
   * @param preferences Novas preferências de notificação
   * @returns Boolean indicando sucesso ou falha
   */
  const updateNotificationPreferences = async (
    preferences: NotificationPreferences
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Não autenticado');
      }

      // Obtém dados atuais do perfil
      const profileData = await getProfile(supabase, session.user.id);

      // Merge notification preferences properly
      const currentNotificationPrefs =
        profileData &&
        profileData.notification_preferences &&
        typeof profileData.notification_preferences === 'object'
          ? profileData.notification_preferences
          : {};

      // Create a new object by copying existing properties safely
      const prefJson: Record<string, any> = {};

      // Only copy if it's a valid object
      if (
        typeof currentNotificationPrefs === 'object' &&
        currentNotificationPrefs !== null
      ) {
        Object.entries(currentNotificationPrefs as Record<string, any>).forEach(
          ([key, value]) => {
            prefJson[key] = value;
          }
        );
      }

      // Add the new preferences
      prefJson.email = preferences.email;
      prefJson.sms = preferences.sms;

      // Atualiza o perfil com as novas preferências
      const success = await updateProfile(supabase, session.user.id, {
        notification_preferences: prefJson as Json,
      });

      if (!success) {
        throw new Error('Erro ao atualizar preferências');
      }

      // Notifica o usuário sobre o sucesso
      toast.success('Preferências atualizadas', {
        description: 'Suas preferências de notificação foram atualizadas com sucesso.',
      });

      return true;
    } catch (error) {
      // Notifica o usuário sobre o erro
      toast.error('Erro ao atualizar preferências', {
        description: 'Não foi possível atualizar suas preferências. Tente novamente.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateNotificationPreferences,
  };
};
