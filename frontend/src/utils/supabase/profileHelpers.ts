import { Profile } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export async function getProfileData(userId: string): Promise<Profile | null> {
  try {
    console.log('Fetching profile data for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    console.log('Profile data retrieved successfully');
    return data as Profile;
  } catch (error) {
    console.error('Exception in getProfileData:', error);
    return null;
  }
}

export async function updateProfile(
  supabaseClient: any,
  userId: string,
  data: ProfileUpdatePayload
) {
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

export type ProfileUpdatePayload = {
  name?: string;
  email?: string;
  crm?: string;
  specialty?: string;
  notification_preferences?: any;
  reference_tables_preferences?: any;
  updated_at?: string;
};
