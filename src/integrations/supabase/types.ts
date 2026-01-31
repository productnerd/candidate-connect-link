export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          size_category: Database["public"]["Enums"]["organization_size"] | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          size_category?:
            | Database["public"]["Enums"]["organization_size"]
            | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          size_category?:
            | Database["public"]["Enums"]["organization_size"]
            | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_bundles: {
        Row: {
          amount_paid: number
          bundle_type: Database["public"]["Enums"]["bundle_type"]
          created_at: string | null
          expires_at: string | null
          id: string
          organization_id: string
          purchased_at: string | null
          stripe_payment_id: string | null
          tests_purchased: number
          tests_remaining: number
        }
        Insert: {
          amount_paid?: number
          bundle_type: Database["public"]["Enums"]["bundle_type"]
          created_at?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          purchased_at?: string | null
          stripe_payment_id?: string | null
          tests_purchased: number
          tests_remaining: number
        }
        Update: {
          amount_paid?: number
          bundle_type?: Database["public"]["Enums"]["bundle_type"]
          created_at?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          purchased_at?: string | null
          stripe_payment_id?: string | null
          tests_purchased?: number
          tests_remaining?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_bundles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_invitations: {
        Row: {
          candidate_email: string
          candidate_name: string | null
          company_logo_url: string | null
          company_name: string | null
          completed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          inviter_email: string | null
          inviter_name: string | null
          organization_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["invitation_status"] | null
          test_id: string
          test_type: string | null
        }
        Insert: {
          candidate_email: string
          candidate_name?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          inviter_email?: string | null
          inviter_name?: string | null
          organization_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          test_id: string
          test_type?: string | null
        }
        Update: {
          candidate_email?: string
          candidate_name?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          inviter_email?: string | null
          inviter_name?: string | null
          organization_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          test_id?: string
          test_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_library"
            referencedColumns: ["id"]
          },
        ]
      }
      test_library: {
        Row: {
          category: Database["public"]["Enums"]["test_category"]
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          question_count: number
          recommended_for: Json | null
          requires_proctoring: boolean | null
          slug: string
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["test_category"]
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          question_count?: number
          recommended_for?: Json | null
          requires_proctoring?: boolean | null
          slug: string
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["test_category"]
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          question_count?: number
          recommended_for?: Json | null
          requires_proctoring?: boolean | null
          slug?: string
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_number: number
          points: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          test_id: string
          time_limit_seconds: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_number: number
          points?: number | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          test_id: string
          time_limit_seconds?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_number?: number
          points?: number | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          test_id?: string
          time_limit_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_library"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          candidate_email: string
          category_scores: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          invitation_id: string | null
          organization_id: string | null
          percentage: number
          percentile: number | null
          question_breakdown: Json | null
          score: number
          session_id: string
          test_id: string
          time_taken_seconds: number | null
        }
        Insert: {
          candidate_email: string
          category_scores?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          organization_id?: string | null
          percentage: number
          percentile?: number | null
          question_breakdown?: Json | null
          score: number
          session_id: string
          test_id: string
          time_taken_seconds?: number | null
        }
        Update: {
          candidate_email?: string
          category_scores?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          organization_id?: string | null
          percentage?: number
          percentile?: number | null
          question_breakdown?: Json | null
          score?: number
          session_id?: string
          test_id?: string
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "test_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_library"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          answers: Json | null
          candidate_id: string | null
          created_at: string | null
          current_question_index: number | null
          end_time: string | null
          id: string
          invitation_id: string | null
          ip_address: string | null
          proctoring_consent_given: boolean | null
          proctoring_enabled: boolean | null
          session_type: string
          start_time: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          test_id: string
          time_remaining_seconds: number | null
          user_agent: string | null
        }
        Insert: {
          answers?: Json | null
          candidate_id?: string | null
          created_at?: string | null
          current_question_index?: number | null
          end_time?: string | null
          id?: string
          invitation_id?: string | null
          ip_address?: string | null
          proctoring_consent_given?: boolean | null
          proctoring_enabled?: boolean | null
          session_type?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          test_id: string
          time_remaining_seconds?: number | null
          user_agent?: string | null
        }
        Update: {
          answers?: Json | null
          candidate_id?: string | null
          created_at?: string | null
          current_question_index?: number | null
          end_time?: string | null
          id?: string
          invitation_id?: string | null
          ip_address?: string | null
          proctoring_consent_given?: boolean | null
          proctoring_enabled?: boolean | null
          session_type?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          test_id?: string
          time_remaining_seconds?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "test_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_library"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_candidate_cooldown: {
        Args: { recipient_email: string; sender_email: string }
        Returns: boolean
      }
      check_sender_daily_limit: {
        Args: { sender_email: string }
        Returns: boolean
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_candidate: { Args: { _user_id: string }; Returns: boolean }
      is_employer: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      bundle_type: "starter" | "professional" | "enterprise"
      invitation_status: "pending" | "started" | "completed" | "expired"
      organization_size: "startup" | "smb" | "midmarket" | "enterprise"
      question_type: "multiple_choice" | "true_false" | "short_answer"
      session_status: "in_progress" | "completed" | "abandoned"
      test_category: "cognitive" | "personality" | "skills" | "situational"
      user_role: "employer" | "candidate" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bundle_type: ["starter", "professional", "enterprise"],
      invitation_status: ["pending", "started", "completed", "expired"],
      organization_size: ["startup", "smb", "midmarket", "enterprise"],
      question_type: ["multiple_choice", "true_false", "short_answer"],
      session_status: ["in_progress", "completed", "abandoned"],
      test_category: ["cognitive", "personality", "skills", "situational"],
      user_role: ["employer", "candidate", "admin"],
    },
  },
} as const
