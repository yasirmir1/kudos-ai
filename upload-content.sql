-- SQL Script to Upload Learning Content to Database
-- Run this after preparing your JSON content

-- First, insert the topic into bootcamp_curriculum_topics
INSERT INTO bootcamp_curriculum_topics (
    id, 
    topic_name, 
    topic_order, 
    module_id, 
    difficulty, 
    estimated_duration_minutes, 
    prerequisites, 
    learning_objectives
) VALUES (
    'npv1',
    'Reading and Writing Large Numbers',
    1,
    'mod1', 
    'foundation',
    75,
    ARRAY['place_value', 'counting'],
    ARRAY[
        'Read numbers up to 10 million',
        'Write numbers up to 10 million in digits and words', 
        'Understand place value in large numbers',
        'Compare and order large numbers'
    ]
);

-- Insert concept introduction stage
INSERT INTO bootcamp_curriculum_content (
    topic_id,
    stage_type,
    stage_order,
    title,
    description,
    estimated_time_minutes,
    content,
    media_urls
) VALUES (
    'npv1',
    'concept_introduction',
    1,
    'Understanding Large Numbers',
    'Learn the fundamentals of reading and writing numbers up to 10 million',
    20,
    '{
        "learning_objective": "Understand how large numbers work and why they are important in everyday life",
        "introduction": "Let''s explore how to read and write really big numbers! Numbers can get huge - up to 10 million and beyond. Once you understand the pattern, it becomes much easier.",
        "concepts": [
            "Every digit has a place value - units, tens, hundreds, thousands, etc.",
            "Numbers are read from left to right in groups of three digits", 
            "Commas help us separate groups of thousands to make reading easier",
            "The position of each digit tells us its value"
        ],
        "key_example": "234,567 reads as ''two hundred thirty-four thousand, five hundred sixty-seven''",
        "visual_aids": [
            "Place value chart showing millions, thousands, and units",
            "Number line with large numbers marked",
            "Real-world examples like population signs"
        ],
        "real_world_connections": [
            "Population of cities and countries",
            "Distances in kilometers", 
            "Money values in large businesses",
            "YouTube video views and subscribers"
        ]
    }'::jsonb,
    ARRAY['/images/place-value-chart.png', '/videos/large-numbers-intro.mp4']
);

-- Insert guided practice stage  
INSERT INTO bootcamp_curriculum_content (
    topic_id,
    stage_type, 
    stage_order,
    title,
    description,
    estimated_time_minutes,
    content
) VALUES (
    'npv1',
    'guided_practice',
    2,
    'Working Through Examples Together',
    'Step-by-step practice with reading and writing large numbers',
    25,
    '{
        "introduction": "Let''s practice reading and writing large numbers together, step by step.",
        "activities": [
            {
                "title": "Reading 1,234,567",
                "type": "step_by_step",
                "example": "1,234,567",
                "steps": [
                    "Start from the left: 1 million",
                    "Next group: 234 thousand",
                    "Last group: 567 units", 
                    "Put together: One million, two hundred thirty-four thousand, five hundred sixty-seven"
                ],
                "description": "Break large numbers into manageable groups"
            }
        ],
        "checkpoints": [
            {
                "question": "In 5,426,789, what does the 4 represent?",
                "answer": "4 hundred thousand (400,000)",
                "explanation": "The 4 is in the hundred thousands place"
            }
        ]
    }'::jsonb
);

-- Insert independent practice stage
INSERT INTO bootcamp_curriculum_content (
    topic_id,
    stage_type,
    stage_order, 
    title,
    description,
    estimated_time_minutes,
    content
) VALUES (
    'npv1',
    'independent_practice',
    3,
    'Practice on Your Own',
    'Independent practice problems to build confidence',
    20,
    '{
        "introduction": "Now it''s your turn! Practice reading and writing large numbers independently.",
        "exercises": [
            {
                "title": "Number Recognition",
                "instruction": "Write these numbers in words",
                "problems": ["1,234,567", "5,000,042", "9,876,543", "2,500,000"]
            }
        ],
        "self_check": [
            "Can you read any 7-digit number confidently?",
            "Do you understand what each digit position represents?",
            "Can you write numbers from words without help?"
        ]
    }'::jsonb
);

-- Insert assessment stage
INSERT INTO bootcamp_curriculum_content (
    topic_id,
    stage_type,
    stage_order,
    title, 
    description,
    estimated_time_minutes,
    content
) VALUES (
    'npv1',
    'assessment',
    4,
    'Show What You Know',
    'Assessment to demonstrate mastery of large numbers',
    10,
    '{
        "introduction": "Time to show what you''ve learned about reading and writing large numbers!",
        "assessment_questions": [
            {
                "id": "q1",
                "question": "Write 3,456,789 in words",
                "type": "text_entry",
                "correct_answer": "Three million, four hundred fifty-six thousand, seven hundred eighty-nine",
                "points": 2,
                "explanation": "Break into groups: 3 million + 456 thousand + 789"
            }
        ],
        "success_criteria": {
            "passing_score": 80,
            "total_points": 5,
            "minimum_correct": 4
        },
        "feedback": {
            "excellent": "Outstanding! You''ve mastered large numbers! 🎉",
            "good": "Great work! You understand large numbers well! 👍",
            "needs_work": "Good try! Let''s practice a bit more. 💪"
        }
    }'::jsonb
);