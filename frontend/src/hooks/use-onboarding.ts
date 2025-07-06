/**
 * use-onboarding.ts
 *
 * Custom hook que gerencia o estado de onboarding do usuário.
 * Controla a exibição do tour guiado e gerencia o status de onboarding no Supabase.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  /**
   * Efeito que verifica se o tour deve ser mostrado com base no estado de URL
   * ou no status de onboarding do usuário no banco de dados.
   */
  useEffect(() => {
    // Verifica se há um parâmetro na URL indicando para iniciar o tour
    const state = location.state as { startTour?: boolean } | null;
    if (state?.startTour) {
      setShowTour(true);
      return;
    }

    // Verifica o status de onboarding no banco de dados para o usuário atual
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        // Busca o status de onboarding do usuário no Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Atualiza o estado com base no valor do banco de dados
        setOnboardingCompleted(!!data?.onboarding_completed);

        // Mostra o tour se o usuário não completou o onboarding
        if (!data?.onboarding_completed) {
          setShowTour(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [location, user]);

  /**
   * Atualiza o status de onboarding no banco de dados
   * @param completed - Indica se o onboarding foi completado
   */
  const updateOnboardingStatus = async (completed: boolean) => {
    if (!user) return;

    try {
      // Utiliza a função RPC definida no Supabase para atualizar o status
      const { data, error } = await supabase.rpc('update_onboarding_status', {
        completed,
      });

      if (error) throw error;

      setOnboardingCompleted(completed);
      return data;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };

  /**
   * Marca o tour como completo e opcionalmente atualiza o status no banco
   * @param dontShowAgain - Se verdadeiro, atualiza o status no banco
   */
  const completeTour = async (dontShowAgain = false) => {
    if (dontShowAgain) {
      await updateOnboardingStatus(true);
    }
    setShowTour(false);
  };

  /**
   * Pula o tour e opcionalmente atualiza o status no banco
   * @param dontShowAgain - Se verdadeiro, atualiza o status no banco
   */
  const skipTour = async (dontShowAgain = false) => {
    if (dontShowAgain) {
      await updateOnboardingStatus(true);
    }
    setShowTour(false);
  };

  /**
   * Reinicia o tour, definindo o status de onboarding como false
   */
  const resetTour = () => {
    updateOnboardingStatus(false);
    setShowTour(true);
  };

  return {
    showTour,
    onboardingCompleted,
    updateOnboardingStatus,
    completeTour,
    skipTour,
    resetTour,
  };
}
