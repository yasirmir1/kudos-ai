-- Step 2: Update questions to use visual tools now that enum values are available
-- Update specific fraction questions to use visual tools
UPDATE bootcamp_questions 
SET 
  question_type = 'fraction_visual',
  visual_data = jsonb_build_object(
    'totalParts', 8,
    'visualType', 'fraction_bar'
  )
WHERE question_id IN ('fdp1_36', 'fdp1_37', 'fdp2_39', 'fdp2_40', 'fdp2_41');

-- Update questions containing "rectangle" to use geometry visual tools
UPDATE bootcamp_questions 
SET 
  question_type = 'geometry',
  visual_data = jsonb_build_object(
    'shapeType', 'rectangle',
    'showMeasurements', true
  )
WHERE question_text ILIKE '%rectangle%';

-- Update questions containing "circle" to use geometry visual tools  
UPDATE bootcamp_questions 
SET 
  question_type = 'geometry',
  visual_data = jsonb_build_object(
    'shapeType', 'circle',
    'showMeasurements', true
  )
WHERE question_text ILIKE '%circle%';

-- Update some number-related questions to use number line
UPDATE bootcamp_questions 
SET 
  question_type = 'number_line',
  visual_data = jsonb_build_object(
    'min', 0,
    'max', 20,
    'step', 1
  )
WHERE topic_id = 'npv6' AND question_text ILIKE '%prime%';