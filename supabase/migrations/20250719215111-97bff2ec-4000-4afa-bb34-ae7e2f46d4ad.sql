-- Create practice_sessions table to track completed practice sessions
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_questions > 0 THEN (correct_answers::numeric / total_questions::numeric) * 100
      ELSE 0
    END
  ) STORED,
  average_time_per_question NUMERIC(10,2),
  topics_covered TEXT[],
  difficulty_levels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for practice_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.practice_sessions 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own sessions" 
ON public.practice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own sessions" 
ON public.practice_sessions 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_practice_sessions_updated_at
BEFORE UPDATE ON public.practice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_practice_sessions_student_id ON public.practice_sessions(student_id);
CREATE INDEX idx_practice_sessions_session_start ON public.practice_sessions(session_start DESC);