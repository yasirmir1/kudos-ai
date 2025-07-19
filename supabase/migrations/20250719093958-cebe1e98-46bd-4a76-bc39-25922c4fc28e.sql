-- Enable RLS on curriculum table only
ALTER TABLE public.curriculum ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for curriculum (public read access)
CREATE POLICY "Anyone can view curriculum" 
ON public.curriculum 
FOR SELECT 
USING (true);