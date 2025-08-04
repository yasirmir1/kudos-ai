-- Add visual tool support to existing questions

-- Update question types enum to include visual tool types
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'fraction_visual';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'number_line';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'geometry';

-- Add visual_data column to store visual tool configuration
ALTER TABLE bootcamp_questions 
ADD COLUMN IF NOT EXISTS visual_data jsonb DEFAULT NULL;

-- Update some fraction questions to use visual tools
UPDATE bootcamp_questions 
SET 
  question_type = 'fraction_visual',
  visual_data = jsonb_build_object(
    'totalParts', 8,
    'visualType', 'fraction_bar'
  )
WHERE question_id IN ('fdp1_36', 'fdp1_37', 'fdp2_39', 'fdp2_40', 'fdp2_41');

-- Update geometry questions to use visual tools
UPDATE bootcamp_questions 
SET 
  question_type = 'geometry',
  visual_data = jsonb_build_object(
    'shapeType', 'rectangle',
    'showMeasurements', true
  )
WHERE question_text ILIKE '%area%' OR question_text ILIKE '%rectangle%'
LIMIT 3;

-- Add some number line questions (updating existing number-related questions)
UPDATE bootcamp_questions 
SET 
  question_type = 'number_line',
  visual_data = jsonb_build_object(
    'min', 0,
    'max', 20,
    'step', 1
  )
WHERE topic_id = 'npv6' AND question_text ILIKE '%number%'
LIMIT 2;