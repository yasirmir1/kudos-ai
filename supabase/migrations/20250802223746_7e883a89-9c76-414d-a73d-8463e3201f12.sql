-- Map bootcamp_subtopics to bootcamp_topics with proper foreign key relationship

-- Add foreign key constraint from bootcamp_subtopics.topic_id to bootcamp_topics.id
ALTER TABLE bootcamp_subtopics 
ADD CONSTRAINT fk_subtopics_topic_id 
FOREIGN KEY (topic_id) REFERENCES bootcamp_topics(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON bootcamp_subtopics(topic_id);

-- Update any orphaned subtopics that don't have a valid topic_id
-- First, let's see if there are any orphaned records and clean them up
DELETE FROM bootcamp_subtopics 
WHERE topic_id NOT IN (SELECT id FROM bootcamp_topics);

-- Create a view to easily query topics with their subtopics
CREATE OR REPLACE VIEW bootcamp_topics_with_subtopics AS
SELECT 
    t.id as topic_id,
    t.name as topic_name,
    t.module_id,
    t.difficulty,
    t.topic_order,
    t.estimated_questions,
    t.skills as topic_skills,
    COALESCE(
        json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'subtopic_order', s.subtopic_order,
                'learning_objectives', s.learning_objectives,
                'prerequisite_subtopics', s.prerequisite_subtopics
            ) ORDER BY s.subtopic_order
        ) FILTER (WHERE s.id IS NOT NULL), 
        '[]'::json
    ) as subtopics
FROM bootcamp_topics t
LEFT JOIN bootcamp_subtopics s ON t.id = s.topic_id
GROUP BY t.id, t.name, t.module_id, t.difficulty, t.topic_order, t.estimated_questions, t.skills
ORDER BY t.topic_order;