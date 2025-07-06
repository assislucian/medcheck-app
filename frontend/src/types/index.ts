import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

export interface Profile {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty?: string;
  notification_preferences?: Json;
  reference_tables_preferences?: Json;
  trial_status: 'not_started' | 'active' | 'expired';
  trial_end_date?: string;
  updated_at?: string;
  created_at?: string;
}

// Extension of the Profile interface that includes UUID type for ID
// to be used with Supabase queries
export interface ProfileWithUUID extends Omit<Profile, 'id'> {
  id: unknown; // This allows the Supabase UUID type to be used
}

export type ExtractedData = {
  id: string;
  procedures: Array<{
    id: string;
    codigo: string;
    procedimento: string;
    papel?: string;
    valorCBHPM: number;
    valorPago: number;
    diferenca: number;
    pago: boolean;
    guia?: string;
    beneficiario?: string;
    doctors?: any[];
  }>;
};

export type HelpArticle = Database['public']['Tables']['help_articles']['Row'];

// Use explicit re-exports to avoid ambiguity with DoctorParticipation
export * from './upload';

// Re-export everything except DoctorParticipation from medical
// since it's already exported from upload
export type {
  Procedure,
  PaymentStatement,
  GuideData,
  DemonstrativeData,
} from './medical';
