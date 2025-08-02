-- Insert Module 3 information
INSERT INTO bootcamp_modules (
  id, 
  name, 
  curriculum_id, 
  module_order, 
  description,
  weeks
) VALUES (
  'mod3',
  'Fractions, Decimals & Percentages',
  'complete_course',
  3,
  'Work confidently with fractions, convert between FDP, calculate with decimals, and solve percentage problems',
  ARRAY[9, 10, 11, 12]
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  weeks = EXCLUDED.weeks;

-- Create a curriculum metadata table for storing implementation notes and progression details
CREATE TABLE IF NOT EXISTS bootcamp_curriculum_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the metadata table
ALTER TABLE bootcamp_curriculum_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for curriculum metadata
CREATE POLICY "Anyone can view curriculum metadata" 
ON bootcamp_curriculum_metadata FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert curriculum metadata" 
ON bootcamp_curriculum_metadata FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert skill development data
INSERT INTO bootcamp_curriculum_metadata (metadata_type, category, data) VALUES
('skill_development', 'foundational_skills', '["number_sense", "place_value", "basic_operations", "mental_math"]'::jsonb),
('skill_development', 'intermediate_skills', '["fractions", "decimals", "algebraic_thinking", "geometric_reasoning"]'::jsonb),
('skill_development', 'advanced_skills', '["problem_solving", "pattern_recognition", "logical_reasoning", "exam_technique"]'::jsonb);

-- Insert module progression data
INSERT INTO bootcamp_curriculum_metadata (metadata_type, category, data) VALUES
('module_progression', 'mod3', '{
  "module_name": "Fractions, Decimals & Percentages",
  "learning_path": ["fdp1", "fdp2", "fdp3", "fdp4", "fdp5", "fdp6", "fdp7", "fdp8"],
  "prerequisites": ["division", "place_value"],
  "outcomes": [
    "Work confidently with fractions",
    "Convert between FDP", 
    "Calculate with decimals",
    "Solve percentage problems"
  ]
}'::jsonb);

-- Insert implementation notes
INSERT INTO bootcamp_curriculum_metadata (metadata_type, category, data) VALUES
('implementation', 'content_delivery', '{
  "slide_format": "Each stage represents 4-6 slides in the app",
  "interactivity": "Every concept should have interactive elements", 
  "assessment": "Continuous assessment with immediate feedback",
  "differentiation": "Content adapts based on student performance"
}'::jsonb),
('implementation', 'media_requirements', '{
  "images": "High-quality diagrams and real-world photos",
  "videos": "2-3 minute explanatory videos per topic",
  "animations": "Interactive animations for key concepts", 
  "audio": "Optional audio narration for accessibility"
}'::jsonb),
('implementation', 'best_practices', '{
  "engagement": "Start with real-world connections",
  "scaffolding": "Build complexity gradually",
  "practice": "Provide varied practice opportunities",
  "feedback": "Immediate, specific, and encouraging"
}'::jsonb);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_curriculum_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bootcamp_curriculum_metadata_updated_at
  BEFORE UPDATE ON bootcamp_curriculum_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_curriculum_metadata_updated_at();