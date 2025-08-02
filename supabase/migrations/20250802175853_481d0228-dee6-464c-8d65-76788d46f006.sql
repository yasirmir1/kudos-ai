-- Update the import function to handle the lack of unique constraint
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

    -- Import curriculum content (removed ON CONFLICT clause)
    FOR content_record IN SELECT * FROM jsonb_array_elements(content_json->'curriculum_content')
    LOOP
        -- Check if record already exists
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

-- Now run the import with the sample data
SELECT import_complete_curriculum_content('{
  "curriculum_metadata": {
    "version": "1.0",
    "total_topics": 56,
    "total_subtopics": 220,
    "created_date": "2024-01-15",
    "curriculum_name": "11+ Mathematics Complete Course"
  },
  "curriculum_topics": [
    {
      "id": "npv1",
      "topic_name": "Reading and Writing Large Numbers",
      "topic_order": 1,
      "module_id": "mod1",
      "difficulty": "foundation",
      "estimated_duration_minutes": 45,
      "prerequisites": [],
      "learning_objectives": [
        "Read numbers up to 1,000,000 in figures and words",
        "Write numbers up to 1,000,000 in figures and words",
        "Understand place value in large numbers",
        "Use commas correctly in large numbers"
      ]
    }
  ],
  "curriculum_content": [
    {
      "topic_id": "npv1",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "Understanding Large Numbers",
      "description": "Learn to read and write numbers up to 1,000,000",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Master reading and writing large numbers confidently",
        "introduction": "Large numbers are everywhere around us - from population counts to distances in space.",
        "concepts": [
          "Numbers are made up of digits in different place values",
          "Each position represents a power of 10"
        ],
        "key_example": "The number 456,789 is read as four hundred and fifty-six thousand, seven hundred and eighty-nine"
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Step-by-Step Number Reading",
      "description": "Practice reading large numbers with guidance",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Apply systematic approach to reading large numbers",
        "introduction": "Now lets practice reading large numbers step by step."
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "independent_practice",
      "stage_order": 3,
      "title": "Practice Reading and Writing",
      "description": "Independent practice exercises",
      "estimated_time_minutes": 10,
      "content": {
        "learning_objective": "Demonstrate mastery of reading and writing large numbers",
        "introduction": "Time to practice on your own!"
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "assessment",
      "stage_order": 4,
      "title": "Number Reading and Writing Assessment",
      "description": "Check your understanding",
      "estimated_time_minutes": 5,
      "content": {
        "learning_objective": "Demonstrate complete mastery of reading and writing large numbers",
        "introduction": "Lets check how well you have mastered reading and writing large numbers."
      }
    }
  ]
}'::jsonb);