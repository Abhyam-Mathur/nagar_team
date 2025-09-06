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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          password: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          password: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          password?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      complaint_status_updates: {
        Row: {
          assigned_contact: string | null
          assigned_to: string | null
          complaint_id: string
          created_at: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Insert: {
          assigned_contact?: string | null
          assigned_to?: string | null
          complaint_id: string
          created_at?: string
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Update: {
          assigned_contact?: string | null
          assigned_to?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
        }
        Relationships: [
          {
            foreignKeyName: "complaint_status_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          assigned_to: string | null
          city: string | null
          complaint_code: string
          created_at: string | null
          description: string | null
          geo_lat: number | null
          geo_lng: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          issue_type: string | null
          location: unknown | null
          media_url: string | null
          priority: string | null
          severity_description: string | null
          state: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          updated_at: string | null
          user_id: string | null
          voice_note_url: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_to?: string | null
          city?: string | null
          complaint_code: string
          created_at?: string | null
          description?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          issue_type?: string | null
          location?: unknown | null
          media_url?: string | null
          priority?: string | null
          severity_description?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          updated_at?: string | null
          user_id?: string | null
          voice_note_url?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          assigned_to?: string | null
          city?: string | null
          complaint_code?: string
          created_at?: string | null
          description?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          issue_type?: string | null
          location?: unknown | null
          media_url?: string | null
          priority?: string | null
          severity_description?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          updated_at?: string | null
          user_id?: string | null
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          complaint_id: string | null
          created_at: string | null
          id: string
          rating: number | null
          review: string | null
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review?: string | null
        }
        Update: {
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_verified: boolean | null
          otp_code: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_verified?: boolean | null
          otp_code: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          otp_code?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          is_active: boolean | null
          password_hash: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          is_active?: boolean | null
          password_hash?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          password: string | null
          phone_number: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          password?: string | null
          phone_number?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string | null
          phone_number?: string | null
          username?: string | null
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string | null
          department: string
          id: string
          status: Database["public"]["Enums"]["worker_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          status?: Database["public"]["Enums"]["worker_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_worker: {
        Args: { issue_type_param: string }
        Returns: string
      }
      create_citizen_account: {
        Args: { p_password: string; p_phone: string }
        Returns: {
          id: string
          username: string
        }[]
      }
      generate_complaint_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_username: {
        Args: Record<PropertyKey, never> | { prefix?: string; tries?: number }
        Returns: string
      }
      login_admin: {
        Args: { p_password: string; p_username: string }
        Returns: string
      }
      login_citizen: {
        Args: { p_password: string; p_username: string }
        Returns: string
      }
    }
    Enums: {
      complaint_status:
        | "Registered"
        | "Assigned"
        | "In-Progress"
        | "Resolved"
        | "Pending"
      user_role: "citizen" | "admin" | "worker"
      worker_status: "available" | "busy" | "offline"
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
      complaint_status: [
        "Registered",
        "Assigned",
        "In-Progress",
        "Resolved",
        "Pending",
      ],
      user_role: ["citizen", "admin", "worker"],
      worker_status: ["available", "busy", "offline"],
    },
  },
} as const
