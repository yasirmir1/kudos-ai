-- First, let's download and save the curriculum content
-- Download the complete curriculum content file
-- Note: You'll need to copy the content from the GitHub file and then import it

-- Create a function to import the complete curriculum content
CREATE OR REPLACE FUNCTION import_complete_curriculum_content(content_json JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    topic_record JSONB;
    content_record JSONB;
    imported_topics INTEGER := 0;
    imported_content INTEGER := 0;
BEGIN
    -- Import curriculum topics
    FOR topic_record IN SELECT * FROM jsonb_array_elements(content_json->'curriculum_topics')
    LOOP
        INSERT INTO bootcamp_curriculum_topics (
            id,
            topic_name,
            topic_order,
            module_id,
            difficulty,
            estimated_duration_minutes,
            prerequisites,
            learning_objectives,
            created_at,
            updated_at
        ) VALUES (
            topic_record->>'id',
            topic_record->>'topic_name',
            COALESCE((topic_record->>'topic_order')::INTEGER, 0),
            topic_record->>'module_id',
            COALESCE(topic_record->>'difficulty', 'foundation'),
            COALESCE((topic_record->>'estimated_duration_minutes')::INTEGER, 60),
            CASE 
                WHEN jsonb_typeof(topic_record->'prerequisites') = 'array' 
                THEN ARRAY(SELECT jsonb_array_elements_text(topic_record->'prerequisites'))
                ELSE '{}'::TEXT[]
            END,
            CASE 
                WHEN jsonb_typeof(topic_record->'learning_objectives') = 'array' 
                THEN ARRAY(SELECT jsonb_array_elements_text(topic_record->'learning_objectives'))
                ELSE '{}'::TEXT[]
            END,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            topic_name = EXCLUDED.topic_name,
            topic_order = EXCLUDED.topic_order,
            module_id = EXCLUDED.module_id,
            difficulty = EXCLUDED.difficulty,
            estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
            prerequisites = EXCLUDED.prerequisites,
            learning_objectives = EXCLUDED.learning_objectives,
            updated_at = NOW();
        
        imported_topics := imported_topics + 1;
    END LOOP;

    -- Import curriculum content
    FOR content_record IN SELECT * FROM jsonb_array_elements(content_json->'curriculum_content')
    LOOP
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
        ) ON CONFLICT (topic_id, stage_type) DO UPDATE SET
            stage_order = EXCLUDED.stage_order,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            content = EXCLUDED.content,
            estimated_time_minutes = EXCLUDED.estimated_time_minutes,
            media_urls = EXCLUDED.media_urls,
            updated_at = NOW();
        
        imported_content := imported_content + 1;
    END LOOP;

    RETURN 'Successfully imported ' || imported_topics || ' topics and ' || imported_content || ' content items';
END;
$$;