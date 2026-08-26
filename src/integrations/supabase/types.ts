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
    PostgrestVersion: "14.17"
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
      career_roles: {
        Row: {
          branch_slug: string | null
          description: string
          id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          branch_slug?: string | null
          description: string
          id?: string
          order_index?: number
          slug: string
          title: string
        }
        Update: {
          branch_slug?: string | null
          description?: string
          id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      career_step_progress: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          step_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          step_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          step_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_step_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "career_track_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      career_track_steps: {
        Row: {
          description: string
          id: string
          order_index: number
          phase: string
          route: string | null
          title: string
          track_slug: string
        }
        Insert: {
          description: string
          id?: string
          order_index?: number
          phase: string
          route?: string | null
          title: string
          track_slug: string
        }
        Update: {
          description?: string
          id?: string
          order_index?: number
          phase?: string
          route?: string | null
          title?: string
          track_slug?: string
        }
        Relationships: []
      }
      career_tracks: {
        Row: {
          branch_slug: string | null
          career_goal: string | null
          description: string
          horizon: string
          id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          branch_slug?: string | null
          career_goal?: string | null
          description: string
          horizon?: string
          id?: string
          order_index?: number
          slug: string
          title: string
        }
        Update: {
          branch_slug?: string | null
          career_goal?: string | null
          description?: string
          horizon?: string
          id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      code_challenges: {
        Row: {
          created_at: string
          hint: string | null
          id: string
          language: string
          level: string
          order_index: number
          prompt: string
          slug: string
          starter_code: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hint?: string | null
          id?: string
          language?: string
          level?: string
          order_index?: number
          prompt: string
          slug: string
          starter_code?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hint?: string | null
          id?: string
          language?: string
          level?: string
          order_index?: number
          prompt?: string
          slug?: string
          starter_code?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      code_snippets: {
        Row: {
          challenge_id: string | null
          code: string
          created_at: string
          id: string
          language: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          code?: string
          created_at?: string
          id?: string
          language?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          code?: string
          created_at?: string
          id?: string
          language?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_snippets_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "code_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_entries: {
        Row: {
          created_at: string
          feedback: Json
          id: string
          prompt_id: string
          response_text: string
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          created_at?: string
          feedback?: Json
          id?: string
          prompt_id: string
          response_text: string
          updated_at?: string
          user_id: string
          word_count?: number
        }
        Update: {
          created_at?: string
          feedback?: Json
          id?: string
          prompt_id?: string
          response_text?: string
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "communication_entries_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "communication_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_prompts: {
        Row: {
          category: string
          created_at: string
          guidance: string
          id: string
          min_words: number
          minutes: number
          order_index: number
          prompt: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          guidance: string
          id?: string
          min_words?: number
          minutes?: number
          order_index?: number
          prompt: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          guidance?: string
          id?: string
          min_words?: number
          minutes?: number
          order_index?: number
          prompt?: string
          title?: string
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
      git_progress: {
        Row: {
          created_at: string
          id: string
          status: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "git_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "git_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      git_topics: {
        Row: {
          category: string
          commands: Json
          created_at: string
          id: string
          level: string
          order_index: number
          practice: string | null
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          commands?: Json
          created_at?: string
          id?: string
          level?: string
          order_index?: number
          practice?: string | null
          slug: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          commands?: Json
          created_at?: string
          id?: string
          level?: string
          order_index?: number
          practice?: string | null
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      interview_answers: {
        Row: {
          answer_text: string
          checks: Json
          created_at: string
          id: string
          question_id: string
          self_rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_text: string
          checks?: Json
          created_at?: string
          id?: string
          question_id: string
          self_rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_text?: string
          checks?: Json
          created_at?: string
          id?: string
          question_id?: string
          self_rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          context: string | null
          created_at: string
          criteria: Json
          id: string
          keywords: Json
          level: string
          order_index: number
          question: string
          strong_answer_points: Json
          track: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          criteria?: Json
          id?: string
          keywords?: Json
          level?: string
          order_index?: number
          question: string
          strong_answer_points?: Json
          track: string
        }
        Update: {
          context?: string | null
          created_at?: string
          criteria?: Json
          id?: string
          keywords?: Json
          level?: string
          order_index?: number
          question?: string
          strong_answer_points?: Json
          track?: string
        }
        Relationships: []
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
      linkedin_drafts: {
        Row: {
          created_at: string
          draft_text: string
          id: string
          section_key: string
          self_rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_text?: string
          id?: string
          section_key: string
          self_rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_text?: string
          id?: string
          section_key?: string
          self_rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_sections: {
        Row: {
          checklist: Json
          created_at: string
          example_strong: string | null
          example_weak: string | null
          guidance: string
          id: string
          key: string
          order_index: number
          title: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          example_strong?: string | null
          example_weak?: string | null
          guidance: string
          id?: string
          key: string
          order_index?: number
          title: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          example_strong?: string | null
          example_weak?: string | null
          guidance?: string
          id?: string
          key?: string
          order_index?: number
          title?: string
        }
        Relationships: []
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
      portfolio_profiles: {
        Row: {
          bio: string
          created_at: string
          display_name: string
          github_url: string | null
          handle: string
          headline: string
          id: string
          is_public: boolean
          linkedin_url: string | null
          skills: string[]
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          bio?: string
          created_at?: string
          display_name?: string
          github_url?: string | null
          handle: string
          headline?: string
          id?: string
          is_public?: boolean
          linkedin_url?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          bio?: string
          created_at?: string
          display_name?: string
          github_url?: string | null
          handle?: string
          headline?: string
          id?: string
          is_public?: boolean
          linkedin_url?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
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
      project_ideas: {
        Row: {
          created_at: string
          domain: string
          id: string
          level: string
          order_index: number
          skills: string[]
          slug: string
          suggested_milestones: string[]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string
          id?: string
          level?: string
          order_index?: number
          skills?: string[]
          slug: string
          suggested_milestones?: string[]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          level?: string
          order_index?: number
          skills?: string[]
          slug?: string
          suggested_milestones?: string[]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_done: boolean
          order_index: number
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          order_index?: number
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          order_index?: number
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analyses: {
        Row: {
          created_at: string
          id: string
          job_description: string
          job_title: string
          results: Json
          resume_id: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_description?: string
          job_title?: string
          results?: Json
          resume_id?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_description?: string
          job_title?: string
          results?: Json
          resume_id?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string
          data: Json
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      role_skill_targets: {
        Row: {
          id: string
          role_slug: string
          skill_slug: string
          target_level: number
          weight: number
        }
        Insert: {
          id?: string
          role_slug: string
          skill_slug: string
          target_level?: number
          weight?: number
        }
        Update: {
          id?: string
          role_slug?: string
          skill_slug?: string
          target_level?: number
          weight?: number
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          description: string | null
          id: string
          name: string
          order_index: number
          slug: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
        }
        Relationships: []
      }
      sql_attempts: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          query_text: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          query_text?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          query_text?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sql_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "sql_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      sql_exercises: {
        Row: {
          created_at: string
          expected_result: string
          id: string
          level: string
          order_index: number
          prompt: string
          scenario: string
          schema_sql: string
          slug: string
          solution_sql: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_result: string
          id?: string
          level?: string
          order_index?: number
          prompt: string
          scenario: string
          schema_sql: string
          slug: string
          solution_sql: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_result?: string
          id?: string
          level?: string
          order_index?: number
          prompt?: string
          scenario?: string
          schema_sql?: string
          slug?: string
          solution_sql?: string
          title?: string
          updated_at?: string
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
      user_projects: {
        Row: {
          created_at: string
          id: string
          idea_id: string | null
          live_url: string | null
          repo_url: string | null
          show_in_portfolio: boolean
          started_on: string
          status: string
          summary: string
          tech_stack: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id?: string | null
          live_url?: string | null
          repo_url?: string | null
          show_in_portfolio?: boolean
          started_on?: string
          status?: string
          summary?: string
          tech_stack?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string | null
          live_url?: string | null
          repo_url?: string | null
          show_in_portfolio?: boolean
          started_on?: string
          status?: string
          summary?: string
          tech_stack?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "project_ideas"
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
      user_skill_ratings: {
        Row: {
          created_at: string
          evidence: string | null
          id: string
          level: number
          skill_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          id?: string
          level?: number
          skill_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: string | null
          id?: string
          level?: number
          skill_slug?: string
          updated_at?: string
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
