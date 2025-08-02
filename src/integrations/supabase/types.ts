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
        Relationships: []
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
        Relationships: []
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
        ]
      }
      bootcamp_misconceptions: {
        Row: {
          created_at: string | null
          description: string | null
          diagnostic_indicators: string[] | null
          misconception_code: string
          misconception_type: string | null
          remediation_pathway_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          diagnostic_indicators?: string[] | null
          misconception_code: string
          misconception_type?: string | null
          remediation_pathway_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          diagnostic_indicators?: string[] | null
          misconception_code?: string
          misconception_type?: string | null
          remediation_pathway_id?: string | null
        }
        Relationships: []
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
      bootcamp_modules: {
        Row: {
          created_at: string | null
          curriculum_id: string
          id: string
          module_order: number
          name: string
          weeks: number[]
        }
        Insert: {
          created_at?: string | null
          curriculum_id: string
          id: string
          module_order: number
          name: string
          weeks: number[]
        }
        Update: {
          created_at?: string | null
          curriculum_id?: string
          id?: string
          module_order?: number
          name?: string
          weeks?: number[]
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
        Relationships: [
          {
            foreignKeyName: "fk_remediation_misconception"
            columns: ["misconception_code"]
            isOneToOne: false
            referencedRelation: "bootcamp_misconceptions"
            referencedColumns: ["misconception_code"]
          },
        ]
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
        ]
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
          target_exam_date: string | null
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
          target_exam_date?: string | null
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
          target_exam_date?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      bootcamp_subtopics: {
        Row: {
          created_at: string | null
          id: number
          name: string
          subtopic_order: number
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          subtopic_order: number
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
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
        ]
      }
      bootcamp_topics: {
        Row: {
          created_at: string | null
          difficulty: string
          id: string
          module_id: string
          name: string
          skills: string[]
          topic_order: number
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          id: string
          module_id: string
          name: string
          skills: string[]
          topic_order: number
        }
        Update: {
          created_at?: string | null
          difficulty?: string
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
