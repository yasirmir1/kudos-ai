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
      bootcamp_achievements: {
        Row: {
          achievement_id: string
          achievement_name: string | null
          achievement_type: string | null
          badge_url: string | null
          created_at: string | null
          earned_at: string | null
          points_awarded: number | null
          student_id: string
        }
        Insert: {
          achievement_id?: string
          achievement_name?: string | null
          achievement_type?: string | null
          badge_url?: string | null
          created_at?: string | null
          earned_at?: string | null
          points_awarded?: number | null
          student_id: string
        }
        Update: {
          achievement_id?: string
          achievement_name?: string | null
          achievement_type?: string | null
          badge_url?: string | null
          created_at?: string | null
          earned_at?: string | null
          points_awarded?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_adaptive_recommendations: {
        Row: {
          completed: boolean | null
          content: Json | null
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          priority: number | null
          recommendation_id: string
          recommendation_type: string | null
          student_id: string
        }
        Insert: {
          completed?: boolean | null
          content?: Json | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          priority?: number | null
          recommendation_id?: string
          recommendation_type?: string | null
          student_id: string
        }
        Update: {
          completed?: boolean | null
          content?: Json | null
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          priority?: number | null
          recommendation_id?: string
          recommendation_type?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_adaptive_recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_adaptive_recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_answer_options: {
        Row: {
          answer_id: string
          answer_value: string
          created_at: string | null
          diagnostic_feedback: string | null
          error_category: string | null
          is_correct: boolean | null
          misconception_code: string | null
          option_letter: string | null
          question_id: string
          remedial_topic: string | null
          selection_count: number | null
        }
        Insert: {
          answer_id?: string
          answer_value: string
          created_at?: string | null
          diagnostic_feedback?: string | null
          error_category?: string | null
          is_correct?: boolean | null
          misconception_code?: string | null
          option_letter?: string | null
          question_id: string
          remedial_topic?: string | null
          selection_count?: number | null
        }
        Update: {
          answer_id?: string
          answer_value?: string
          created_at?: string | null
          diagnostic_feedback?: string | null
          error_category?: string | null
          is_correct?: boolean | null
          misconception_code?: string | null
          option_letter?: string | null
          question_id?: string
          remedial_topic?: string | null
          selection_count?: number | null
        }
        Relationships: []
      }
      bootcamp_assessment_criteria: {
        Row: {
          accuracy_range: string
          confidence_level: string
          mastery_level: string
          speed_level: string
        }
        Insert: {
          accuracy_range: string
          confidence_level: string
          mastery_level: string
          speed_level: string
        }
        Update: {
          accuracy_range?: string
          confidence_level?: string
          mastery_level?: string
          speed_level?: string
        }
        Relationships: []
      }
      bootcamp_curricula: {
        Row: {
          created_at: string | null
          exam_boards: string[]
          id: string
          name: string
          total_weeks: number
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          exam_boards: string[]
          id: string
          name: string
          total_weeks: number
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          exam_boards?: string[]
          id?: string
          name?: string
          total_weeks?: number
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      bootcamp_curriculum_content: {
        Row: {
          content: Json
          created_at: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          media_urls: string[] | null
          stage_order: number
          stage_type: string
          title: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          media_urls?: string[] | null
          stage_order?: number
          stage_type: string
          title?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          media_urls?: string[] | null
          stage_order?: number
          stage_type?: string
          title?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_curriculum_metadata: {
        Row: {
          category: string
          created_at: string | null
          data: Json
          id: string
          metadata_type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          data: Json
          id?: string
          metadata_type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          data?: Json
          id?: string
          metadata_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_curriculum_questions: {
        Row: {
          content_id: string
          correct_answer: string | null
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          hints: string[] | null
          id: string
          options: Json | null
          points: number | null
          question_order: number
          question_text: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          content_id: string
          correct_answer?: string | null
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          hints?: string[] | null
          id?: string
          options?: Json | null
          points?: number | null
          question_order?: number
          question_text: string
          question_type: string
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          correct_answer?: string | null
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          hints?: string[] | null
          id?: string
          options?: Json | null
          points?: number | null
          question_order?: number
          question_text?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_curriculum_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_curriculum_content"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_difficulty_levels: {
        Row: {
          color: string
          description: string
          level_name: string
          score_range_max: number
          score_range_min: number
          typical_age: string
        }
        Insert: {
          color: string
          description: string
          level_name: string
          score_range_max: number
          score_range_min: number
          typical_age: string
        }
        Update: {
          color?: string
          description?: string
          level_name?: string
          score_range_max?: number
          score_range_min?: number
          typical_age?: string
        }
        Relationships: []
      }
      bootcamp_learning_sessions: {
        Row: {
          created_at: string | null
          performance_score: number | null
          questions_attempted: number | null
          questions_correct: number | null
          session_end: string | null
          session_id: string
          session_start: string | null
          session_type: string | null
          student_id: string | null
          topics_covered: string[] | null
        }
        Insert: {
          created_at?: string | null
          performance_score?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          session_end?: string | null
          session_id?: string
          session_start?: string | null
          session_type?: string | null
          student_id?: string | null
          topics_covered?: string[] | null
        }
        Update: {
          created_at?: string | null
          performance_score?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          session_end?: string | null
          session_id?: string
          session_start?: string | null
          session_type?: string | null
          student_id?: string | null
          topics_covered?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_learning_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_learning_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_misconceptions_catalog: {
        Row: {
          category: string
          common_indicators: string[] | null
          created_at: string | null
          description: string
          exam_board: string | null
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
          exam_board?: string | null
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
          exam_board?: string | null
          id?: number
          misconception_id?: string
          misconception_name?: string
          related_topics?: string[] | null
          remediation_strategy?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_mock_test_answers: {
        Row: {
          answered_at: string | null
          assignment_id: string
          created_at: string | null
          is_correct: boolean | null
          misconception_detected: string | null
          question_id: string
          question_order: number
          session_id: string
          student_answer: string | null
          time_taken_seconds: number | null
        }
        Insert: {
          answered_at?: string | null
          assignment_id?: string
          created_at?: string | null
          is_correct?: boolean | null
          misconception_detected?: string | null
          question_id: string
          question_order: number
          session_id: string
          student_answer?: string | null
          time_taken_seconds?: number | null
        }
        Update: {
          answered_at?: string | null
          assignment_id?: string
          created_at?: string | null
          is_correct?: boolean | null
          misconception_detected?: string | null
          question_id?: string
          question_order?: number
          session_id?: string
          student_answer?: string | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_mock_test_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_mock_test_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      bootcamp_mock_test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          questions_attempted: number | null
          questions_correct: number | null
          session_data: Json | null
          session_id: string
          session_type: string | null
          started_at: string | null
          status: string | null
          student_id: string
          time_limit_seconds: number | null
          time_spent_seconds: number | null
          total_questions: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          session_data?: Json | null
          session_id?: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          student_id: string
          time_limit_seconds?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          session_data?: Json | null
          session_id?: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          time_limit_seconds?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_mock_test_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_mock_test_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_modules: {
        Row: {
          created_at: string | null
          curriculum_id: string
          description: string | null
          id: string
          module_order: number
          name: string
          weeks: number[]
          weeks_allocated: number | null
        }
        Insert: {
          created_at?: string | null
          curriculum_id: string
          description?: string | null
          id: string
          module_order: number
          name: string
          weeks: number[]
          weeks_allocated?: number | null
        }
        Update: {
          created_at?: string | null
          curriculum_id?: string
          description?: string | null
          id?: string
          module_order?: number
          name?: string
          weeks?: number[]
          weeks_allocated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_modules_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_question_types: {
        Row: {
          boards: string[]
          format: string
          id: string
          name: string
          timing: string
        }
        Insert: {
          boards: string[]
          format: string
          id: string
          name: string
          timing: string
        }
        Update: {
          boards?: string[]
          format?: string
          id?: string
          name?: string
          timing?: string
        }
        Relationships: []
      }
      bootcamp_questions: {
        Row: {
          cognitive_level: Database["public"]["Enums"]["cognitive_level"]
          correct_answer: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_boards: string[] | null
          explanation: string | null
          id: number
          marks: number
          module_id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          prerequisite_skills: string[] | null
          question_category: Database["public"]["Enums"]["question_category"]
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subtopic_name: string | null
          success_rate: number | null
          time_seconds: number
          topic_id: string
          updated_at: string | null
          usage_count: number | null
          visual_aid: string | null
          visual_aid_url: string | null
        }
        Insert: {
          cognitive_level: Database["public"]["Enums"]["cognitive_level"]
          correct_answer?: string
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_boards?: string[] | null
          explanation?: string | null
          id?: number
          marks?: number
          module_id: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          prerequisite_skills?: string[] | null
          question_category: Database["public"]["Enums"]["question_category"]
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subtopic_name?: string | null
          success_rate?: number | null
          time_seconds?: number
          topic_id: string
          updated_at?: string | null
          usage_count?: number | null
          visual_aid?: string | null
          visual_aid_url?: string | null
        }
        Update: {
          cognitive_level?: Database["public"]["Enums"]["cognitive_level"]
          correct_answer?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_boards?: string[] | null
          explanation?: string | null
          id?: number
          marks?: number
          module_id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          prerequisite_skills?: string[] | null
          question_category?: Database["public"]["Enums"]["question_category"]
          question_id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          subtopic_name?: string | null
          success_rate?: number | null
          time_seconds?: number
          topic_id?: string
          updated_at?: string | null
          usage_count?: number | null
          visual_aid?: string | null
          visual_aid_url?: string | null
        }
        Relationships: []
      }
      bootcamp_remediation_pathways: {
        Row: {
          created_at: string | null
          estimated_duration_days: number | null
          misconception_code: string | null
          pathway_id: string
          pathway_name: string | null
          stages: Json | null
          success_rate: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_duration_days?: number | null
          misconception_code?: string | null
          pathway_id: string
          pathway_name?: string | null
          stages?: Json | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_duration_days?: number | null
          misconception_code?: string | null
          pathway_id?: string
          pathway_name?: string | null
          stages?: Json | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bootcamp_skills: {
        Row: {
          category: string
          skill_name: string
          skill_order: number
        }
        Insert: {
          category: string
          skill_name: string
          skill_order: number
        }
        Update: {
          category?: string
          skill_name?: string
          skill_order?: number
        }
        Relationships: []
      }
      bootcamp_student_progress: {
        Row: {
          accuracy_percentage: number | null
          average_speed_seconds: number | null
          created_at: string | null
          last_activity: string | null
          mastery_score: number | null
          module_id: string | null
          progress_id: string
          status: string | null
          student_id: string | null
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy_percentage?: number | null
          average_speed_seconds?: number | null
          created_at?: string | null
          last_activity?: string | null
          mastery_score?: number | null
          module_id?: string | null
          progress_id?: string
          status?: string | null
          student_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy_percentage?: number | null
          average_speed_seconds?: number | null
          created_at?: string | null
          last_activity?: string | null
          mastery_score?: number | null
          module_id?: string | null
          progress_id?: string
          status?: string | null
          student_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_student_responses: {
        Row: {
          attempt_number: number | null
          confidence_rating: number | null
          created_at: string | null
          id: number
          is_correct: boolean
          misconception_detected: string | null
          question_id: string
          required_hint: boolean | null
          responded_at: string | null
          response_id: string
          selected_answer: string
          session_id: string | null
          student_id: string
          time_taken: number
        }
        Insert: {
          attempt_number?: number | null
          confidence_rating?: number | null
          created_at?: string | null
          id?: number
          is_correct: boolean
          misconception_detected?: string | null
          question_id: string
          required_hint?: boolean | null
          responded_at?: string | null
          response_id?: string
          selected_answer: string
          session_id?: string | null
          student_id: string
          time_taken: number
        }
        Update: {
          attempt_number?: number | null
          confidence_rating?: number | null
          created_at?: string | null
          id?: number
          is_correct?: boolean
          misconception_detected?: string | null
          question_id?: string
          required_hint?: boolean | null
          responded_at?: string | null
          response_id?: string
          selected_answer?: string
          session_id?: string | null
          student_id?: string
          time_taken?: number
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_student_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "bootcamp_student_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_student_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_student_skills: {
        Row: {
          active_misconceptions: string[] | null
          average_time_seconds: number | null
          created_at: string | null
          last_assessed: string | null
          misconceptions_cleared: string[] | null
          proficiency_level: number | null
          questions_attempted: number | null
          questions_correct: number | null
          skill_category: string | null
          skill_id: string
          skill_name: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          active_misconceptions?: string[] | null
          average_time_seconds?: number | null
          created_at?: string | null
          last_assessed?: string | null
          misconceptions_cleared?: string[] | null
          proficiency_level?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          skill_category?: string | null
          skill_id?: string
          skill_name?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active_misconceptions?: string[] | null
          average_time_seconds?: number | null
          created_at?: string | null
          last_assessed?: string | null
          misconceptions_cleared?: string[] | null
          proficiency_level?: number | null
          questions_attempted?: number | null
          questions_correct?: number | null
          skill_category?: string | null
          skill_id?: string
          skill_name?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "bootcamp_student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      bootcamp_students: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          exam_boards: string[] | null
          last_active: string | null
          school_year: number | null
          student_id: string
          subscription_tier: string | null
          success_rate: number | null
          target_exam_date: string | null
          usage_count: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          exam_boards?: string[] | null
          last_active?: string | null
          school_year?: number | null
          student_id?: string
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          usage_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          exam_boards?: string[] | null
          last_active?: string | null
          school_year?: number | null
          student_id?: string
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          usage_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      bootcamp_subtopics: {
        Row: {
          created_at: string | null
          id: number
          learning_objectives: string[] | null
          name: string
          prerequisite_subtopics: string[] | null
          subtopic_order: number
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          learning_objectives?: string[] | null
          name: string
          prerequisite_subtopics?: string[] | null
          subtopic_order: number
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          learning_objectives?: string[] | null
          name?: string
          prerequisite_subtopics?: string[] | null
          subtopic_order?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bootcamp_subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_topics_with_subtopics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "bootcamp_subtopics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_analysis"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "fk_subtopics_topic_id"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subtopics_topic_id"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_topics_with_subtopics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "fk_subtopics_topic_id"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_analysis"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      bootcamp_topics: {
        Row: {
          created_at: string | null
          difficulty: string
          estimated_questions: number | null
          id: string
          module_id: string
          name: string
          skills: string[]
          topic_order: number
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          estimated_questions?: number | null
          id: string
          module_id: string
          name: string
          skills: string[]
          topic_order: number
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          estimated_questions?: number | null
          id?: string
          module_id?: string
          name?: string
          skills?: string[]
          topic_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_modules"
            referencedColumns: ["id"]
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
      learning_results: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          responded_at: string | null
          selected_answer: string | null
          session_type: string | null
          student_id: string
          time_taken_seconds: number | null
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id: string
          responded_at?: string | null
          selected_answer?: string | null
          session_type?: string | null
          student_id: string
          time_taken_seconds?: number | null
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          responded_at?: string | null
          selected_answer?: string | null
          session_type?: string | null
          student_id?: string
          time_taken_seconds?: number | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_students"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "learning_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      mock_test_questions: {
        Row: {
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          exam_board: string | null
          explanation: string | null
          id: string
          is_active: boolean
          marks: number
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question_id: string
          question_text: string
          question_type: string
          subtopic: string | null
          tags: string[] | null
          time_seconds: number
          topic: string
          updated_at: string
          visual_aid_url: string | null
          year_level: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          exam_board?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          marks?: number
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_id: string
          question_text: string
          question_type?: string
          subtopic?: string | null
          tags?: string[] | null
          time_seconds?: number
          topic: string
          updated_at?: string
          visual_aid_url?: string | null
          year_level?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          exam_board?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          marks?: number
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_id?: string
          question_text?: string
          question_type?: string
          subtopic?: string | null
          tags?: string[] | null
          time_seconds?: number
          topic?: string
          updated_at?: string
          visual_aid_url?: string | null
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
      subscription_exemptions: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          exemption_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          exemption_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          exemption_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          allows_bootcamp: boolean | null
          allows_daily_mode: boolean | null
          created_at: string | null
          description: string | null
          features: Json
          id: string
          name: string
          price_monthly: number
          trial_days: number | null
        }
        Insert: {
          allows_bootcamp?: boolean | null
          allows_daily_mode?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json
          id: string
          name: string
          price_monthly: number
          trial_days?: number | null
        }
        Update: {
          allows_bootcamp?: boolean | null
          allows_daily_mode?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          name?: string
          price_monthly?: number
          trial_days?: number | null
        }
        Relationships: []
      }
      unified_profiles: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"] | null
          created_at: string | null
          current_level: string | null
          date_of_birth: string | null
          email: string
          exam_boards: string[] | null
          id: string
          is_admin: boolean | null
          last_active: string | null
          school_year: number | null
          subscription_tier: string | null
          success_rate: number | null
          target_exam_date: string | null
          updated_at: string | null
          usage_count: number | null
          username: string | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          created_at?: string | null
          current_level?: string | null
          date_of_birth?: string | null
          email: string
          exam_boards?: string[] | null
          id: string
          is_admin?: boolean | null
          last_active?: string | null
          school_year?: number | null
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          username?: string | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"] | null
          created_at?: string | null
          current_level?: string | null
          date_of_birth?: string | null
          email?: string
          exam_boards?: string[] | null
          id?: string
          is_admin?: boolean | null
          last_active?: string | null
          school_year?: number | null
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          username?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          is_trial: boolean | null
          plan_id: string
          status: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_trial?: boolean | null
          plan_id: string
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_trial?: boolean | null
          plan_id?: string
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bootcamp_students_view: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          exam_boards: string[] | null
          last_active: string | null
          school_year: number | null
          student_id: string | null
          subscription_tier: string | null
          success_rate: number | null
          target_exam_date: string | null
          usage_count: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          exam_boards?: string[] | null
          last_active?: string | null
          school_year?: number | null
          student_id?: string | null
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          usage_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          exam_boards?: string[] | null
          last_active?: string | null
          school_year?: number | null
          student_id?: string | null
          subscription_tier?: string | null
          success_rate?: number | null
          target_exam_date?: string | null
          usage_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      bootcamp_topics_with_subtopics: {
        Row: {
          difficulty: string | null
          estimated_questions: number | null
          module_id: string | null
          subtopics: Json | null
          topic_id: string | null
          topic_name: string | null
          topic_order: number | null
          topic_skills: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_modules"
            referencedColumns: ["id"]
          },
        ]
      }
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
      student_performance_summary: {
        Row: {
          active_days: number | null
          avg_response_time: number | null
          overall_accuracy: number | null
          student_id: string | null
          total_correct: number | null
          total_questions_attempted: number | null
          unique_misconceptions: number | null
          username: string | null
        }
        Relationships: []
      }
      topic_difficulty_analysis: {
        Row: {
          avg_time: number | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          question_count: number | null
          students_attempted: number | null
          success_rate: number | null
          topic_id: string | null
          topic_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootcamp_generate_adaptive_practice_set: {
        Args: { p_student_id: string; p_question_count?: number }
        Returns: {
          question_id: string
          reason: string
          priority: number
        }[]
      }
      bootcamp_update_student_misconceptions: {
        Args: { p_student_id: string; p_response_id: string }
        Returns: undefined
      }
      bootcamp_update_student_progress: {
        Args: { p_student_id: string; p_topic_id: string }
        Returns: undefined
      }
      bootcamp_update_student_skill_proficiency: {
        Args: { p_student_id: string; p_skill_name: string }
        Returns: undefined
      }
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
      get_current_student_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_student_misconceptions: {
        Args: { p_student_id: string }
        Returns: {
          red_herring: string
          frequency: number
          topics: string[]
        }[]
      }
      get_unified_student_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_weak_topics: {
        Args: { p_student_id: string }
        Returns: {
          topic: string
          accuracy: number
          attempts: number
        }[]
      }
      import_complete_curriculum_content: {
        Args: { content_json: Json }
        Returns: string
      }
      import_curriculum_json: {
        Args: { json_data: Json }
        Returns: undefined
      }
      import_curriculum_json_skip_duplicates: {
        Args: { json_data: Json }
        Returns: undefined
      }
      import_mock_test_questions: {
        Args: { questions_data: Json }
        Returns: string
      }
      start_trial: {
        Args: { plan_id_param: string }
        Returns: Json
      }
      user_has_feature_access: {
        Args: { feature_type: string }
        Returns: boolean
      }
    }
    Enums: {
      age_group: "year 2-3" | "year 4-5" | "11+"
      answer_option: "A" | "B" | "C" | "D"
      cognitive_level:
        | "recall"
        | "application"
        | "analysis"
        | "synthesis"
        | "knowledge"
        | "comprehension"
        | "evaluation"
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
      cognitive_level: [
        "recall",
        "application",
        "analysis",
        "synthesis",
        "knowledge",
        "comprehension",
        "evaluation",
      ],
      difficulty_level: ["foundation", "intermediate", "advanced"],
      question_category: ["arithmetic", "reasoning", "mixed"],
      question_type: ["multiple_choice", "numeric_entry", "multi_step"],
    },
  },
} as const
