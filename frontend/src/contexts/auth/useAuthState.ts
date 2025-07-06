import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types for auth state
interface User {
  id: string;
  email: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener
    const { subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        setSession(newSession as Session);
        setUser(newSession.user as User);
      } else {
        setSession(null);
        setUser(null);
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();

        if (data?.session) {
          setSession(data.session as Session);
          setUser(data.session.user as User);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading, initialized };
}
