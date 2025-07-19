-- Allow authenticated users to insert curriculum questions
CREATE POLICY "Authenticated users can add curriculum" 
ON public.curriculum 
FOR INSERT 
TO authenticated 
WITH CHECK (true);