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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          accent: string
          branch_slug: string | null
          created_at: string
          description: string | null
          estimated_hours: number
          id: string
          is_published: boolean
          level: Database["public"]["Enums"]["difficulty"]
          order_index: number
          slug: string
          summary: string | null
          tags: string[]
          title: string
          track: Database["public"]["Enums"]["track_kind"]
          updated_at: string
        }
        Insert: {
          accent?: string
          branch_slug?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number
          id?: string
          is_published?: boolean
          level?: Database["public"]["Enums"]["difficulty"]
          order_index?: number
          slug: string
          summary?: string | null
          tags?: string[]
          title: string
          track?: Database["public"]["Enums"]["track_kind"]
          updated_at?: string
        }
        Update: {
          accent?: string
          branch_slug?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number
          id?: string
          is_published?: boolean
          level?: Database["public"]["Enums"]["difficulty"]
          order_index?: number
          slug?: string
          summary?: string | null
          tags?: string[]
          title?: string
          track?: Database["public"]["Enums"]["track_kind"]
          updated_at?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          created_at: string
          description: string | null
          est_minutes: number
          id: string
          is_active: boolean
          order_index: number
          slug: string
          title: string
          track: Database["public"]["Enums"]["track_kind"]
          xp: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          est_minutes?: number
          id?: string
          is_active?: boolean
          order_index?: number
          slug: string
          title: string
          track?: Database["public"]["Enums"]["track_kind"]
          xp?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          est_minutes?: number
          id?: string
          is_active?: boolean
          order_index?: number
          slug?: string
          title?: string
          track?: Database["public"]["Enums"]["track_kind"]
          xp?: number
        }
        Relationships: []
      }
      dsa_problems: {
        Row: {
          created_at: string
          hint: string | null
          id: string
          level: Database["public"]["Enums"]["difficulty"]
          order_index: number
          pattern: string | null
          slug: string
          statement: string
          title: string
          topic: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          level?: Database["public"]["Enums"]["difficulty"]
          order_index?: number
          pattern?: string | null
          slug: string
          statement?: string
          title: string
          topic: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          level?: Database["public"]["Enums"]["difficulty"]
          order_index?: number
          pattern?: string | null
          slug?: string
          statement?: string
          title?: string
          topic?: string
        }
        Relationships: []
      }
      dsa_progress: {
        Row: {
          id: string
          notes: string | null
          problem_id: string
          status: Database["public"]["Enums"]["dsa_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          problem_id: string
          status?: Database["public"]["Enums"]["dsa_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          problem_id?: string
          status?: Database["public"]["Enums"]["dsa_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "dsa_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          lesson_id: string
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          lesson_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          lesson_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_md: string
          created_at: string
          est_minutes: number
          id: string
          kind: string
          module_id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          content_md?: string
          created_at?: string
          est_minutes?: number
          id?: string
          kind?: string
          module_id: string
          order_index?: number
          slug: string
          title: string
        }
        Update: {
          content_md?: string
          created_at?: string
          est_minutes?: number
          id?: string
          kind?: string
          module_id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_index: number
          summary: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_index?: number
          summary?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_year: number | null
          avatar_url: string | null
          bio: string | null
          branch_slug: string | null
          career_goal: string | null
          college: string | null
          created_at: string
          full_name: string | null
          id: string
          last_active_date: string | null
          onboarding_completed: boolean
          show_branch: boolean
          show_progress: boolean
          streak_count: number
          updated_at: string
          visibility: Database["public"]["Enums"]["profile_visibility"]
          xp: number
        }
        Insert: {
          academic_year?: number | null
          avatar_url?: string | null
          bio?: string | null
          branch_slug?: string | null
          career_goal?: string | null
          college?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          last_active_date?: string | null
          onboarding_completed?: boolean
          show_branch?: boolean
          show_progress?: boolean
          streak_count?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          xp?: number
        }
        Update: {
          academic_year?: number | null
          avatar_url?: string | null
          bio?: string | null
          branch_slug?: string | null
          career_goal?: string | null
          college?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_active_date?: string | null
          onboarding_completed?: boolean
          show_branch?: boolean
          show_progress?: boolean
          streak_count?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          xp?: number
        }
        Relationships: []
      }
      roadmap_steps: {
        Row: {
          course_slug: string | null
          description: string | null
          id: string
          order_index: number
          roadmap_id: string
          title: string
        }
        Insert: {
          course_slug?: string | null
          description?: string | null
          id?: string
          order_index?: number
          roadmap_id: string
          title: string
        }
        Update: {
          course_slug?: string | null
          description?: string | null
          id?: string
          order_index?: number
          roadmap_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          branch_slug: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          branch_slug?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          slug: string
          title: string
        }
        Update: {
          branch_slug?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_on: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_on?: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student"
      difficulty: "beginner" | "intermediate" | "advanced"
      dsa_status: "todo" | "attempted" | "solved"
      profile_visibility: "private" | "students" | "public"
      progress_status: "not_started" | "in_progress" | "completed"
      track_kind: "programming" | "linux" | "dsa" | "core" | "career"
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
      app_role: ["admin", "moderator", "student"],
      difficulty: ["beginner", "intermediate", "advanced"],
      dsa_status: ["todo", "attempted", "solved"],
      profile_visibility: ["private", "students", "public"],
      progress_status: ["not_started", "in_progress", "completed"],
      track_kind: ["programming", "linux", "dsa", "core", "career"],
    },
  },
} as const
