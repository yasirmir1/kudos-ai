-- Create a function to generate standardized question IDs
CREATE OR REPLACE FUNCTION generate_question_id(topic_name TEXT)
RETURNS TEXT AS $$
DECLARE
    topic_prefix TEXT;
    next_number INTEGER;
    new_id TEXT;
BEGIN
    -- Map topics to 3-letter prefixes
    topic_prefix := CASE 
        WHEN topic_name ILIKE '%algebra%' THEN 'ALG'
        WHEN topic_name ILIKE '%number%' AND topic_name ILIKE '%place%' THEN 'NPV'
        WHEN topic_name ILIKE '%number%' AND (topic_name ILIKE '%addition%' OR topic_name ILIKE '%subtraction%') THEN 'NAS'
        WHEN topic_name ILIKE '%number%' AND (topic_name ILIKE '%multiplication%' OR topic_name ILIKE '%division%') THEN 'NMD'
        WHEN topic_name ILIKE '%number%' AND topic_name ILIKE '%fraction%' THEN 'NFR'
        WHEN topic_name ILIKE '%number%' AND topic_name ILIKE '%decimal%' THEN 'NDC'
        WHEN topic_name ILIKE '%number%' AND topic_name ILIKE '%percent%' THEN 'NPC'
        WHEN topic_name ILIKE '%number%' AND topic_name ILIKE '%ratio%' THEN 'NRT'
        WHEN topic_name ILIKE '%number%' THEN 'NUM'
        WHEN topic_name ILIKE '%geometry%' THEN 'GEO'
        WHEN topic_name ILIKE '%measure%' THEN 'MEA'
        WHEN topic_name ILIKE '%statistic%' THEN 'STA'
        WHEN topic_name ILIKE '%probability%' THEN 'PRB'
        ELSE 'GEN'
    END;
    
    -- Get the next number for this prefix
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(question_id FROM '^' || topic_prefix || '([0-9]+)$') AS INTEGER)), 0
    ) + 1
    INTO next_number
    FROM curriculum 
    WHERE question_id ~ ('^' || topic_prefix || '[0-9]+$');
    
    -- Generate the new ID with zero-padding
    new_id := topic_prefix || LPAD(next_number::TEXT, 3, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create a temporary table to map old IDs to new IDs
CREATE TEMP TABLE question_id_mapping AS
SELECT 
    question_id as old_id,
    generate_question_id(topic) as new_id,
    topic
FROM curriculum 
WHERE question_id !~ '^[A-Z]{3}[0-9]{3}$';

-- Update student_answers first with the new question_ids
UPDATE student_answers 
SET question_id = mapping.new_id
FROM question_id_mapping mapping
WHERE student_answers.question_id = mapping.old_id;

-- Now update curriculum with the new question_ids
UPDATE curriculum 
SET question_id = mapping.new_id
FROM question_id_mapping mapping
WHERE curriculum.question_id = mapping.old_id;

-- Create a unique index to ensure no duplicate question_ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_curriculum_question_id_unique ON curriculum(question_id);