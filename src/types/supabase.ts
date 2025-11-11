export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      app_clients: {
        Row: {
          account_manager: string | null;
          billing_day: number | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          internal_notes: string | null;
          invited_email: string | null;
          last_meeting_at: string | null;
          main_channel: string | null;
          monthly_ticket: number | null;
          name: string;
          next_delivery: string | null;
          org_id: string;
          owner_user_id: string | null;
          payment_method: string | null;
          payment_status: string | null;
          plan: string | null;
          progress: number | null;
          start_date: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_manager?: string | null;
          billing_day?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          internal_notes?: string | null;
          invited_email?: string | null;
          last_meeting_at?: string | null;
          main_channel?: string | null;
          monthly_ticket?: number | null;
          name: string;
          next_delivery?: string | null;
          org_id: string;
          owner_user_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          plan?: string | null;
          progress?: number | null;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_manager?: string | null;
          billing_day?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          internal_notes?: string | null;
          invited_email?: string | null;
          last_meeting_at?: string | null;
          main_channel?: string | null;
          monthly_ticket?: number | null;
          name?: string;
          next_delivery?: string | null;
          org_id?: string;
          owner_user_id?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          plan?: string | null;
          progress?: number | null;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_clients_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      app_client_users: {
        Row: {
          client_id: string;
          created_at: string | null;
          user_id: string;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          user_id: string;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_client_users_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
        ];
      };
      app_content_calendar: {
        Row: {
          channel: string;
          client_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          event_date: string | null;
          id: string;
          notes: string | null;
          org_id: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          channel: string;
          client_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          notes?: string | null;
          org_id?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          channel?: string;
          client_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          notes?: string | null;
          org_id?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      app_branding: {
        Row: {
          archetype: Json | null;
          client_id: string;
          created_at: string | null;
          font_stack: Json | null;
          id: string;
          palette: Json | null;
          references: Json | null;
          tone_of_voice: Json | null;
          updated_at: string | null;
        };
        Insert: {
          archetype?: Json | null;
          client_id: string;
          created_at?: string | null;
          font_stack?: Json | null;
          id?: string;
          palette?: Json | null;
          references?: Json | null;
          tone_of_voice?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          archetype?: Json | null;
          client_id?: string;
          created_at?: string | null;
          font_stack?: Json | null;
          id?: string;
          palette?: Json | null;
          references?: Json | null;
          tone_of_voice?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_branding_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: true;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
        ];
      };
      app_media_folders: {
        Row: {
          client_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          org_id: string | null;
          owner_user_id: string | null;
          parent_folder: string | null;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          org_id?: string | null;
          owner_user_id?: string | null;
          parent_folder?: string | null;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          org_id?: string | null;
          owner_user_id?: string | null;
          parent_folder?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_media_folders_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_media_folders_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      app_media_items: {
        Row: {
          client_id: string | null;
          created_at: string;
          created_by: string | null;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          folder: string;
          id: string;
          org_id: string | null;
          subfolder: string | null;
          title: string | null;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_path: string;
          file_size?: number | null;
          file_type?: string | null;
          folder: string;
          id?: string;
          org_id?: string | null;
          subfolder?: string | null;
          title?: string | null;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_path?: string;
          file_size?: number | null;
          file_type?: string | null;
          folder?: string;
          id?: string;
          org_id?: string | null;
          subfolder?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_media_items_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_media_items_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      app_members: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          invited_email: string | null;
          joined_at: string | null;
          org_id: string;
          role: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          invited_email?: string | null;
          joined_at?: string | null;
          org_id: string;
          role?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          invited_email?: string | null;
          joined_at?: string | null;
          org_id?: string;
          role?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      app_invitations: {
        Row: {
          accepted_at: string | null;
          client_id: string | null;
          created_at: string | null;
          created_by: string;
          email: string;
          expires_at: string | null;
          full_name: string | null;
          id: string;
          org_id: string;
          role: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          created_by: string;
          email: string;
          expires_at?: string | null;
          full_name?: string | null;
          id?: string;
          org_id: string;
          role: string;
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          created_by?: string;
          email?: string;
          expires_at?: string | null;
          full_name?: string | null;
          id?: string;
          org_id?: string;
          role?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_invitations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_invitations_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
      app_orgs: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner_user_id: string | null;
          slug: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          owner_user_id?: string | null;
          slug?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner_user_id?: string | null;
          slug?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      app_tasks: {
        Row: {
          assigned_to: string | null;
          client_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          org_id: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
          urgency: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          org_id?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
          urgency?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          org_id?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
          urgency?: string | null;
        };
        Relationships: [];
      };
      app_payments: {
        Row: {
          amount: number | null;
          client_id: string;
          created_at: string | null;
          created_by: string | null;
          id: string;
          method: string | null;
          notes: string | null;
          org_id: string;
          paid_at: string | null;
        };
        Insert: {
          amount?: number | null;
          client_id: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          method?: string | null;
          notes?: string | null;
          org_id: string;
          paid_at?: string | null;
        };
        Update: {
          amount?: number | null;
          client_id?: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          method?: string | null;
          notes?: string | null;
          org_id?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_payments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "app_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_payments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      app_content_calendar_view: {
        Row: {
          channel: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          id: string | null;
          notes: string | null;
          org_id: string | null;
          title: string | null;
        };
        Insert: {
          channel?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          id?: string | null;
          notes?: string | null;
          org_id?: string | null;
          title?: string | null;
        };
        Update: {
          channel?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          id?: string | null;
          notes?: string | null;
          org_id?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      org_client_stats_view: {
        Row: {
          ativos: number | null;
          id: string | null;
          media_progresso: number | null;
          onboarding: number | null;
          org_id: string | null;
          pausados: number | null;
          total: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_clients_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "app_orgs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      fn_ensure_owner_org: {
        Args: { p_name?: string; p_user_id: string };
        Returns: string;
      };
      get_current_org_id: { Args: never; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
