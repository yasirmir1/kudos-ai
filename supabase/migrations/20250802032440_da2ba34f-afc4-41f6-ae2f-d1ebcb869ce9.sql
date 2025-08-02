-- Row Level Security Policies for Bootcamp Enhanced Tables

-- Enable RLS on all tables
ALTER TABLE bootcamp_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_misconceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_remediation_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_enhanced_adaptive_recommendations ENABLE ROW LEVEL SECURITY;

-- Bootcamp Students policies
CREATE POLICY "Users can view their own student profile" ON bootcamp_students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student profile" ON bootcamp_students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile" ON bootcamp_students
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a security definer function to get current student ID
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID AS $$
  SELECT student_id FROM public.bootcamp_students WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Public curriculum tables - readable by authenticated users
CREATE POLICY "Authenticated users can view modules" ON bootcamp_enhanced_modules
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view topics" ON bootcamp_enhanced_topics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view subtopics" ON bootcamp_enhanced_subtopics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view questions" ON bootcamp_enhanced_questions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view answer options" ON bootcamp_enhanced_answer_options
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view misconceptions" ON bootcamp_enhanced_misconceptions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view remediation pathways" ON bootcamp_enhanced_remediation_pathways
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Student-specific data policies
CREATE POLICY "Students can view their own responses" ON bootcamp_enhanced_student_responses
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own responses" ON bootcamp_enhanced_student_responses
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can view their own skills" ON bootcamp_enhanced_student_skills
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own skills" ON bootcamp_enhanced_student_skills
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can update their own skills" ON bootcamp_enhanced_student_skills
    FOR UPDATE USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can view their own sessions" ON bootcamp_enhanced_learning_sessions
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own sessions" ON bootcamp_enhanced_learning_sessions
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can update their own sessions" ON bootcamp_enhanced_learning_sessions
    FOR UPDATE USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can view their own progress" ON bootcamp_enhanced_student_progress
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own progress" ON bootcamp_enhanced_student_progress
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can update their own progress" ON bootcamp_enhanced_student_progress
    FOR UPDATE USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can view their own achievements" ON bootcamp_enhanced_achievements
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own achievements" ON bootcamp_enhanced_achievements
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can view their own recommendations" ON bootcamp_enhanced_adaptive_recommendations
    FOR SELECT USING (student_id = public.get_current_student_id());

CREATE POLICY "Students can insert their own recommendations" ON bootcamp_enhanced_adaptive_recommendations
    FOR INSERT WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "Students can update their own recommendations" ON bootcamp_enhanced_adaptive_recommendations
    FOR UPDATE USING (student_id = public.get_current_student_id());