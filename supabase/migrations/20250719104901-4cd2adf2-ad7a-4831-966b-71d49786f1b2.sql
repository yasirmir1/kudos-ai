-- Enable Row Level Security on student_performance table
ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_performance (user-specific access)
CREATE POLICY "Users can view own performance" 
ON public.student_performance 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Users can insert own performance" 
ON public.student_performance 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update own performance" 
ON public.student_performance 
FOR UPDATE 
USING (student_id = auth.uid());