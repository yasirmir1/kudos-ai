-- Insert sample curriculum data from the provided JSON structure

-- First, insert the topic
INSERT INTO bootcamp_curriculum_topics (id, topic_name, topic_order, difficulty, estimated_duration_minutes, learning_objectives) 
VALUES (
    'npv1',
    'Reading and Writing Large Numbers',
    1,
    'foundation',
    45,
    ARRAY['Learn to read and write large numbers up to 10,000,000', 'Understand place value', 'Write numbers in standard and word forms']
) ON CONFLICT (id) DO NOTHING;

-- Insert concept introduction stage
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes)
VALUES (
    'npv1',
    'concept_introduction',
    1,
    'Understanding Large Numbers',
    'Learn the fundamental concepts of reading and writing large numbers',
    '{
        "introduction": "Learn to read and write large numbers up to 10,000,000, understanding place value and how to write numbers in standard and word forms.",
        "key_concepts": [
            "Place value system",
            "Standard form vs word form",
            "Reading numbers systematically",
            "Writing numbers correctly"
        ],
        "example": "The number 5,203,014 is read as five million, two hundred three thousand, fourteen."
    }',
    10
) ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert guided practice stage
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes)
VALUES (
    'npv1',
    'guided_practice',
    1,
    'Guided Practice with Large Numbers',
    'Practice reading and writing large numbers with step-by-step guidance',
    '{
        "exercises": [
            "Write the following numbers in words: 3,405; 48,219; 1,302,058"
        ],
        "instructions": "Work through these examples step by step with guidance",
        "tips": [
            "Start from the largest place value",
            "Use commas to separate thousands",
            "Practice saying numbers out loud"
        ]
    }',
    15
) ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert independent practice stage
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes)
VALUES (
    'npv1',
    'independent_practice',
    1,
    'Independent Practice',
    'Apply your knowledge independently',
    '{
        "exercises": [
            "Write these numbers in numerals: Two thousand, six hundred and five; Forty-five thousand and eighty-nine; One million, three hundred twenty-two thousand, seventeen"
        ],
        "instructions": "Complete these problems on your own",
        "self_check": [
            "Check your commas are in the right places",
            "Verify the place values are correct",
            "Read your answer out loud to confirm"
        ]
    }',
    15
) ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Insert assessment stage
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes)
VALUES (
    'npv1',
    'assessment',
    1,
    'Assessment',
    'Demonstrate your mastery of large numbers',
    '{
        "instructions": "Answer these questions to show your understanding",
        "scoring": "Each question is worth equal points",
        "time_limit": "No time limit - work at your own pace"
    }',
    10
) ON CONFLICT (topic_id, stage_type, stage_order) DO NOTHING;

-- Now insert the assessment questions
INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT 
    cc.id,
    'What is the value of the 6 in 864,205?',
    'numeric_entry',
    1,
    '[]'::jsonb,
    '60000',
    1,
    'medium'
FROM bootcamp_curriculum_content cc 
WHERE cc.topic_id = 'npv1' AND cc.stage_type = 'assessment' AND cc.stage_order = 1;

INSERT INTO bootcamp_curriculum_questions (content_id, question_text, question_type, question_order, options, correct_answer, points, difficulty)
SELECT 
    cc.id,
    'Circle the number that is written correctly in words:',
    'multiple_choice',
    2,
    '[
        "Two hundred forty three thousand, ten",
        "Two hundred forty-three thousand and ten", 
        "Two hundred and forty three thousand and ten"
    ]'::jsonb,
    'Two hundred forty-three thousand and ten',
    1,
    'medium'
FROM bootcamp_curriculum_content cc 
WHERE cc.topic_id = 'npv1' AND cc.stage_type = 'assessment' AND cc.stage_order = 1;