-- Step 1: Add new enum values and visual_data column
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'fraction_visual';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'number_line';  
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'geometry';

-- Add visual_data column to store visual tool configuration
ALTER TABLE bootcamp_questions 
ADD COLUMN IF NOT EXISTS visual_data jsonb DEFAULT NULL;