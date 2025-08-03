-- Unify user system across main app and bootcamp
-- This migration creates a unified user profiles system

-- First, create a unified profiles table that combines both systems
CREATE TABLE IF NOT EXISTS public.unified_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  date_of_birth DATE,
  school_year INTEGER,
  target_exam_date DATE,
  exam_boards TEXT[],
  age_group age_group DEFAULT 'year 4-5'::age_group,
  current_level TEXT DEFAULT 'beginner',
  subscription_tier TEXT DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.unified_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for unified profiles
CREATE POLICY "Users can view their own profile"
  ON public.unified_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.unified_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.unified_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Migrate existing data from student_profiles to unified_profiles
INSERT INTO public.unified_profiles (
  id, email, age_group, target_exam_date, current_level, 
  is_admin, created_at, last_active, updated_at
)
SELECT 
  id, 
  email, 
  age_group, 
  target_exam_date, 
  current_level, 
  is_admin, 
  created_at,
  created_at as last_active,
  now() as updated_at
FROM public.student_profiles
ON CONFLICT (id) DO NOTHING;

-- Migrate existing data from bootcamp_students to unified_profiles
INSERT INTO public.unified_profiles (
  id, email, username, date_of_birth, school_year, target_exam_date,
  exam_boards, subscription_tier, usage_count, success_rate,
  created_at, last_active, updated_at
)
SELECT 
  user_id, 
  email, 
  username, 
  date_of_birth, 
  school_year, 
  target_exam_date,
  exam_boards, 
  subscription_tier, 
  usage_count, 
  success_rate,
  created_at,
  last_active,
  now() as updated_at
FROM public.bootcamp_students
WHERE user_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  date_of_birth = EXCLUDED.date_of_birth,
  school_year = EXCLUDED.school_year,
  exam_boards = EXCLUDED.exam_boards,
  subscription_tier = EXCLUDED.subscription_tier,
  usage_count = EXCLUDED.usage_count,
  success_rate = EXCLUDED.success_rate,
  last_active = EXCLUDED.last_active;

-- Create or replace the unified user creation function
CREATE OR REPLACE FUNCTION public.handle_unified_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.unified_profiles (
    id, 
    email, 
    username,
    age_group,
    created_at,
    last_active,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(
      CASE (NEW.raw_user_meta_data ->> 'age_group')
        WHEN '6-7' THEN 'year 2-3'::age_group
        WHEN 'year 2-3' THEN 'year 2-3'::age_group
        WHEN '8-9' THEN 'year 4-5'::age_group
        WHEN 'year 4-5' THEN 'year 4-5'::age_group
        WHEN '10-11' THEN '11+'::age_group
        WHEN '11+' THEN '11+'::age_group
        ELSE 'year 4-5'::age_group
      END,
      'year 4-5'::age_group
    ),
    now(),
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_unified ON auth.users;
CREATE TRIGGER on_auth_user_created_unified
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unified_new_user();

-- Create function to get unified student ID for backwards compatibility
CREATE OR REPLACE FUNCTION public.get_unified_student_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.unified_profiles WHERE id = auth.uid();
$$;

-- Create view for bootcamp_students backwards compatibility
CREATE OR REPLACE VIEW public.bootcamp_students_view AS
SELECT 
  up.id as student_id,
  up.id as user_id,
  up.username,
  up.email,
  up.date_of_birth,
  up.school_year,
  up.target_exam_date,
  up.exam_boards,
  up.created_at,
  up.last_active,
  up.subscription_tier,
  up.usage_count,
  up.success_rate
FROM public.unified_profiles up;

-- Update RLS policies for bootcamp tables to use unified_profiles
-- Update bootcamp_student_responses policies
DROP POLICY IF EXISTS "Users can insert their own bootcamp responses" ON public.bootcamp_student_responses;
CREATE POLICY "Users can insert their own bootcamp responses"
  ON public.bootcamp_student_responses
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT id FROM public.unified_profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can view their own bootcamp responses" ON public.bootcamp_student_responses;  
CREATE POLICY "Users can view their own bootcamp responses"
  ON public.bootcamp_student_responses
  FOR SELECT
  USING (student_id IN (
    SELECT id FROM public.unified_profiles WHERE id = auth.uid()
  ));

-- Update student_answers policies to use unified_profiles
DROP POLICY IF EXISTS "Users can insert own answers" ON public.student_answers;
CREATE POLICY "Users can insert own answers"
  ON public.student_answers
  FOR INSERT
  WITH CHECK (student_id IN (
    SELECT id FROM public.unified_profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can view own answers" ON public.student_answers;
CREATE POLICY "Users can view own answers"
  ON public.student_answers
  FOR SELECT
  USING (student_id IN (
    SELECT id FROM public.unified_profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger for unified_profiles
CREATE OR REPLACE FUNCTION public.update_unified_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_unified_profiles_updated_at
  BEFORE UPDATE ON public.unified_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unified_profiles_updated_at();