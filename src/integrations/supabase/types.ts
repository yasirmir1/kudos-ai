export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_explanations: {
        Row: {
          created_at: string | null
          explanation: string
          explanation_type: string
          id: number
          reference_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          explanation: string
          explanation_type: string
          id?: number
          reference_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string
          explanation_type?: string
          id?: number
          reference_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_answers: {
        Row: {
          answer_id: string
          answer_option: Database["public"]["Enums"]["answer_option"] | null
          answer_value: string
          created_at: string | null
          diagnostic_feedback: string
          error_category: string | null
          id: number
          is_correct: boolean
          misconception_type: string | null
          question_id: string
          remedial_topic: string | null
        }
        Insert: {
          answer_id: string
          answer_option?: Database["public"]["Enums"]["answer_option"] | null
          answer_value: string
          created_at?: string | null
          diagnostic_feedback: string
          error_category?: string | null
          id?: number
          is_correct?: boolean
          misconception_type?: string | null
          question_id: string
          remedial_topic?: string | null
        }
        Update: {
          answer_id?: string
          answer_option?: Database["public"]["Enums"]["answer_option"] | null
          answer_value?: string
          created_at?: string | null
          diagnostic_feedback?: string
          error_category?: string | null
          id?: number
          is_correct?: boolean
          misconception_type?: string | null
          question_id?: string
          remedial_topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      bootcamp_misconceptions_catalog: {
        Row: {
          category: string
          common_indicators: string[] | null
          created_at: string | null
          description: string
          id: number
          misconception_id: string
          misconception_name: string
          related_topics: string[] | null
          remediation_strategy: string
          updated_at: string | null
        }
        Insert: {
          category: string
          common_indicators?: string[] | null
          created_at?: string | null
          description: string
          id?: number
          misconception_id: string
          misconception_name: string
          related_topics?: string[] | null
          remediation_strategy: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          common_indicators?: string[] | null
          created_at?: string | null
          description?: string
          id?: number
          misconception_id?: string
          misconception_name?: string
          related_topics?: string[] | null
          remediation_strategy?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_questions: {
        Row: {
          cognitive_level: Database["public"]["Enums"]["cognitive_level"]
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_boards: string[] | null
          id: number
          marks: number
          module_id: string
          prerequisite_skills: string[] | null
          question_category: Database["public"]["Enums"]["question_category"]
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subtopic_id: string | null
          time_seconds: number
          topic_id: string
          updated_at: string | null
          visual_aid: string | null
        }
        Insert: {
          cognitive_level: Database["public"]["Enums"]["cognitive_level"]
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_boards?: string[] | null
          id?: number
          marks?: number
          module_id: string
          prerequisite_skills?: string[] | null
          question_category: Database["public"]["Enums"]["question_category"]
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subtopic_id?: string | null
          time_seconds?: number
          topic_id: string
          updated_at?: string | null
          visual_aid?: string | null
        }
        Update: {
          cognitive_level?: Database["public"]["Enums"]["cognitive_level"]
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_boards?: string[] | null
          id?: number
          marks?: number
          module_id?: string
          prerequisite_skills?: string[] | null
          question_category?: Database["public"]["Enums"]["question_category"]
          question_id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          subtopic_id?: string | null
          time_seconds?: number
          topic_id?: string
          updated_at?: string | null
          visual_aid?: string | null
        }
        Relationships: []
      }
      bootcamp_student_profiles: {
        Row: {
          accuracy_by_topic: Json | null
          arithmetic_proficiency: number | null
          common_misconceptions: string[] | null
          created_at: string | null
          id: number
          reasoning_proficiency: number | null
          skill_strengths: Json | null
          skill_weaknesses: Json | null
          speed_percentile: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          accuracy_by_topic?: Json | null
          arithmetic_proficiency?: number | null
          common_misconceptions?: string[] | null
          created_at?: string | null
          id?: number
          reasoning_proficiency?: number | null
          skill_strengths?: Json | null
          skill_weaknesses?: Json | null
          speed_percentile?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          accuracy_by_topic?: Json | null
          arithmetic_proficiency?: number | null
          common_misconceptions?: string[] | null
          created_at?: string | null
          id?: number
          reasoning_proficiency?: number | null
          skill_strengths?: Json | null
          skill_weaknesses?: Json | null
          speed_percentile?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_student_responses: {
        Row: {
          created_at: string | null
          id: number
          is_correct: boolean
          misconception_detected: string | null
          question_id: string
          response_id: string
          selected_answer: string
          student_id: string
          time_taken: number
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_correct: boolean
          misconception_detected?: string | null
          question_id: string
          response_id?: string
          selected_answer: string
          student_id: string
          time_taken: number
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_correct?: boolean
          misconception_detected?: string | null
          question_id?: string
          response_id?: string
          selected_answer?: string
          student_id?: string
          time_taken?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_student_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      curriculum: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"] | null
          correct_answer: string
          difficulty: string
          example_question: string
          id: number
          options: Json
          pedagogical_notes: string | null
          question_id: string
          question_type: string
          red_herring_explanation: string | null
          red_herring_tag: string[] | null
          subtopic: string
          topic: string
          year_level: number | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          correct_answer: string
          difficulty: string
          example_question: string
          id?: number
          options: Json
          pedagogical_notes?: string | null
          question_id: string
          question_type: string
          red_herring_explanation?: string | null
          red_herring_tag?: string[] | null
          subtopic: string
          topic: string
          year_level?: number | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          correct_answer?: string
          difficulty?: string
          example_question?: string
          id?: number
          options?: Json
          pedagogical_notes?: string | null
          question_id?: string
          question_type?: string
          red_herring_explanation?: string | null
          red_herring_tag?: string[] | null
          subtopic?: string
          topic?: string
          year_level?: number | null
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          accuracy: number | null
          age_group: Database["public"]["Enums"]["age_group"] | null
          average_time_per_question: number | null
          correct_answers: number
          created_at: string
          difficulty_levels: string[] | null
          id: string
          session_end: string
          session_start: string
          student_id: string
          topics_covered: string[] | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          age_group?: Database["public"]["Enums"]["age_group"] | null
          average_time_per_question?: number | null
          correct_answers?: number
          created_at?: string
          difficulty_levels?: string[] | null
          id?: string
          session_end?: string
          session_start?: string
          student_id: string
          topics_covered?: string[] | null
          total_questions?: number
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          age_group?: Database["public"]["Enums"]["age_group"] | null
          average_time_per_question?: number | null
          correct_answers?: number
          created_at?: string
          difficulty_levels?: string[] | null
          id?: string
          session_end?: string
          session_start?: string
          student_id?: string
          topics_covered?: string[] | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_answers: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"] | null
          answer_given: string
          answered_at: string | null
          difficulty: string
          difficulty_appropriate: boolean | null
          id: number
          is_correct: boolean
          question_id: string | null
          red_herring_triggered: string[] | null
          student_id: string | null
          subtopic: string
          time_taken_seconds: number
          topic: string
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          answer_given: string
          answered_at?: string | null
          difficulty: string
          difficulty_appropriate?: boolean | null
          id?: number
          is_correct: boolean
          question_id?: string | null
          red_herring_triggered?: string[] | null
          student_id?: string | null
          subtopic: string
          time_taken_seconds: number
          topic: string
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          answer_given?: string
          answered_at?: string | null
          difficulty?: string
          difficulty_appropriate?: boolean | null
          id?: number
          is_correct?: boolean
          question_id?: string | null
          red_herring_triggered?: string[] | null
          student_id?: string | null
          subtopic?: string
          time_taken_seconds?: number
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "curriculum"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"] | null
          created_at: string | null
          current_level: string | null
          email: string
          id: string
          is_admin: boolean | null
          target_exam_date: string | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          created_at?: string | null
          current_level?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          target_exam_date?: string | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          created_at?: string | null
          current_level?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          target_exam_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      student_performance: {
        Row: {
          accuracy: number | null
          avg_time_seconds: number | null
          correct_answers: number | null
          last_attempted: string | null
          student_id: string | null
          topic: string | null
          total_attempts: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_standardized_question_ids: {
        Args: Record<PropertyKey, never>
        Returns: {
          old_id: string
          new_id: string
        }[]
      }
      get_adaptive_questions: {
        Args: { p_student_id: string; p_count?: number }
        Returns: {
          question: Json
        }[]
      }
      get_adaptive_questions_enhanced: {
        Args: { p_student_id: string; p_count?: number }
        Returns: {
          question_data: Json
        }[]
      }
      get_student_misconceptions: {
        Args: { p_student_id: string }
        Returns: {
          red_herring: string
          frequency: number
          topics: string[]
        }[]
      }
      get_weak_topics: {
        Args: { p_student_id: string }
        Returns: {
          topic: string
          accuracy: number
          attempts: number
        }[]
      }
      import_curriculum_json: {
        Args: { json_data: Json }
        Returns: undefined
      }
      import_curriculum_json_skip_duplicates: {
        Args: { json_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      age_group: "year 2-3" | "year 4-5" | "11+"
      answer_option: "A" | "B" | "C" | "D"
      cognitive_level: "recall" | "application" | "analysis" | "synthesis"
      difficulty_level: "foundation" | "intermediate" | "advanced"
      question_category: "arithmetic" | "reasoning" | "mixed"
      question_type: "multiple_choice" | "numeric_entry" | "multi_step"
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
      age_group: ["year 2-3", "year 4-5", "11+"],
      answer_option: ["A", "B", "C", "D"],
      cognitive_level: ["recall", "application", "analysis", "synthesis"],
      difficulty_level: ["foundation", "intermediate", "advanced"],
      question_category: ["arithmetic", "reasoning", "mixed"],
      question_type: ["multiple_choice", "numeric_entry", "multi_step"],
    },
  },
} as const
