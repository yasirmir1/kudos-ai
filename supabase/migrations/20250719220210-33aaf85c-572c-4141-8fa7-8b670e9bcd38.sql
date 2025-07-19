-- Drop the foreign key constraint temporarily
ALTER TABLE student_answers DROP CONSTRAINT IF EXISTS student_answers_question_id_fkey;

-- Create a function to generate standardized question IDs with a counter
CREATE OR REPLACE FUNCTION generate_standardized_question_ids()
RETURNS TABLE(old_id TEXT, new_id TEXT) AS $$
DECLARE
    curr_record RECORD;
    topic_prefix TEXT;
    counters JSONB := '{}';
    counter_val INTEGER;
    new_question_id TEXT;
BEGIN
    -- Process each curriculum record that needs updating
    FOR curr_record IN 
        SELECT question_id, topic 
        FROM curriculum 
        WHERE question_id !~ '^[A-Z]{3}[0-9]{3}$'
        ORDER BY topic, question_id
    LOOP
        -- Map topics to 3-letter prefixes
        topic_prefix := CASE 
            WHEN curr_record.topic ILIKE '%algebra%' THEN 'ALG'
            WHEN curr_record.topic ILIKE '%number%' AND curr_record.topic ILIKE '%place%' THEN 'NPV'
            WHEN curr_record.topic ILIKE '%number%' AND (curr_record.topic ILIKE '%addition%' OR curr_record.topic ILIKE '%subtraction%') THEN 'NAS'
            WHEN curr_record.topic ILIKE '%number%' AND (curr_record.topic ILIKE '%multiplication%' OR curr_record.topic ILIKE '%division%') THEN 'NMD'
            WHEN curr_record.topic ILIKE '%number%' AND curr_record.topic ILIKE '%fraction%' THEN 'NFR'
            WHEN curr_record.topic ILIKE '%number%' AND curr_record.topic ILIKE '%decimal%' THEN 'NDC'
            WHEN curr_record.topic ILIKE '%number%' AND curr_record.topic ILIKE '%percent%' THEN 'NPC'
            WHEN curr_record.topic ILIKE '%number%' AND curr_record.topic ILIKE '%ratio%' THEN 'NRT'
            WHEN curr_record.topic ILIKE '%number%' THEN 'NUM'
            WHEN curr_record.topic ILIKE '%geometry%' THEN 'GEO'
            WHEN curr_record.topic ILIKE '%measure%' THEN 'MEA'
            WHEN curr_record.topic ILIKE '%statistic%' THEN 'STA'
            WHEN curr_record.topic ILIKE '%probability%' THEN 'PRB'
            ELSE 'GEN'
        END;
        
        -- Get current counter for this prefix
        counter_val := COALESCE((counters->topic_prefix)::INTEGER, 0);
        
        -- Check what's the max existing number for this prefix
        IF counter_val = 0 THEN
            SELECT COALESCE(MAX(CAST(SUBSTRING(question_id FROM '^' || topic_prefix || '([0-9]+)$') AS INTEGER)), 0)
            INTO counter_val
            FROM curriculum 
            WHERE question_id ~ ('^' || topic_prefix || '[0-9]+$');
        END IF;
        
        -- Increment counter
        counter_val := counter_val + 1;
        
        -- Update counters
        counters := jsonb_set(counters, ARRAY[topic_prefix], to_jsonb(counter_val));
        
        -- Generate new ID
        new_question_id := topic_prefix || LPAD(counter_val::TEXT, 3, '0');
        
        -- Return the mapping
        old_id := curr_record.question_id;
        new_id := new_question_id;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create the mapping and apply updates
DO $$
DECLARE
    mapping_record RECORD;
BEGIN
    -- Update student_answers first
    FOR mapping_record IN SELECT * FROM generate_standardized_question_ids() LOOP
        UPDATE student_answers 
        SET question_id = mapping_record.new_id
        WHERE question_id = mapping_record.old_id;
        
        -- Update curriculum
        UPDATE curriculum 
        SET question_id = mapping_record.new_id
        WHERE question_id = mapping_record.old_id;
    END LOOP;
END $$;

-- Recreate the foreign key constraint
ALTER TABLE student_answers 
ADD CONSTRAINT student_answers_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES curriculum(question_id);

-- Create a unique index to ensure no duplicate question_ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_curriculum_question_id_unique ON curriculum(question_id);