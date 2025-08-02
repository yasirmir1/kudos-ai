-- Unify topic system: Keep only bootcamp_topics (56 topics) and remove bootcamp_curriculum_topics

-- First, update any references from bootcamp_curriculum_topics to bootcamp_topics
UPDATE bootcamp_curriculum_content 
SET topic_id = bt.id 
FROM bootcamp_topics bt 
WHERE bootcamp_curriculum_content.topic_id IN (
    SELECT id FROM bootcamp_curriculum_topics 
    WHERE topic_name = bt.name
);

-- Update bootcamp_questions to reference bootcamp_topics
UPDATE bootcamp_questions 
SET topic_id = bt.id 
FROM bootcamp_topics bt 
WHERE bootcamp_questions.topic_id IN (
    SELECT id FROM bootcamp_curriculum_topics 
    WHERE topic_name = bt.name
);

-- Update bootcamp_student_progress to reference bootcamp_topics
UPDATE bootcamp_student_progress 
SET topic_id = bt.id 
FROM bootcamp_topics bt 
WHERE bootcamp_student_progress.topic_id IN (
    SELECT id FROM bootcamp_curriculum_topics 
    WHERE topic_name = bt.name
);

-- Update learning_results to reference bootcamp_topics
UPDATE learning_results 
SET topic_id = bt.id 
FROM bootcamp_topics bt 
WHERE learning_results.topic_id IN (
    SELECT id FROM bootcamp_curriculum_topics 
    WHERE topic_name = bt.name
);

-- Now safely drop the old bootcamp_curriculum_topics table
DROP TABLE IF EXISTS bootcamp_curriculum_topics CASCADE;

-- Update the import function to work with unified topics
CREATE OR REPLACE FUNCTION public.import_complete_curriculum_content(content_json jsonb)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    topic_record JSONB;
    content_record JSONB;
    imported_topics INTEGER := 0;
    imported_content INTEGER := 0;
BEGIN
    -- Import curriculum topics into bootcamp_topics (skip if exists)
    FOR topic_record IN SELECT * FROM jsonb_array_elements(content_json->'curriculum_topics')
    LOOP
        INSERT INTO bootcamp_topics (
            id,
            name,
            module_id,
            difficulty,
            topic_order,
            estimated_questions,
            skills
        ) VALUES (
            topic_record->>'id',
            topic_record->>'topic_name',
            topic_record->>'module_id',
            COALESCE(topic_record->>'difficulty', 'foundation'),
            COALESCE((topic_record->>'topic_order')::INTEGER, 0),
            COALESCE((topic_record->>'estimated_duration_minutes')::INTEGER, 60),
            CASE 
                WHEN jsonb_typeof(topic_record->'learning_objectives') = 'array' 
                THEN ARRAY(SELECT jsonb_array_elements_text(topic_record->'learning_objectives'))
                ELSE '{}'::TEXT[]
            END
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            module_id = EXCLUDED.module_id,
            difficulty = EXCLUDED.difficulty,
            topic_order = EXCLUDED.topic_order,
            estimated_questions = EXCLUDED.estimated_questions,
            skills = EXCLUDED.skills;
        
        imported_topics := imported_topics + 1;
    END LOOP;

    -- Import curriculum content
    FOR content_record IN SELECT * FROM jsonb_array_elements(content_json->'curriculum_content')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM bootcamp_curriculum_content 
            WHERE topic_id = content_record->>'topic_id' 
            AND stage_type = content_record->>'stage_type'
        ) THEN
            INSERT INTO bootcamp_curriculum_content (
                topic_id,
                stage_type,
                stage_order,
                title,
                description,
                content,
                estimated_time_minutes,
                media_urls,
                created_at,
                updated_at
            ) VALUES (
                content_record->>'topic_id',
                content_record->>'stage_type',
                COALESCE((content_record->>'stage_order')::INTEGER, 1),
                content_record->>'title',
                content_record->>'description',
                content_record->'content',
                COALESCE((content_record->>'estimated_time_minutes')::INTEGER, 10),
                CASE 
                    WHEN jsonb_typeof(content_record->'media_urls') = 'array' 
                    THEN ARRAY(SELECT jsonb_array_elements_text(content_record->'media_urls'))
                    ELSE '{}'::TEXT[]
                END,
                NOW(),
                NOW()
            );
        END IF;
        
        imported_content := imported_content + 1;
    END LOOP;

    RETURN 'Successfully imported ' || imported_topics || ' topics and ' || imported_content || ' content items';
END;
$function$;