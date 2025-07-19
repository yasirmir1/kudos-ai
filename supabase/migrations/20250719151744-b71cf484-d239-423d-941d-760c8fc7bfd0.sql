-- Create table to store AI explanations
CREATE TABLE public.ai_explanations (
  id SERIAL PRIMARY KEY,
  explanation_type TEXT NOT NULL, -- 'question_mistake', 'misconception', 'focus_area', etc.
  reference_key TEXT NOT NULL, -- unique identifier for the explanation (question_id + answer, misconception name, etc.)
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to prevent duplicate explanations
CREATE UNIQUE INDEX idx_ai_explanations_type_key ON public.ai_explanations(explanation_type, reference_key);

-- Enable RLS
ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read explanations (they're educational content)
CREATE POLICY "Anyone can view explanations" 
ON public.ai_explanations 
FOR SELECT 
USING (true);

-- Only allow system/admins to insert explanations (they'll be created by edge functions)
CREATE POLICY "System can insert explanations" 
ON public.ai_explanations 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_explanations_updated_at
    BEFORE UPDATE ON public.ai_explanations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();