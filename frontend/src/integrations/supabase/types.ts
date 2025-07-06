export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string;
          created_at: string;
          description: string;
          entity_id: string;
          entity_type: string;
          id: string;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          description: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          description?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      analysis_history: {
        Row: {
          date: string;
          description: string;
          glosados: number | null;
          hospital: string | null;
          id: string;
          procedimentos: number | null;
          status: string;
          type: string;
          user_id: string;
        };
        Insert: {
          date?: string;
          description: string;
          glosados?: number | null;
          hospital?: string | null;
          id?: string;
          procedimentos?: number | null;
          status?: string;
          type: string;
          user_id: string;
        };
        Update: {
          date?: string;
          description?: string;
          glosados?: number | null;
          hospital?: string | null;
          id?: string;
          procedimentos?: number | null;
          status?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      analysis_results: {
        Row: {
          competencia: string | null;
          created_at: string;
          file_name: string;
          file_type: string;
          hospital: string | null;
          id: string;
          numero: string | null;
          status: string;
          summary: Json;
          user_id: string;
        };
        Insert: {
          competencia?: string | null;
          created_at?: string;
          file_name: string;
          file_type: string;
          hospital?: string | null;
          id?: string;
          numero?: string | null;
          status?: string;
          summary?: Json;
          user_id: string;
        };
        Update: {
          competencia?: string | null;
          created_at?: string;
          file_name?: string;
          file_type?: string;
          hospital?: string | null;
          id?: string;
          numero?: string | null;
          status?: string;
          summary?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      cbhpm2015: {
        Row: {
          codigo: string;
          porte: string | null;
          procedimento: string;
          valor_anestesista: number | null;
          valor_aux1: number | null;
          valor_aux2: number | null;
          valor_porte: number | null;
        };
        Insert: {
          codigo: string;
          porte?: string | null;
          procedimento: string;
          valor_anestesista?: number | null;
          valor_aux1?: number | null;
          valor_aux2?: number | null;
          valor_porte?: number | null;
        };
        Update: {
          codigo?: string;
          porte?: string | null;
          procedimento?: string;
          valor_anestesista?: number | null;
          valor_aux1?: number | null;
          valor_aux2?: number | null;
          valor_porte?: number | null;
        };
        Relationships: [];
      };
      CBHPM2015: {
        Row: {
          codigo: number;
          cust_oper: string | null;
          n_aux: string | null;
          porte_anest: string | null;
          porte_cirurgiao: string | null;
          procedimento: string | null;
          valor_anestesista: string | null;
          valor_cirurgiao: string | null;
          valor_primeiro_auxiliar: string | null;
        };
        Insert: {
          codigo: number;
          cust_oper?: string | null;
          n_aux?: string | null;
          porte_anest?: string | null;
          porte_cirurgiao?: string | null;
          procedimento?: string | null;
          valor_anestesista?: string | null;
          valor_cirurgiao?: string | null;
          valor_primeiro_auxiliar?: string | null;
        };
        Update: {
          codigo?: number;
          cust_oper?: string | null;
          n_aux?: string | null;
          porte_anest?: string | null;
          porte_cirurgiao?: string | null;
          procedimento?: string | null;
          valor_anestesista?: string | null;
          valor_cirurgiao?: string | null;
          valor_primeiro_auxiliar?: string | null;
        };
        Relationships: [];
      };
      contestations: {
        Row: {
          created_at: string | null;
          id: string;
          participation_id: string;
          reason_type: string;
          response_text: string;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          participation_id: string;
          reason_type: string;
          response_text: string;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          participation_id?: string;
          reason_type?: string;
          response_text?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contestations_participation_id_fkey';
            columns: ['participation_id'];
            isOneToOne: false;
            referencedRelation: 'procedure_participations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contestations_participation_id_fkey';
            columns: ['participation_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_audit';
            referencedColumns: ['participation_id'];
          },
        ];
      };
      demo_requests: {
        Row: {
          company: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string;
          status: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone: string;
          status?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          status?: string | null;
        };
        Relationships: [];
      };
      demonstrativos: {
        Row: {
          codigo: string;
          created_at: string | null;
          doctor_crm: string;
          guide_number: string;
          id: string;
          papel: string;
          qtd: number | null;
          valor_pago: number | null;
        };
        Insert: {
          codigo: string;
          created_at?: string | null;
          doctor_crm: string;
          guide_number: string;
          id?: string;
          papel: string;
          qtd?: number | null;
          valor_pago?: number | null;
        };
        Update: {
          codigo?: string;
          created_at?: string | null;
          doctor_crm?: string;
          guide_number?: string;
          id?: string;
          papel?: string;
          qtd?: number | null;
          valor_pago?: number | null;
        };
        Relationships: [];
      };
      guides: {
        Row: {
          created_at: string | null;
          execution_date: string;
          file_path: string;
          guide_number: string;
          hospital: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          execution_date: string;
          file_path: string;
          guide_number: string;
          hospital?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          execution_date?: string;
          file_path?: string;
          guide_number?: string;
          hospital?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      help_articles: {
        Row: {
          category: string;
          content: string;
          created_at: string;
          id: string;
          published: boolean;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          content: string;
          created_at?: string;
          id?: string;
          published?: boolean;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content?: string;
          created_at?: string;
          id?: string;
          published?: boolean;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medical_roles: {
        Row: {
          description: string;
          fee_percent: number | null;
          id: number;
          role_name: string;
        };
        Insert: {
          description: string;
          fee_percent?: number | null;
          id?: number;
          role_name: string;
        };
        Update: {
          description?: string;
          fee_percent?: number | null;
          id?: number;
          role_name?: string;
        };
        Relationships: [];
      };
      procedure_participations: {
        Row: {
          doctor_id: string;
          expected_value: number | null;
          id: string;
          procedure_id: string;
          role_name: string;
        };
        Insert: {
          doctor_id: string;
          expected_value?: number | null;
          id?: string;
          procedure_id: string;
          role_name: string;
        };
        Update: {
          doctor_id?: string;
          expected_value?: number | null;
          id?: string;
          procedure_id?: string;
          role_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'procedure_participations_procedure_id_fkey';
            columns: ['procedure_id'];
            isOneToOne: false;
            referencedRelation: 'procedures';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'procedure_participations_role_name_fkey';
            columns: ['role_name'];
            isOneToOne: false;
            referencedRelation: 'medical_roles';
            referencedColumns: ['role_name'];
          },
        ];
      };
      procedure_results: {
        Row: {
          analysis_id: string;
          beneficiario: string | null;
          codigo: string;
          created_at: string | null;
          diferenca: number | null;
          doctors: Json | null;
          guia: string | null;
          id: string;
          pago: boolean | null;
          papel: string | null;
          procedimento: string;
          valor_cbhpm: number | null;
          valor_pago: number | null;
        };
        Insert: {
          analysis_id: string;
          beneficiario?: string | null;
          codigo: string;
          created_at?: string | null;
          diferenca?: number | null;
          doctors?: Json | null;
          guia?: string | null;
          id?: string;
          pago?: boolean | null;
          papel?: string | null;
          procedimento: string;
          valor_cbhpm?: number | null;
          valor_pago?: number | null;
        };
        Update: {
          analysis_id?: string;
          beneficiario?: string | null;
          codigo?: string;
          created_at?: string | null;
          diferenca?: number | null;
          doctors?: Json | null;
          guia?: string | null;
          id?: string;
          pago?: boolean | null;
          papel?: string | null;
          procedimento?: string;
          valor_cbhpm?: number | null;
          valor_pago?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'procedure_results_analysis_id_fkey';
            columns: ['analysis_id'];
            isOneToOne: false;
            referencedRelation: 'analysis_results';
            referencedColumns: ['id'];
          },
        ];
      };
      procedures: {
        Row: {
          codigo: string;
          created_at: string | null;
          descricao: string | null;
          guide_id: string;
          id: string;
          quantidade: number | null;
        };
        Insert: {
          codigo: string;
          created_at?: string | null;
          descricao?: string | null;
          guide_id: string;
          id?: string;
          quantidade?: number | null;
        };
        Update: {
          codigo?: string;
          created_at?: string | null;
          descricao?: string | null;
          guide_id?: string;
          id?: string;
          quantidade?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'procedures_guide_id_fkey';
            columns: ['guide_id'];
            isOneToOne: false;
            referencedRelation: 'guides';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          crm: string;
          email: string;
          id: string;
          name: string;
          notification_preferences: Json | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          reference_tables_preferences: Json | null;
          specialty: string | null;
          trial_end_date: string | null;
          trial_status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          crm: string;
          email: string;
          id: string;
          name: string;
          notification_preferences?: Json | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          reference_tables_preferences?: Json | null;
          specialty?: string | null;
          trial_end_date?: string | null;
          trial_status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          crm?: string;
          email?: string;
          id?: string;
          name?: string;
          notification_preferences?: Json | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          reference_tables_preferences?: Json | null;
          specialty?: string | null;
          trial_end_date?: string | null;
          trial_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      standard_responses: {
        Row: {
          created_at: string | null;
          id: string;
          reason_type: string;
          response_text: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          reason_type: string;
          response_text: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          reason_type?: string;
          response_text?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          sent_by_user: boolean | null;
          ticket_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          sent_by_user?: boolean | null;
          ticket_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          sent_by_user?: boolean | null;
          ticket_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'support_messages_ticket_id_fkey';
            columns: ['ticket_id'];
            isOneToOne: false;
            referencedRelation: 'support_tickets';
            referencedColumns: ['id'];
          },
        ];
      };
      support_tickets: {
        Row: {
          category: string;
          created_at: string | null;
          description: string;
          id: string;
          priority: string;
          status: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description: string;
          id?: string;
          priority: string;
          status?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          priority?: string;
          status?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      uploads: {
        Row: {
          file_name: string;
          file_path: string;
          file_type: string;
          hospital: string | null;
          id: string;
          metadata: Json | null;
          status: string;
          upload_date: string;
          user_id: string;
        };
        Insert: {
          file_name: string;
          file_path: string;
          file_type: string;
          hospital?: string | null;
          id?: string;
          metadata?: Json | null;
          status?: string;
          upload_date?: string;
          user_id: string;
        };
        Update: {
          file_name?: string;
          file_path?: string;
          file_type?: string;
          hospital?: string | null;
          id?: string;
          metadata?: Json | null;
          status?: string;
          upload_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_payment_audit: {
        Row: {
          codigo: string | null;
          difference: number | null;
          doctor_email: string | null;
          expected_value: number | null;
          guide_number: string | null;
          participation_id: string | null;
          procedimento: string | null;
          role_name: string | null;
          valor_pago: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'procedure_participations_role_name_fkey';
            columns: ['role_name'];
            isOneToOne: false;
            referencedRelation: 'medical_roles';
            referencedColumns: ['role_name'];
          },
        ];
      };
    };
    Functions: {
      activate_trial: {
        Args: { user_id: string };
        Returns: Json;
      };
      check_trial_status: {
        Args: { user_id: string };
        Returns: Json;
      };
      get_dashboard_stats: {
        Args: { user_id: string };
        Returns: Json;
      };
      handle_payment_webhook: {
        Args: {
          provider: string;
          event_type: string;
          transaction_id: string;
          status: string;
          payload: Json;
        };
        Returns: Json;
      };
      process_subscription_payment: {
        Args: {
          plan_id: string;
          payment_method_type: Database['public']['Enums']['payment_method_type'];
          payment_details: Json;
          interval_type?: string;
        };
        Returns: Json;
      };
      update_onboarding_status: {
        Args: { completed: boolean };
        Returns: Json;
      };
      verify_crm: {
        Args: { crm_to_verify: string };
        Returns: boolean;
      };
    };
    Enums: {
      payment_method_type: 'credit_card' | 'bank_slip' | 'pix';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      payment_method_type: ['credit_card', 'bank_slip', 'pix'],
    },
  },
} as const;
