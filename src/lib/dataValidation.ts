import { z } from 'zod';

// Question validation schema
export const QuestionSchema = z.object({
  question_id: z.string().min(1, 'Question ID is required'),
  question_text: z.string().min(1, 'Question text is required'),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_answer: z.enum(['A', 'B', 'C', 'D'], {
    errorMap: () => ({ message: 'Correct answer must be A, B, C, or D' })
  }),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['foundation', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Difficulty must be foundation, intermediate, or advanced' })
  }),
  marks: z.number().min(1, 'Marks must be at least 1').max(10, 'Marks cannot exceed 10'),
  time_seconds: z.number().min(30, 'Time must be at least 30 seconds').max(600, 'Time cannot exceed 10 minutes')
});

// Student response validation schema
export const StudentResponseSchema = z.object({
  student_id: z.string().uuid('Invalid student ID format'),
  question_id: z.string().min(1, 'Question ID is required'),
  selected_answer: z.enum(['A', 'B', 'C', 'D'], {
    errorMap: () => ({ message: 'Selected answer must be A, B, C, or D' })
  }),
  time_taken: z.number().min(0, 'Time taken cannot be negative').max(3600, 'Time taken cannot exceed 1 hour'),
  is_correct: z.boolean(),
  session_id: z.string().uuid('Invalid session ID format').optional(),
  misconception_detected: z.string().optional()
});

// Session validation schema
export const SessionSchema = z.object({
  student_id: z.string().uuid('Invalid student ID format'),
  session_type: z.enum(['practice', 'mock_test', 'diagnostic', 'review'], {
    errorMap: () => ({ message: 'Invalid session type' })
  }),
  total_questions: z.number().min(1, 'Must have at least 1 question').max(100, 'Cannot exceed 100 questions'),
  time_limit_seconds: z.number().min(60, 'Minimum 1 minute').max(7200, 'Maximum 2 hours').optional()
});

// Progress validation schema
export const ProgressSchema = z.object({
  student_id: z.string().uuid('Invalid student ID format'),
  topic_id: z.string().min(1, 'Topic ID is required'),
  accuracy_percentage: z.number().min(0, 'Accuracy cannot be negative').max(100, 'Accuracy cannot exceed 100%'),
  mastery_score: z.number().min(0, 'Mastery score cannot be negative').max(1, 'Mastery score cannot exceed 1')
});

// Validation utilities
export class DataValidator {
  static validateQuestion(data: unknown) {
    try {
      return { success: true, data: QuestionSchema.parse(data), errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, data: null, errors: error.errors };
      }
      return { success: false, data: null, errors: [{ message: 'Unknown validation error' }] };
    }
  }

  static validateStudentResponse(data: unknown) {
    try {
      return { success: true, data: StudentResponseSchema.parse(data), errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, data: null, errors: error.errors };
      }
      return { success: false, data: null, errors: [{ message: 'Unknown validation error' }] };
    }
  }

  static validateSession(data: unknown) {
    try {
      return { success: true, data: SessionSchema.parse(data), errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, data: null, errors: error.errors };
      }
      return { success: false, data: null, errors: [{ message: 'Unknown validation error' }] };
    }
  }

  static validateProgress(data: unknown) {
    try {
      return { success: true, data: ProgressSchema.parse(data), errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, data: null, errors: error.errors };
      }
      return { success: false, data: null, errors: [{ message: 'Unknown validation error' }] };
    }
  }
}

// Sanitization utilities
export class DataSanitizer {
  static sanitizeHtml(input: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '');
  }

  static sanitizeText(input: string): string {
    // Remove potentially dangerous characters but preserve educational content
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Decode basic entities
      .trim();
  }

  static validateAndSanitizeQuestion(question: any) {
    const validation = DataValidator.validateQuestion(question);
    
    if (!validation.success) {
      return validation;
    }

    // Sanitize text fields
    const sanitized = {
      ...validation.data,
      question_text: this.sanitizeHtml(validation.data.question_text),
      option_a: this.sanitizeText(validation.data.option_a),
      option_b: this.sanitizeText(validation.data.option_b),
      option_c: validation.data.option_c ? this.sanitizeText(validation.data.option_c) : undefined,
      option_d: validation.data.option_d ? this.sanitizeText(validation.data.option_d) : undefined,
      topic: this.sanitizeText(validation.data.topic)
    };

    return { success: true, data: sanitized, errors: null };
  }
}

export default DataValidator;