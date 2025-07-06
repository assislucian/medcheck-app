import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type TrialStatus = 'not_started' | 'active' | 'expired' | 'loading' | 'error';

interface TrialResponse {
  status: string;
  end_date: string | null;
}

export function useTrialStatus() {
  const [status, setStatus] = useState<TrialStatus>('loading');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user) {
        setIsLoading(false);
        setStatus('not_started');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_trial_status', {
          user_id: user.id,
        });

        if (error) {
          throw error;
        }

        // Properly type cast the data
        const trialData = data as unknown as TrialResponse;

        setStatus(trialData.status as TrialStatus);

        if (trialData.end_date) {
          setEndDate(new Date(trialData.end_date));
        } else {
          setEndDate(null);
        }
      } catch (err) {
        console.error('Error checking trial status:', err);
        setError(err as Error);
        setStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkTrialStatus();
  }, [user]);

  return {
    status,
    endDate,
    isLoading,
    error,
    isActive: status === 'active',
    isExpired: status === 'expired',
    isNotStarted: status === 'not_started',
  };
}
